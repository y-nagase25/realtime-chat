# Design Specification: Admin Token Usage List

## Architecture Overview

This feature adds a detailed list view of today's token usage records to the `/admin` page by extending the existing `/api/usage/daily` endpoint. The implementation follows the established three-layer architecture pattern used in the existing `DailyUsageCard` feature.

```
┌─────────────────────────────────────────────────────────────┐
│                     /admin Page (Client)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │       DailyUsageCard (existing)                       │  │
│  │  - Shows aggregated totals                            │  │
│  │  - Fetches from /api/usage/daily                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          TodayTokenUsageList Component (new)          │  │
│  │  - Renders table with token usage records             │  │
│  │  - Handles loading/empty states                       │  │
│  │  - Auto-refreshes every 60 seconds                    │  │
│  └───────────────┬───────────────────────────────────────┘  │
│                  │ uses same endpoint                        │
│  ┌───────────────▼───────────────────────────────────────┐  │
│  │       useDailyUsage Hook (reuse existing)             │  │
│  │  - Fetches data from /api/usage/daily                 │  │
│  │  - Manages loading/error states                       │  │
│  │  - Implements auto-refresh logic                      │  │
│  └───────────────┬───────────────────────────────────────┘  │
└──────────────────┼───────────────────────────────────────────┘
                   │ HTTP GET
┌──────────────────▼───────────────────────────────────────────┐
│         GET /api/usage/daily (Server - EXTENDED)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Check environment (existing)                      │  │
│  │  2. Get JST date range (existing)                     │  │
│  │  3. Query transcription data (existing)               │  │
│  │  4. Query speaking-scoring data (existing)            │  │
│  │  5. Query ALL records for today (NEW)                 │  │
│  │  6. Aggregate and return extended response (MODIFIED) │  │
│  └───────────────┬───────────────────────────────────────┘  │
└──────────────────┼───────────────────────────────────────────┘
                   │ SQL Queries (3 parallel)
┌──────────────────▼───────────────────────────────────────────┐
│                    Supabase Database                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  token_usage table                                    │  │
│  │  - Indexed by created_at (idx_token_usage_created_at) │  │
│  │  - Returns filtered records for today (JST)           │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Component Design

### Data Layer

#### Database Schema
**Table**: `token_usage` (existing, no changes required)

**Query Strategy**:
```sql
SELECT *
FROM token_usage
WHERE created_at >= '2025-12-17T00:00:00+09:00'
  AND created_at < '2025-12-18T00:00:00+09:00'
ORDER BY created_at DESC;
```

**Index Usage**:
- `idx_token_usage_created_at`: Optimizes date range queries
- Expected performance: < 200ms for 10-100 records

#### Type Definitions

**File**: `lib/types/usage-stats.ts` (extend existing types)

```typescript
/**
 * Extended DailyUsageStats response (MODIFY existing interface)
 * Adds records array and totalRecordCount to existing response
 */
export interface DailyUsageStats {
  date: string;
  timezone: string;
  transcription: {
    totalSeconds: number;
    recordCount: number;
  };
  speakingScoring: {
    totalTokens: number;
    recordCount: number;
  };
  records: TokenUsageRow[];      // NEW - all token usage records for today
  totalRecordCount: number;      // NEW - total count of all records
}

/**
 * Component state for TodayTokenUsageList (NEW interface)
 */
export interface TodayTokenUsageState {
  records: TokenUsageRow[];
  totalRecordCount: number;
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}
```

**File**: `lib/types/db.ts` (use existing types)

```typescript
// Already defined - reuse as-is
export interface TokenUsageRow {
  id: string;
  created_at: string;
  api_type: ApiType;
  model_name: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  audio_duration_seconds: number | null;
  cost_usd: number;
  metadata: Record<string, unknown> | null;
}

export type ApiType = 'text_generation' | 'transcription' | 'realtime_session';
```

#### Data Validation Rules
- `created_at`: Must be valid ISO 8601 timestamp
- `cost_usd`: Must be non-negative number
- `api_type`: Must be one of the allowed enum values
- Token counts: Can be null (for transcription records)
- Audio duration: Can be null (for text generation records)

### Business Logic Layer

#### API Route Handler (Extend Existing)

**File**: `app/api/usage/daily/route.ts` (MODIFY existing file)

**Changes Required**:
Add a third parallel query to fetch all records:

```typescript
// EXISTING: Line 32-50 (keep as-is)
const [transcriptionResult, speakingResult] = await Promise.all([...]);

// CHANGE TO: Add third query to Promise.all
const [transcriptionResult, speakingResult, allRecordsResult] = await Promise.all([
  // Query 1: transcription data (existing)
  supabase
    .from(TABLE_NAME.TOKEN_USAGE)
    .select('audio_duration_seconds')
    .eq('api_type', 'transcription')
    .eq('model_name', audioModel)
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', endOfDay.toISOString()),

  // Query 2: speaking-scoring data (existing)
  supabase
    .from(TABLE_NAME.TOKEN_USAGE)
    .select('total_tokens')
    .eq('api_type', 'transcription')
    .eq('model_name', completionModel)
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', endOfDay.toISOString()),

  // Query 3: ALL records for today (NEW)
  supabase
    .from(TABLE_NAME.TOKEN_USAGE)
    .select('*')  // Select all columns
    .gte('created_at', startOfDay.toISOString())
    .lt('created_at', endOfDay.toISOString())
    .order('created_at', { ascending: false })  // Newest first
]);
```

**Extended Response** (MODIFY existing response object):
```typescript
// ADD error handling for third query
if (allRecordsResult.error) {
  throw new Error(`All records query failed: ${allRecordsResult.error.message}`);
}

// MODIFY response object to include new fields
const allRecords = (allRecordsResult.data ?? []) as TokenUsageRow[];

const responseData: DailyUsageStats = {
  date: dateString,
  timezone: 'JST',
  transcription: {
    totalSeconds,
    recordCount: transcriptionData.length,
  },
  speakingScoring: {
    totalTokens,
    recordCount: speakingData.length,
  },
  records: allRecords,                    // NEW
  totalRecordCount: allRecords.length,    // NEW
};
```

**Caching Strategy**: Already exists (60s revalidation)

**Error Handling**: Already exists (production check, database error handling)

#### Component Hook Strategy

**Approach**: Reuse existing `useDailyUsage` hook

The component will:
1. Call existing `useDailyUsage(ADMIN_REFRESH_INTERVAL)` hook
2. Extract `records` and `totalRecordCount` from the extended response
3. No new hook needed - just consume new fields from existing hook

**Why reuse**:
- Same endpoint, same refresh logic
- Avoids duplicate API calls (both components fetch same data)
- Maintains consistency with existing patterns
- Simpler implementation

### Presentation Layer

#### Component Hierarchy

```
TodayTokenUsageList (Card wrapper)
├── CardHeader
│   ├── CardTitle: "Token Usage Records"
│   ├── CardDescription: "X records today"
│   └── CardAction: RefreshCwIcon (manual refresh)
└── CardContent
    └── Table (shadcn/ui)
        ├── TableHeader (shadcn/ui)
        │   └── TableRow (shadcn/ui)
        │       ├── TableHead: "Time"
        │       ├── TableHead: "API Type"
        │       ├── TableHead: "Model"
        │       └── TableHead: "Tokens"
        └── TableBody (shadcn/ui)
            ├── SkeletonRow (loading state)
            ├── EmptyState (TableRow with colSpan)
            └── TableRow (repeating, for each record)
                ├── TableCell: formatted time
                ├── TableCell: API type label
                ├── TableCell: model name
                └── TableCell: TokensCell component
```

**Note**: Using shadcn/ui table components (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`) for consistent styling and accessibility.

#### Component Props Design

**TodayTokenUsageList** (no props - self-contained)
```typescript
export function TodayTokenUsageList(): JSX.Element
```

**TokenUsageRow** (sub-component)
```typescript
interface TokenUsageRowProps {
  record: TokenUsageRow;
}
```

**TokensCell** (sub-component)
```typescript
interface TokensCellProps {
  apiType: ApiType;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  audioDurationSeconds: number | null;
}
```

#### State Management

**Component State** (managed by existing hook):
```typescript
const {
  transcriptionSeconds,
  speakingTokens,
  records,              // NEW field from extended response
  totalRecordCount,     // NEW field from extended response
  isLoading,
  hasError,
  refetch
} = useDailyUsage(ADMIN_REFRESH_INTERVAL);
```

**Derived State** (computed values):
```typescript
const isEmpty = !isLoading && !hasError && records.length === 0;
const hasData = !isLoading && !hasError && records.length > 0;
```

**Note**: The `useDailyUsage` hook will need to be updated to extract and return the new `records` and `totalRecordCount` fields from the API response.

#### Event Handlers

**Manual Refresh**:
```typescript
const handleRefresh = () => {
  refetch(); // Triggers re-fetch from API
};
```

**Auto-refresh**:
- Handled internally by `useDailyUsage` hook
- Uses `setInterval` with `ADMIN_REFRESH_INTERVAL` (60000ms)

## API Design

### Endpoints

#### GET /api/usage/daily (EXTENDED)

**Description**: Fetch daily usage statistics AND all token usage records for the current day (JST timezone)

**Changes from Original**:
- Response extended to include `records` array and `totalRecordCount`
- Existing fields (`transcription`, `speakingScoring`) remain unchanged
- Backward compatible - existing consumers still work

**Request**:
- Method: `GET`
- Query parameters: None
- Headers: None required
- Body: None

**Response Schema**:

**Success (200)**:
```typescript
{
  date: string;
  timezone: string;
  transcription: {
    totalSeconds: number;
    recordCount: number;
  };
  speakingScoring: {
    totalTokens: number;
    recordCount: number;
  };
  records: TokenUsageRow[];      // NEW
  totalRecordCount: number;      // NEW
}
```

**Example Response** (showing new fields):
```json
{
  "date": "2025-12-17",
  "timezone": "JST",
  "transcription": {
    "totalSeconds": 125.5,
    "recordCount": 3
  },
  "speakingScoring": {
    "totalTokens": 1250,
    "recordCount": 2
  },
  "records": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2025-12-17T14:30:45.123Z",
      "api_type": "text_generation",
      "model_name": "gpt-5-mini",
      "input_tokens": 150,
      "output_tokens": 200,
      "total_tokens": 350,
      "audio_duration_seconds": null,
      "cost_usd": 0.0012,
      "metadata": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "created_at": "2025-12-17T14:25:30.456Z",
      "api_type": "transcription",
      "model_name": "whisper-1",
      "input_tokens": null,
      "output_tokens": null,
      "total_tokens": null,
      "audio_duration_seconds": 45.2,
      "cost_usd": 0.0045,
      "metadata": null
    }
  ],
  "totalRecordCount": 5
}
```

**Error Responses** (unchanged):

**Production Environment (500)**:
```json
{
  "error": "This API is not available in production."
}
```

**Database Error (500)**:
```json
{
  "error": "Failed to fetch token usage records"
}
```

### Error Responses

| Status Code | Scenario | Response Body | Client Handling |
|-------------|----------|---------------|-----------------|
| 200 | Success | Data object | Display records |
| 500 | Production env | Error message | Show error state |
| 500 | Database error | Error message | Show error state |

**Client-side Error Handling**:
```typescript
if (!response.ok) {
  throw new Error(`API request failed with status ${response.status}`);
}
// This triggers hasError state in the component
```

## Security Design

### Environment Protection

**Access Control**:
```typescript
if (env.isProduction) {
  throw new Error('This API is not available in production.');
}
```

**Rationale**:
- Token usage data is internal monitoring data
- No business need for production access
- Reduces attack surface in production
- Consistent with existing `/api/usage/daily` pattern

### Input Validation

**No user input required**:
- Date range calculated server-side (JST)
- No query parameters to validate
- No request body to sanitize

### Data Exposure

**Safe to expose**:
- Token counts (internal metrics)
- Model names (public information)
- Costs (internal billing data)
- Timestamps (non-sensitive)

**Not exposed**:
- User IDs (not tracked in current schema)
- API keys (not stored in token_usage table)
- Request/response content (only in metadata, not displayed)

### SQL Injection Prevention

**Protected by Supabase client**:
```typescript
// Parameterized query - SQL injection safe
.gte('created_at', startOfDay.toISOString())
.lt('created_at', endOfDay.toISOString())
```

## Performance Considerations

### Database Query Optimization

**Index Utilization**:
```sql
-- Existing index will be used
CREATE INDEX idx_token_usage_created_at ON token_usage(created_at DESC);
```

**Query Performance**:
- Expected rows: 10-100 records per day
- Index scan: O(log n) for date range
- Full scan only within today's partition
- Expected query time: < 200ms

**No N+1 Problem**:
- Single query fetches all needed data
- No additional queries per record

### Caching Strategy

**Server-side Cache**:
```typescript
export const revalidate = 60; // Next.js ISR
```

**Benefits**:
- Reduces database load
- Consistent with auto-refresh interval
- Fresh data within 60 seconds

**Cache Invalidation**:
- Time-based (60 seconds)
- No manual invalidation needed (acceptable staleness)

### Client-side Performance

**Auto-refresh Rate Limiting**:
```typescript
const ADMIN_REFRESH_INTERVAL = 60000; // 60 seconds
```

**Bundle Size**:
- No new dependencies added
- Reuses existing UI components
- Minimal JavaScript payload

**Rendering Performance**:
- Expected DOM nodes: ~100-500 (for 100 records × 5 columns)
- No virtualization needed (low volume)
- Table rendering: < 100ms

### Loading State Strategy

**Progressive Enhancement**:
1. Initial render: Show loading skeleton
2. Data fetch: 200-500ms (database + network)
3. Hydration: Render full table
4. No layout shift (skeleton matches final layout)

## Error Handling Strategy

### User-facing Errors

**Scenario 1: API Unavailable**
```typescript
// UI shows: "---" placeholder in table
// User action: Wait for auto-refresh or click manual refresh
```

**Scenario 2: Empty Data**
```typescript
// UI shows: "No API calls recorded today"
// User action: None needed (informational)
```

**Scenario 3: Loading**
```typescript
// UI shows: Skeleton rows (3-5 rows)
// User action: Wait for data
```

### System Errors

**Database Connection Failure**:
```typescript
// Server log: Full error details with stack trace
// Client response: Generic error message
// Client UI: "---" placeholder
```

**Production Environment Access**:
```typescript
// Server log: "This API is not available in production."
// Client response: 500 error
// Client UI: "---" placeholder
```

### Recovery Mechanisms

**Auto-recovery**:
- Auto-refresh every 60 seconds retries failed requests
- No user intervention required

**Manual Recovery**:
- Refresh button triggers immediate retry
- Page reload resets all state

**Graceful Degradation**:
- Other admin page components continue to work
- Error does not crash entire page
- Console logs provide debugging information

## UI/UX Design Details

### Visual Design

**Color Scheme** (reuse existing):
```css
--background: #ffffff
--foreground: #171717
--muted: #f4f4f5
--muted-foreground: #71717a
--border: #e4e4e7
```

**Typography**:
- Card title: font-medium text-lg
- Table headers: text-sm font-medium text-muted-foreground
- Table cells: text-sm
- Timestamps: text-sm tabular-nums

### Layout & Spacing

**Card Layout**:
```
┌─────────────────────────────────────────────┐
│ Token Usage Records        [Record count] 🔄│
│ X records today                              │
├─────────────────────────────────────────────┤
│ Time     │ API Type    │ Model      │ Tokens│
├──────────┼─────────────┼────────────┼───────┤
│ 14:30:45 │ Text Gen    │ gpt-5-mini │ 350   │
│ 14:25:30 │ Transcribe  │ whisper-1  │ 45s   │
│ 13:42:15 │ Text Gen    │ gpt-5-mini │ 220   │
└─────────────────────────────────────────────┘
```

**Spacing**:
- Card padding: p-6
- Table row height: py-2
- Column gap: px-4
- Card gap on page: space-y-4

### Responsive Design

**Desktop (> 768px)**:
- Full table layout
- 4 columns visible
- Fixed column widths

**Mobile (< 768px)**:
- Stack columns vertically (optional enhancement)
- Or: Horizontal scroll for table
- Maintain readability

### Loading States

**Skeleton UI**:
```typescript
{isLoading && (
  <>
    <SkeletonRow />
    <SkeletonRow />
    <SkeletonRow />
  </>
)}
```

**Skeleton Row Design**:
- Same height as data row
- Shimmer animation (optional)
- Matches column structure

### Empty State

**Design**:
```typescript
{isEmpty && (
  <div className="text-center py-8 text-muted-foreground">
    No API calls recorded today
  </div>
)}
```

### Data Formatting

**Time Format**:
```typescript
// Input: "2025-12-17T14:30:45.123Z"
// Output: "14:30:45" or "2:30:45 PM"
new Date(created_at).toLocaleTimeString('en-US', {
  timeZone: 'Asia/Tokyo',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})
```

**API Type Display**:
```typescript
const API_TYPE_LABELS = {
  text_generation: 'Text Gen',
  transcription: 'Transcribe',
  realtime_session: 'Realtime'
};
```

**Token Display Logic**:
```typescript
function formatTokenDisplay(record: TokenUsageRow): string {
  if (record.api_type === 'transcription') {
    return record.audio_duration_seconds
      ? `${record.audio_duration_seconds}s`
      : '-';
  }
  return record.total_tokens?.toString() ?? '-';
}
```

## Implementation Patterns

### Code Reuse

**Utilities to Reuse**:
- `getJSTDayRange()` - Date range calculation
- `formatNumber()` - Numeric formatting
- `getSupabaseClient()` - Database client
- `prodNotFound()` - Environment check (if needed)

**Components to Reuse**:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`
- `RefreshCwIcon` from lucide-react

**Patterns to Follow**:
- Hook-based data fetching (like `useDailyUsage`)
- Fire-and-forget error handling (log but don't throw)
- Placeholder display on loading/error (like `DailyUsageCard`)

### File Organization

**Files to Modify**:
```
app/
  api/
    usage/
      daily/
        route.ts              # MODIFY - Add third query and extend response
  admin/
    page.tsx                  # MODIFY - Add TodayTokenUsageList component

lib/
  hooks/
    use-daily-usage.ts        # MODIFY - Extract and return new fields
  types/
    usage-stats.ts            # MODIFY - Extend DailyUsageStats interface
```

**Files to Create**:
```
components/
  TodayTokenUsageList.tsx     # NEW - List component for token usage records
```

**Summary**:
- 4 files modified
- 1 file created
- No new API endpoint needed (reuse existing)

### Testing Strategy

**Manual Testing Checklist**:
- [ ] View page with 0 records (empty state)
- [ ] View page with 1-10 records
- [ ] View page with 50+ records
- [ ] Verify auto-refresh (wait 60 seconds)
- [ ] Click manual refresh button
- [ ] Test in development environment
- [ ] Verify production access is blocked
- [ ] Check console for errors
- [ ] Verify all columns display correctly
- [ ] Test with different API types (text_gen, transcription)

**Data Scenarios**:
1. Empty database (new day, no API calls)
2. Text generation only
3. Transcription only
4. Mixed API types
5. Records with null token values
6. Records with null audio duration

**Edge Cases**:
- Midnight boundary (day transition)
- Timezone handling (JST vs UTC)
- Very long model names
- Very large token counts
- Network timeout
- Database connection failure
