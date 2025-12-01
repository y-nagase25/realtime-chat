# Design Specification: OpenAI API Token Usage Tracking

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Request                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                           │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐    │
│  │ /api/text    │  │ /api/transcribe│  │ /api/realtime/   │    │
│  │              │  │                │  │ session          │    │
│  └──────┬───────┘  └───────┬───────┘  └────────┬─────────┘    │
│         │                  │                     │               │
│         └──────────────────┼─────────────────────┘               │
│                            │                                     │
│                            ▼                                     │
│                   ┌────────────────┐                            │
│                   │  OpenAI API    │                            │
│                   │  Call          │                            │
│                   └────────┬───────┘                            │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │  Track Token    │ (fire-and-forget)         │
│                   │  Usage Utility  │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Supabase DB    │
                    │  token_usage    │
                    │  table          │
                    └─────────────────┘
```

### Data Flow

1. **Client → API Route**: Client makes request to OpenAI API endpoint
2. **API Route → OpenAI**: Existing logic calls OpenAI API
3. **OpenAI → API Route**: OpenAI returns response with usage data
4. **API Route → Track Utility**: Call `trackTokenUsage()` with usage data (non-blocking)
5. **Track Utility → Supabase**: Insert usage record into database
6. **API Route → Client**: Return response (doesn't wait for DB write)

### Error Handling Flow

```
trackTokenUsage()
    │
    ├─ Success → DB write completes (silent)
    │
    └─ Failure → Log error, don't throw
                 API continues normally
```

## Component Design

### Data Layer

#### Database Schema

**Table: `token_usage`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique record identifier |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp of API call |
| `api_type` | TEXT | NOT NULL, CHECK enum | API endpoint type |
| `model_name` | TEXT | NOT NULL | OpenAI model used |
| `input_tokens` | INTEGER | NULLABLE | Input tokens (text generation) |
| `output_tokens` | INTEGER | NULLABLE | Output tokens (text generation) |
| `cached_tokens` | INTEGER | NULLABLE | Cached tokens (text generation) |
| `audio_duration_seconds` | DECIMAL(10,2) | NULLABLE | Audio duration (transcription) |
| `cost_usd` | DECIMAL(10,6) | NOT NULL | Calculated cost in USD |
| `metadata` | JSONB | NULLABLE | Additional request metadata |

**Constraints:**
- `valid_text_generation`: If api_type is 'text_generation', input_tokens and output_tokens must be NOT NULL
- `valid_transcription`: If api_type is 'transcription', audio_duration_seconds must be NOT NULL

**Indexes:**
- `idx_token_usage_created_at`: B-tree index on created_at DESC (for time-range queries)
- `idx_token_usage_api_type`: B-tree index on api_type (for filtering by API)
- `idx_token_usage_model_name`: B-tree index on model_name (for model-specific analysis)

#### TypeScript Type Definitions

**File: `lib/types/database.ts`**

```typescript
// API type enum
export type ApiType = 'text_generation' | 'transcription' | 'realtime_session';

// Token usage record (insert)
export interface TokenUsageInsert {
  api_type: ApiType;
  model_name: string;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cached_tokens?: number | null;
  audio_duration_seconds?: number | null;
  cost_usd: number;
  metadata?: Record<string, unknown> | null;
}

// Token usage record (row from DB)
export interface TokenUsageRow extends TokenUsageInsert {
  id: string;
  created_at: string;
}

// Supabase database schema type
export interface Database {
  public: {
    Tables: {
      token_usage: {
        Row: TokenUsageRow;
        Insert: TokenUsageInsert;
        Update: Partial<TokenUsageInsert>;
      };
    };
  };
}
```

### Business Logic Layer

#### Supabase Client Configuration

**File: `lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

// Singleton pattern for connection pooling
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                       process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Server-side, no session persistence
    },
  });

  return supabaseClient;
}
```

**Design Decisions:**
- **Singleton pattern**: Reuse client instance for connection pooling (REQ-007)
- **Service role key priority**: Use service role key if available for backend operations
- **No session persistence**: Server-side client doesn't need session management
- **Type safety**: Generic Database type for full TypeScript inference

#### Token Usage Tracking Utility

**File: `lib/utils/track-usage.ts`**

```typescript
import { getSupabaseClient } from '@/lib/supabase';
import type { ApiType, TokenUsageInsert } from '@/lib/types/database';

/**
 * Track OpenAI API token usage in Supabase database
 *
 * This function uses a fire-and-forget pattern and will not throw errors.
 * Failed tracking attempts are logged but do not affect API responses.
 *
 * @param data - Token usage data to record
 * @returns Promise<void> - Resolves when tracking completes or fails
 */
export async function trackTokenUsage(data: TokenUsageInsert): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('token_usage')
      .insert(data);

    if (error) {
      console.error('[Token Tracking] Failed to insert usage record:', {
        error: error.message,
        code: error.code,
        details: error.details,
        api_type: data.api_type,
        model: data.model_name,
      });
    }
  } catch (error) {
    console.error('[Token Tracking] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      api_type: data.api_type,
      model: data.model_name,
    });
  }
}

/**
 * Track text generation API usage
 *
 * @param model - GPT model name
 * @param usage - OpenAI response usage object
 * @param costUsd - Calculated cost in USD
 */
export async function trackTextGeneration(
  model: string,
  usage: {
    input_tokens: number;
    output_tokens: number;
    cached_tokens?: number;
  },
  costUsd: number
): Promise<void> {
  await trackTokenUsage({
    api_type: 'text_generation',
    model_name: model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cached_tokens: usage.cached_tokens || null,
    cost_usd: costUsd,
  });
}

/**
 * Track Whisper transcription API usage
 *
 * @param durationSeconds - Audio duration in seconds
 * @param costUsd - Calculated cost in USD
 */
export async function trackTranscription(
  durationSeconds: number,
  costUsd: number
): Promise<void> {
  await trackTokenUsage({
    api_type: 'transcription',
    model_name: 'whisper-1',
    audio_duration_seconds: durationSeconds,
    cost_usd: costUsd,
  });
}

/**
 * Track Realtime API session creation
 *
 * @param model - Realtime model name
 */
export async function trackRealtimeSession(model: string): Promise<void> {
  // Realtime sessions don't have upfront cost calculation
  // Cost is determined by actual usage during the session
  await trackTokenUsage({
    api_type: 'realtime_session',
    model_name: model,
    cost_usd: 0, // Session creation has no cost
  });
}
```

**Design Decisions:**
- **Fire-and-forget**: Functions don't throw errors (REQ-005)
- **Structured logging**: Log errors with context for debugging
- **Helper functions**: Specific functions for each API type for type safety
- **JSDoc comments**: Full documentation for maintainability (REQ-160)

### API Integration Design

#### `/api/text` Modifications

**Current Flow:**
1. Call `openai.responses.create()`
2. Extract usage data
3. Calculate cost
4. Return response

**Updated Flow:**
1. Call `openai.responses.create()`
2. Extract usage data
3. Calculate cost
4. **[NEW]** Track token usage (fire-and-forget)
5. Return response

**Implementation:**

```typescript
// Add import
import { trackTextGeneration } from '@/lib/utils/track-usage';

// After cost calculation (around line 21)
const usage = response.usage;
const costData = calculateCost(usage, MODEL);

// Track usage (fire-and-forget)
if (usage && costData) {
  const totalCostNumeric = parseFloat(costData.totalCost.replace('$', ''));
  trackTextGeneration(MODEL, usage, totalCostNumeric)
    .catch(() => {}); // Errors already logged internally
}

return NextResponse.json({ output: response.output });
```

#### `/api/transcribe` Modifications

**Current Flow:**
1. Parse audio file from FormData
2. Call `openai.audio.transcriptions.create()`
3. Return transcription result

**Updated Flow:**
1. Parse audio file from FormData
2. Call `openai.audio.transcriptions.create()`
3. **[NEW]** Calculate duration and cost
4. **[NEW]** Track token usage (fire-and-forget)
5. Return transcription result

**Implementation:**

```typescript
// Add imports
import { calculateWhisperCost } from '@/lib/openai';
import { trackTranscription } from '@/lib/utils/track-usage';

// After successful transcription (around line 20)
const transcription = await openai.audio.transcriptions.create({ ... });

// Calculate duration from audio file
const arrayBuffer = await audioFile.arrayBuffer();
const durationSeconds = await getAudioDuration(arrayBuffer);
const cost = calculateWhisperCost(durationSeconds);

// Track usage (fire-and-forget)
trackTranscription(durationSeconds, cost).catch(() => {});

return NextResponse.json({ transcription, success: true });
```

**Note**: Audio duration extraction requires additional implementation (see Technical Challenges)

#### `/api/realtime/session` Modifications

**Current Flow:**
1. Build session config
2. Fetch ephemeral token from OpenAI
3. Return session data

**Updated Flow:**
1. Build session config
2. Fetch ephemeral token from OpenAI
3. **[NEW]** Track session creation (fire-and-forget)
4. Return session data

**Implementation:**

```typescript
// Add import
import { trackRealtimeSession } from '@/lib/utils/track-usage';

// After successful session creation (around line 43)
const data: SessionResponseType = await response.json();

// Track session creation (fire-and-forget)
const model = data.session?.model || 'gpt-realtime-mini';
trackRealtimeSession(model).catch(() => {});

return NextResponse.json({
  clientSecret: data.value,
  expiresAt: data.expires_at,
  session: data.session,
});
```

## Technical Challenges & Solutions

### Challenge 1: Audio Duration Extraction

**Problem**: Whisper API doesn't return audio duration in the response.

**Solution Options:**

1. **Client-side duration** (Recommended for MVP):
   - Add `duration` field to FormData from client
   - Client calculates duration using `HTMLAudioElement` before upload
   - Backend uses provided duration value

2. **Server-side duration parsing** (More accurate):
   - Use `music-metadata` npm package to parse audio file metadata
   - Extract duration from audio file headers
   - More accurate but adds dependency

**Recommendation**: Start with client-side duration (simpler), migrate to server-side if needed.

### Challenge 2: Fire-and-Forget Implementation

**Problem**: Should tracking block API response or run asynchronously?

**Solution**: Use promise without await + catch for fire-and-forget:

```typescript
// Don't await - let it run in background
trackTokenUsage(data).catch(() => {});

// Return response immediately
return NextResponse.json({ ... });
```

**Why this works:**
- Next.js keeps the Node.js event loop alive until promise settles
- Errors are caught and logged internally
- API response returns immediately
- No additional queuing infrastructure needed

### Challenge 3: Cost Calculation for Cached Tokens

**Problem**: Current `calculateCost()` in `/api/text/route.ts` doesn't account for cached tokens.

**Solution**: Update cost calculation to use cached token pricing:

```typescript
function calculateCost(usage, model) {
  const pricing = PRICING[model];

  const inputCost = usage.input_tokens * pricing.input;
  const cachedCost = (usage.cached_tokens || 0) * pricing.cached;
  const outputCost = usage.output_tokens * pricing.output;
  const totalCost = inputCost + cachedCost + outputCost;

  return { inputCost, cachedCost, outputCost, totalCost };
}
```

## Security Design

### Environment Variables Protection

- Use `SUPABASE_SERVICE_ROLE_KEY` for backend operations (not anon key)
- Never expose service role key to client
- Validate all environment variables at startup

### Input Validation

All data inserted into database is validated:

```typescript
// Validate required fields
if (!data.api_type || !data.model_name || data.cost_usd == null) {
  throw new Error('Missing required fields');
}

// Validate enums
const validApiTypes: ApiType[] = ['text_generation', 'transcription', 'realtime_session'];
if (!validApiTypes.includes(data.api_type)) {
  throw new Error('Invalid api_type');
}

// Validate numeric values
if (data.cost_usd < 0) {
  throw new Error('cost_usd cannot be negative');
}
```

### SQL Injection Prevention

- Use Supabase client parameterized queries (automatic protection)
- Never construct SQL strings manually
- JSONB metadata field safely handles arbitrary JSON

## Performance Considerations

### Database Write Performance

**Target**: < 50ms per write operation

**Optimizations:**
1. **Indexes**: Create indexes on commonly queried columns (created_at, api_type, model_name)
2. **Fire-and-forget**: Don't block API responses waiting for DB write
3. **Connection pooling**: Reuse Supabase client instance
4. **Minimal payload**: Only store essential data, avoid large metadata

### API Response Time Impact

**Baseline**: Current API response times
- `/api/text`: ~500-1000ms (OpenAI API call)
- `/api/transcribe`: ~1-5s (audio processing)
- `/api/realtime/session`: ~200-500ms (token fetch)

**Expected Impact**: +0ms (fire-and-forget) to +50ms (if awaited)

**Recommendation**: Use fire-and-forget pattern for zero impact

### Concurrent Request Handling

**Target**: 100 concurrent requests

**Supabase Limits:**
- Free tier: 60 requests/second
- Pro tier: 700 requests/second

**Safety Margin**: At 100 concurrent requests, we're well within limits

## Error Handling Strategy

### Levels of Error Handling

**Level 1: Silent Tracking Failures**
```typescript
// trackTokenUsage() never throws
// Errors logged but not propagated
```

**Level 2: API Operation Errors**
```typescript
// API continues to work even if tracking fails
try {
  await trackTokenUsage(data);
} catch (error) {
  // Already caught inside trackTokenUsage
  // This catch is defensive programming
}
```

**Level 3: Database Connection Errors**
```typescript
// Supabase client initialization errors are thrown at startup
// Fail-fast if configuration is invalid
```

### Error Logging Format

```typescript
console.error('[Token Tracking] Failed to insert usage record:', {
  error: error.message,
  code: error.code,
  api_type: data.api_type,
  model: data.model_name,
  timestamp: new Date().toISOString(),
});
```

**Why structured logging:**
- Easy to parse and analyze
- Includes context (api_type, model)
- Helps debug production issues
- Can be integrated with logging services (Datadog, Sentry)

## Testing Strategy

### Unit Tests

**File: `lib/utils/track-usage.test.ts`**

Test cases:
- ✅ `trackTextGeneration()` inserts correct data
- ✅ `trackTranscription()` inserts correct data
- ✅ `trackRealtimeSession()` inserts correct data
- ✅ Database errors are caught and logged
- ✅ Invalid data doesn't cause crashes

### Integration Tests

**File: `app/api/text/route.test.ts`**

Test cases:
- ✅ API endpoint continues to work if tracking fails
- ✅ Token usage is recorded for successful requests
- ✅ Cost calculation matches recorded cost

### Manual Testing Checklist

- [ ] Run `/api/text` endpoint, verify record appears in Supabase dashboard
- [ ] Run `/api/transcribe` endpoint, verify record with duration appears
- [ ] Run `/api/realtime/session` endpoint, verify record appears
- [ ] Verify all cost calculations are accurate
- [ ] Test with invalid Supabase credentials (API should still work)
- [ ] Check logs for proper error messages when tracking fails
- [ ] Verify no sensitive data in metadata field

## Database Migration Plan

### Step 1: Create Table

Execute in Supabase SQL Editor:

```sql
-- Create table
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  api_type TEXT NOT NULL CHECK (api_type IN ('text_generation', 'transcription', 'realtime_session')),
  model_name TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cached_tokens INTEGER,
  audio_duration_seconds DECIMAL(10, 2),
  cost_usd DECIMAL(10, 6) NOT NULL,
  metadata JSONB,
  CONSTRAINT valid_text_generation CHECK (
    api_type != 'text_generation' OR (input_tokens IS NOT NULL AND output_tokens IS NOT NULL)
  ),
  CONSTRAINT valid_transcription CHECK (
    api_type != 'transcription' OR audio_duration_seconds IS NOT NULL
  )
);

-- Add comment to table
COMMENT ON TABLE token_usage IS 'Tracks OpenAI API token consumption and costs';

-- Add comments to columns
COMMENT ON COLUMN token_usage.api_type IS 'Type of OpenAI API used: text_generation, transcription, or realtime_session';
COMMENT ON COLUMN token_usage.cost_usd IS 'Calculated cost in USD based on model pricing';
COMMENT ON COLUMN token_usage.metadata IS 'Optional additional request data (user agent, IP, etc.)';
```

### Step 2: Create Indexes

```sql
CREATE INDEX idx_token_usage_created_at ON token_usage(created_at DESC);
CREATE INDEX idx_token_usage_api_type ON token_usage(api_type);
CREATE INDEX idx_token_usage_model_name ON token_usage(model_name);
```

### Step 3: Verify Schema

```sql
-- Check table exists
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'token_usage';

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'token_usage';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'token_usage';
```

### Step 4: Test Insert

```sql
-- Test valid inserts
INSERT INTO token_usage (api_type, model_name, input_tokens, output_tokens, cost_usd)
VALUES ('text_generation', 'gpt-5-mini', 100, 50, 0.000375);

INSERT INTO token_usage (api_type, model_name, audio_duration_seconds, cost_usd)
VALUES ('transcription', 'whisper-1', 120.5, 0.012);

INSERT INTO token_usage (api_type, model_name, cost_usd)
VALUES ('realtime_session', 'gpt-realtime-mini', 0);

-- Verify inserts
SELECT * FROM token_usage ORDER BY created_at DESC LIMIT 3;

-- Clean up test data
DELETE FROM token_usage WHERE cost_usd = 0.000375 OR cost_usd = 0.012 OR cost_usd = 0;
```

## Rollback Plan

If issues arise after deployment:

1. **Remove tracking calls** from API routes (revert code changes)
2. **Keep database table** (historical data preserved)
3. **Re-enable tracking** after fixing issues

**Note**: Tracking failures never affect API functionality, so rollback is low-priority.

## Future Enhancements (Out of Scope)

These are explicitly out of scope but documented for future consideration:

1. **Usage Analytics API**: Read endpoints for querying usage data
2. **User Dashboard**: Frontend UI to visualize token consumption
3. **Batch Writing**: Queue-based approach for high-volume scenarios
4. **Real-time WebRTC Usage**: Track actual token consumption during sessions
5. **Cost Alerts**: Notifications when spending exceeds thresholds
6. **Multi-tenant Support**: Track usage per user/organization

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-01 | 1.0 | Claude Code | Initial design specification |
