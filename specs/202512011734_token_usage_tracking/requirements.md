# Feature Requirements: OpenAI API Token Usage Tracking

## Overview
Implement a backend system to track and persist OpenAI API token consumption to Supabase database. The system will automatically record token usage for all OpenAI API calls (Realtime API, Whisper API, and Text Generation API), capturing model information, token counts, and timestamps for cost monitoring and usage analysis.

## User Stories
- As a **developer**, I want to track all OpenAI API token usage automatically so that I can monitor costs and optimize API consumption
- As a **system administrator**, I want to identify which APIs and models consume the most tokens so that I can make informed decisions about resource allocation
- As a **product owner**, I want historical usage data stored reliably so that I can analyze trends and forecast future costs

## Functional Requirements

### Must Have (P0)

- **REQ-001**: Automatically capture token usage when `/api/text` endpoint is called
  - Record input tokens, output tokens, and cached tokens
  - Store model name (gpt-5, gpt-5-mini, gpt-5-nano)
  - Calculate and store cost based on model pricing

- **REQ-002**: Automatically capture token usage when `/api/transcribe` endpoint is called
  - Record audio duration in seconds
  - Store whisper-1 model information
  - Calculate and store transcription cost ($0.006 per minute)

- **REQ-003**: Automatically capture token usage when `/api/realtime/session` endpoint is called
  - Record session token for ephemeral connections
  - Store gpt-4o-realtime-preview model information
  - Track session creation timestamp

- **REQ-004**: Store all usage records in Supabase database with the following fields:
  - `id`: UUID primary key
  - `created_at`: Timestamp of API call
  - `api_type`: String enum (text_generation, transcription, realtime_session)
  - `model_name`: String (gpt-5, whisper-1, gpt-4o-realtime-preview, etc.)
  - `input_tokens`: Integer (nullable, for text generation)
  - `output_tokens`: Integer (nullable, for text generation)
  - `cached_tokens`: Integer (nullable, for text generation)
  - `audio_duration_seconds`: Decimal (nullable, for transcription)
  - `cost_usd`: Decimal (calculated cost)
  - `metadata`: JSONB (optional additional data)

- **REQ-005**: Handle database write failures gracefully
  - Log errors when Supabase writes fail
  - Do not block API response to client
  - Return API response even if usage tracking fails

### Should Have (P1)

- **REQ-006**: Add request metadata to usage records
  - User agent string
  - Request IP address (if available)
  - Session identifier (for correlating related requests)

- **REQ-007**: Implement database connection pooling for Supabase client
  - Reuse Supabase client instance across requests
  - Configure appropriate timeout and retry settings

### Nice to Have (P2)

- **REQ-008**: Add database indexes for common query patterns
  - Index on `created_at` for time-based queries
  - Index on `api_type` for filtering by API
  - Index on `model_name` for model-specific analysis

- **REQ-009**: Implement batch writing for high-volume scenarios
  - Queue usage records in memory
  - Batch write to database every N seconds or M records

## Technical Requirements

### Data Models

#### Token Usage Table (`token_usage`)

```sql
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

CREATE INDEX idx_token_usage_created_at ON token_usage(created_at DESC);
CREATE INDEX idx_token_usage_api_type ON token_usage(api_type);
CREATE INDEX idx_token_usage_model_name ON token_usage(model_name);
```

### API Modifications

#### `/api/text` Endpoint
- **Add**: Supabase write operation after OpenAI response received
- **Input**: Existing request body (no changes)
- **Output**: Existing response format (no changes)
- **Side Effect**: Insert record into `token_usage` table

#### `/api/transcribe` Endpoint
- **Add**: Supabase write operation after Whisper transcription
- **Input**: Existing audio file upload (no changes)
- **Output**: Existing transcription response (no changes)
- **Side Effect**: Insert record into `token_usage` table

#### `/api/realtime/session` Endpoint
- **Add**: Supabase write operation after ephemeral token creation
- **Input**: Existing request body (no changes)
- **Output**: Existing session response (no changes)
- **Side Effect**: Insert record into `token_usage` table

### Environment Configuration

Required environment variables:
```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
# Optional: for service role operations
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Code Architecture

#### New Files
- `lib/supabase.ts`: Supabase client initialization and configuration
- `lib/utils/track-usage.ts`: Utility functions for recording token usage
- `lib/types/database.ts`: TypeScript types for database schema

#### Modified Files
- `app/api/text/route.ts`: Add usage tracking
- `app/api/transcribe/route.ts`: Add usage tracking
- `app/api/realtime/session/route.ts`: Add usage tracking

## Non-Functional Requirements

### Performance
- Database write operations must not add more than 50ms to API response time
- Use fire-and-forget pattern for usage tracking (non-blocking)
- Handle minimum 100 concurrent API requests without database bottlenecks

### Reliability
- Token usage tracking failures must not cause API endpoints to fail
- Implement proper error logging for debugging tracking issues
- Ensure database schema supports future schema evolution

### Security
- Use Supabase service role key for backend writes (not anon key)
- Do not expose token usage data through public API endpoints
- Validate all data before database insertion to prevent injection attacks

### Maintainability
- Use TypeScript types generated from Supabase schema
- Implement consistent error handling across all tracking points
- Add JSDoc comments for tracking utility functions

## Acceptance Criteria

- [ ] Database table `token_usage` created in Supabase with correct schema
- [ ] Supabase client properly initialized and configured in `lib/supabase.ts`
- [ ] `/api/text` endpoint records token usage for all requests
- [ ] `/api/transcribe` endpoint records audio duration and cost
- [ ] `/api/realtime/session` endpoint records session creation
- [ ] All API endpoints continue to function normally even if database write fails
- [ ] Cost calculations match the existing implementation in `/api/text`
- [ ] No sensitive information (API keys, user data) leaked in metadata
- [ ] Error logging implemented for failed database writes
- [ ] TypeScript types properly defined for all database operations
- [ ] Manual testing confirms data appears correctly in Supabase dashboard

## Out of Scope

The following items are **explicitly excluded** from this implementation:

- ❌ User authentication and authorization for viewing usage data
- ❌ Frontend UI dashboard for displaying usage statistics
- ❌ Aggregation queries or analytics endpoints
- ❌ Real-time usage alerts or notifications
- ❌ Cost budgeting or spending limits
- ❌ Multi-tenant isolation or user-specific tracking
- ❌ Export functionality (CSV, PDF reports)
- ❌ Historical data migration or backfilling
- ❌ Realtime WebRTC session token consumption tracking (only session creation)

## Dependencies

### External Systems
- **Supabase**: Existing project configured with database access
- **OpenAI API**: Already integrated, no changes needed

### Third-Party Libraries
- `@supabase/supabase-js`: ^2.x (Supabase JavaScript client)
- Existing dependencies: No additional packages required

### Prerequisites
- Supabase project URL and keys available
- Database permissions to create tables and indexes
- Environment variables configured in `.env` file

## Implementation Notes

### Cost Calculation Reference
Reuse existing cost calculation logic from `/api/text/route.ts`:
- GPT-5: Input $5/1M tokens, Output $15/1M tokens, Cached 90% discount
- GPT-5-mini: Input $0.40/1M tokens, Output $1.60/1M tokens, Cached 90% discount
- GPT-5-nano: Input $0.10/1M tokens, Output $0.40/1M tokens, Cached 90% discount
- Whisper: $0.006 per minute of audio

### Error Handling Strategy
```typescript
try {
  await trackTokenUsage(data);
} catch (error) {
  console.error('Failed to track token usage:', error);
  // Continue with API response - do not throw
}
```

### Fire-and-Forget Pattern
Token tracking should not block API responses. Consider:
- Synchronous write with try-catch (acceptable for low volume)
- Async write without await (for better performance)
- Queue-based approach (for high volume, future enhancement)

## Open Questions

None - all requirements clarified during requirements gathering phase.

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-12-01 | 1.0 | Claude Code | Initial requirements specification |
