# Design Specification: Daily Usage Dashboard

## Architecture Overview

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /app/page.tsx (Top Page)                              │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  <DailyUsageCard />                              │ │ │
│  │  │    └── useDailyUsage() hook                      │ │ │
│  │  │          - Fetches data from API                 │ │ │
│  │  │          - Manages loading/error states          │ │ │
│  │  │          - Auto-refresh (optional P1)            │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP GET /api/usage/daily
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Route                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /app/api/usage/daily/route.ts                        │ │
│  │    1. Calculate JST date range (start/end of day)    │ │
│  │    2. Query Supabase for transcription data          │ │
│  │    3. Query Supabase for speaking-scoring data       │ │
│  │    4. Aggregate and format results                   │ │
│  │    5. Return JSON response                           │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │ Supabase Client Query
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  usage_tracking table                                 │ │
│  │  - api_type (transcription | speaking-scoring)       │ │
│  │  - duration_seconds (for transcription)              │ │
│  │  - input_tokens, output_tokens (for speaking)        │ │
│  │  - created_at (timestamp with timezone)              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Sequence
```
1. User visits top page (/)
2. DailyUsageCard component mounts
3. useDailyUsage() hook initiates fetch
4. API route calculates JST date range
5. API route queries Supabase (2 queries in parallel)
6. API route aggregates results
7. JSON response sent to client
8. Component updates with data or placeholder
9. [P1] Auto-refresh triggers every 30-60s (optional)
```

## Component Design

### Data Layer

#### Type Definitions
```typescript
// lib/types/usage-stats.ts

/**
 * Raw database record from usage_tracking table
 */
export interface UsageTrackingRecord {
  id: string;
  user_id: string | null;
  api_type: 'transcription' | 'speaking-scoring';
  input_tokens: number | null;
  output_tokens: number | null;
  cached_tokens: number | null;
  duration_seconds: number | null;
  cost: number | null;
  created_at: string; // ISO 8601 timestamp
}

/**
 * API response from GET /api/usage/daily
 */
export interface DailyUsageStats {
  date: string; // YYYY-MM-DD format
  timezone: 'JST';
  transcription: {
    totalSeconds: number;
    recordCount: number;
  };
  speakingScoring: {
    totalTokens: number;
    recordCount: number;
  };
}

/**
 * API error response
 */
export interface UsageStatsError {
  error: string;
}

/**
 * Component state for displaying usage stats
 */
export interface UsageDisplayState {
  transcriptionSeconds: number | null;
  speakingTokens: number | null;
  isLoading: boolean;
  hasError: boolean;
}
```

#### Database Schema
Existing `usage_tracking` table (no changes required):

| Column | Type | Constraints | Index |
|--------|------|-------------|-------|
| id | uuid | PRIMARY KEY | ✓ |
| user_id | uuid | NULLABLE | - |
| api_type | text | NOT NULL | ✓ (recommended) |
| input_tokens | integer | NULLABLE | - |
| output_tokens | integer | NULLABLE | - |
| cached_tokens | integer | NULLABLE | - |
| duration_seconds | numeric | NULLABLE | - |
| cost | numeric | NULLABLE | - |
| created_at | timestamptz | NOT NULL, DEFAULT now() | ✓ (recommended) |

**Recommended Index** (for performance):
```sql
CREATE INDEX IF NOT EXISTS idx_usage_tracking_api_created
ON usage_tracking(api_type, created_at);
```

#### Data Validation Rules
- `api_type` must be exactly 'transcription' or 'speaking-scoring'
- `duration_seconds` should be positive number (for transcription)
- `input_tokens` and `output_tokens` should be non-negative (for speaking-scoring)
- `created_at` must be valid timestamp with timezone

### Business Logic Layer

#### Core Utility: JST Date Range Calculator
```typescript
// lib/utils/date-jst.ts

export interface JSTDateRange {
  startOfDay: Date;
  endOfDay: Date;
  dateString: string; // YYYY-MM-DD
}

/**
 * Calculate start and end of current day in JST timezone
 * @returns {JSTDateRange} Date range for current JST day
 */
export function getJSTDayRange(): JSTDateRange {
  const now = new Date();
  const JST_OFFSET = 9 * 60; // JST is UTC+9 hours in minutes

  // Convert current time to JST
  const jstNow = new Date(
    now.getTime() + (JST_OFFSET - now.getTimezoneOffset()) * 60000
  );

  // Get start of day in JST (00:00:00)
  const startOfDay = new Date(
    Date.UTC(
      jstNow.getFullYear(),
      jstNow.getMonth(),
      jstNow.getDate(),
      0, 0, 0, 0
    )
  );

  // Adjust back to UTC by subtracting JST offset
  startOfDay.setHours(startOfDay.getHours() - 9);

  // End of day is 24 hours later
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  // Format date string
  const dateString = jstNow.toISOString().split('T')[0];

  return { startOfDay, endOfDay, dateString };
}

/**
 * Format number with thousands separator
 * @param value - Number to format
 * @returns Formatted string (e.g., "1,234")
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
```

#### Core Logic: Data Aggregation
```typescript
// lib/utils/aggregate-usage.ts

import type { UsageTrackingRecord } from '@/lib/types/usage-stats';

/**
 * Calculate total transcription seconds from records
 */
export function aggregateTranscriptionSeconds(
  records: UsageTrackingRecord[]
): number {
  return records.reduce((sum, record) => {
    return sum + (record.duration_seconds ?? 0);
  }, 0);
}

/**
 * Calculate total speaking-scoring tokens from records
 */
export function aggregateSpeakingTokens(
  records: UsageTrackingRecord[]
): number {
  return records.reduce((sum, record) => {
    const inputTokens = record.input_tokens ?? 0;
    const outputTokens = record.output_tokens ?? 0;
    return sum + inputTokens + outputTokens;
  }, 0);
}
```

#### State Management: Custom Hook
```typescript
// hooks/useDailyUsage.ts

import { useEffect, useState } from 'react';
import type { UsageDisplayState, DailyUsageStats } from '@/lib/types/usage-stats';

export function useDailyUsage(refreshInterval?: number) {
  const [state, setState] = useState<UsageDisplayState>({
    transcriptionSeconds: null,
    speakingTokens: null,
    isLoading: true,
    hasError: false,
  });

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage/daily');

      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }

      const data: DailyUsageStats = await response.json();

      setState({
        transcriptionSeconds: data.transcription.totalSeconds,
        speakingTokens: data.speakingScoring.totalTokens,
        isLoading: false,
        hasError: false,
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setState({
        transcriptionSeconds: null,
        speakingTokens: null,
        isLoading: false,
        hasError: true,
      });
    }
  };

  useEffect(() => {
    fetchUsage();

    // Optional auto-refresh (P1 requirement)
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchUsage, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return state;
}
```

### Presentation Layer

#### Component Hierarchy
```
<DailyUsageCard>
  ├── <CardHeader>
  │   └── <CardTitle>Daily Usage (Today)</CardTitle>
  ├── <CardContent>
  │   ├── <UsageStat label="Transcription" value={...} unit="sec" />
  │   └── <UsageStat label="Speaking Score" value={...} unit="tokens" />
  └── (error state handled internally)
```

#### Component Implementation
```typescript
// components/DailyUsageCard.tsx

import { useDailyUsage } from '@/hooks/useDailyUsage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils/date-jst';

export function DailyUsageCard() {
  const { transcriptionSeconds, speakingTokens, isLoading, hasError } =
    useDailyUsage(60000); // 60s refresh (P1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Usage (Today)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <UsageStat
          label="Transcription"
          value={transcriptionSeconds}
          unit="sec"
          isLoading={isLoading}
          hasError={hasError}
        />
        <UsageStat
          label="Speaking Score"
          value={speakingTokens}
          unit="tokens"
          isLoading={isLoading}
          hasError={hasError}
        />
      </CardContent>
    </Card>
  );
}

interface UsageStatProps {
  label: string;
  value: number | null;
  unit: string;
  isLoading: boolean;
  hasError: boolean;
}

function UsageStat({ label, value, unit, isLoading, hasError }: UsageStatProps) {
  const displayValue = isLoading || hasError || value === null
    ? '---'
    : formatNumber(value);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="font-medium">
        {displayValue} {!isLoading && !hasError && value !== null && unit}
      </span>
    </div>
  );
}
```

#### Props and State Design

**DailyUsageCard Component**:
- Props: None (self-contained)
- State: Managed by `useDailyUsage` hook

**UsageStat Component**:
- Props: `{ label, value, unit, isLoading, hasError }`
- State: Stateless (pure presentation)

#### Event Handlers
- No user interactions required (read-only display)
- Auto-refresh handled by `useEffect` in custom hook

## API Design

### Endpoint: GET /api/usage/daily

#### Request
```
GET /api/usage/daily HTTP/1.1
Host: localhost:3000
```

**Headers**: None required (public aggregate data)

**Query Parameters**: None

**Authentication**: None required (aggregate statistics)

#### Response

**Success (200 OK)**:
```json
{
  "date": "2025-12-02",
  "timezone": "JST",
  "transcription": {
    "totalSeconds": 3456,
    "recordCount": 45
  },
  "speakingScoring": {
    "totalTokens": 12345,
    "recordCount": 23
  }
}
```

**Error (500 Internal Server Error)**:
```json
{
  "error": "Failed to fetch usage statistics"
}
```

#### Implementation Outline
```typescript
// app/api/usage/daily/route.ts

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getJSTDayRange } from '@/lib/utils/date-jst';
import {
  aggregateTranscriptionSeconds,
  aggregateSpeakingTokens
} from '@/lib/utils/aggregate-usage';

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { startOfDay, endOfDay, dateString } = getJSTDayRange();

    // Query transcription data
    const { data: transcriptionData, error: transcriptionError } =
      await supabase
        .from('usage_tracking')
        .select('duration_seconds')
        .eq('api_type', 'transcription')
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString());

    if (transcriptionError) throw transcriptionError;

    // Query speaking-scoring data
    const { data: speakingData, error: speakingError } =
      await supabase
        .from('usage_tracking')
        .select('input_tokens, output_tokens')
        .eq('api_type', 'speaking-scoring')
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString());

    if (speakingError) throw speakingError;

    // Aggregate results
    const totalSeconds = aggregateTranscriptionSeconds(transcriptionData ?? []);
    const totalTokens = aggregateSpeakingTokens(speakingData ?? []);

    return NextResponse.json({
      date: dateString,
      timezone: 'JST',
      transcription: {
        totalSeconds,
        recordCount: transcriptionData?.length ?? 0,
      },
      speakingScoring: {
        totalTokens,
        recordCount: speakingData?.length ?? 0,
      },
    });
  } catch (error) {
    console.error('Daily usage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}
```

## Security Design

### Authentication Flow
- **No authentication required**: Endpoint returns aggregate data only
- No user-specific data exposed
- Safe for public access within the application

### Authorization Checks
- No authorization needed (aggregate statistics)
- Future consideration: Add user-specific filtering if multi-tenant

### Input Validation
- No user input to validate (GET endpoint with no parameters)
- Server-side date calculation prevents tampering

### Data Security
- Only aggregate totals exposed (no individual records)
- No sensitive user information in response
- Supabase client uses parameterized queries (prevents SQL injection)

### Rate Limiting Consideration (P1)
```typescript
// Optional: Add rate limiting middleware
// Suggested: 60 requests per minute per IP

import { ratelimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... rest of implementation
}
```

## Performance Considerations

### Caching Strategy

#### HTTP Cache Headers (Recommended)
```typescript
// In API route response
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },
});
```
- Cache responses for 60 seconds
- Stale content acceptable for 5 minutes while revalidating
- Reduces database load significantly

#### Alternative: In-Memory Cache (Optional)
```typescript
// Simple in-memory cache for API route
let cachedData: DailyUsageStats | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 60 seconds

export async function GET() {
  const now = Date.now();

  if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  // Fetch fresh data and update cache
  const data = await fetchUsageData();
  cachedData = data;
  cacheTimestamp = now;

  return NextResponse.json(data);
}
```

### Query Optimization

#### Database Indexes (Highly Recommended)
```sql
-- Composite index for efficient filtering
CREATE INDEX idx_usage_tracking_api_created
ON usage_tracking(api_type, created_at);

-- Analyze query performance
EXPLAIN ANALYZE
SELECT duration_seconds
FROM usage_tracking
WHERE api_type = 'transcription'
  AND created_at >= '2025-12-02 00:00:00+09'
  AND created_at < '2025-12-03 00:00:00+09';
```

#### Parallel Queries
- Execute both queries (transcription + speaking) in parallel
- Use `Promise.all()` instead of sequential awaits

```typescript
const [transcriptionData, speakingData] = await Promise.all([
  supabase.from('usage_tracking').select('duration_seconds')...
  supabase.from('usage_tracking').select('input_tokens, output_tokens')...
]);
```

### Bundle Size Management
- Custom hook (~0.5 KB)
- Component (~1 KB)
- Type definitions (~0.3 KB)
- Total impact: ~2 KB (minimal)

### Client-Side Performance
- Lazy load component if not immediately visible
- Use React 19 suspense boundaries
- Avoid blocking page hydration

```typescript
// In app/page.tsx
const DailyUsageCard = lazy(() => import('@/components/DailyUsageCard'));

export default function Page() {
  return (
    <Suspense fallback={<DailyUsageCardSkeleton />}>
      <DailyUsageCard />
    </Suspense>
  );
}
```

## Error Handling Strategy

### Error Categories

#### 1. User-Facing Errors (Silent)
- **Display**: Show "---" placeholder
- **Log**: No client-side logging
- **Examples**:
  - Database connection failure
  - Query timeout
  - Invalid data format

#### 2. System Errors (Server-Side)
- **Display**: Generic error message to client
- **Log**: Full error details server-side
- **Examples**:
  - Supabase connection error
  - Query execution failure
  - Aggregation calculation error

#### 3. Network Errors (Client-Side)
- **Display**: Show "---" placeholder
- **Log**: Console error (development only)
- **Examples**:
  - fetch() failure
  - Network timeout
  - Invalid JSON response

### Recovery Mechanisms

#### Auto-Retry Strategy (Optional P2)
```typescript
// In useDailyUsage hook
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

#### Graceful Degradation
```typescript
// Component always renders, even with errors
if (hasError || isLoading) {
  displayValue = '---';  // Never show error message to user
}
```

#### Server-Side Error Logging
```typescript
// In API route
catch (error) {
  console.error('[DailyUsage] Error fetching stats:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    { error: 'Failed to fetch usage statistics' },
    { status: 500 }
  );
}
```

## Testing Strategy

### Unit Tests

**Date/Time Calculations** (`lib/utils/date-jst.test.ts`):
- Test JST offset calculation
- Test start/end of day boundaries
- Test date string formatting
- Test timezone edge cases (DST, leap years)

**Aggregation Logic** (`lib/utils/aggregate-usage.test.ts`):
- Test sum of duration_seconds
- Test sum of input_tokens + output_tokens
- Test null/undefined handling
- Test empty array handling

**Number Formatting** (`lib/utils/date-jst.test.ts`):
- Test thousands separator
- Test zero value
- Test large numbers

### Integration Tests

**API Route** (`app/api/usage/daily/route.test.ts`):
- Test successful response format
- Test error handling
- Test date range filtering
- Test empty database scenario

**Component** (`components/DailyUsageCard.test.tsx`):
- Test loading state display
- Test error state display
- Test successful data display
- Test number formatting

### Manual Testing Checklist
- [ ] Card displays on top page
- [ ] Loading state shows "---"
- [ ] Data loads and displays correctly
- [ ] Numbers have thousands separators
- [ ] Card styling matches existing components
- [ ] Mobile responsive layout works
- [ ] Error state shows "---" (simulate by breaking API)
- [ ] Auto-refresh works (watch network tab)
- [ ] Midnight JST reset (verify at 00:00 JST)

### Performance Validation
- [ ] API response time < 500ms (check Network tab)
- [ ] Page load not blocked by component
- [ ] No layout shift during load
- [ ] Database query uses indexes (EXPLAIN ANALYZE)

## Deployment Considerations

### Environment Variables
No new environment variables required. Existing:
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓

### Database Migrations
```sql
-- Optional but recommended: Add index for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_api_created
ON usage_tracking(api_type, created_at);
```

### Build Configuration
No changes to `next.config.js` required.

### Monitoring
Consider adding:
- API response time tracking
- Error rate monitoring
- Database query performance metrics

## Future Enhancements (Post-MVP)

### Phase 2 Features (Not in scope)
1. Historical data viewing (previous days)
2. Data visualization (charts/graphs)
3. Cost calculation display
4. Export functionality (CSV/PDF)
5. Real-time updates via WebSocket
6. Usage targets and alerts
7. User-specific breakdowns
8. Weekly/monthly aggregations

### Scalability Considerations
- Current design supports up to ~10,000 records/day
- For higher volumes, consider:
  - PostgreSQL materialized views
  - Aggregation at write time (update running totals)
  - Separate analytics database
