# Feature Requirements: Daily Usage Dashboard

## Overview
Display real-time daily usage statistics on the top page showing the total transcription seconds and speaking-scoring token usage. The statistics are fetched from the database and automatically reset at midnight Japan Standard Time (JST). This provides users with immediate visibility into their daily API usage.

## User Stories
- As a user, I want to see my daily transcription usage in seconds so that I can monitor how much I've used the Whisper API today
- As a user, I want to see my daily speaking-scoring token usage so that I can track my GPT model consumption
- As a user, I want the statistics to automatically reset at midnight JST so that I always see current day metrics
- As a user, I want to see placeholder indicators when data is loading or unavailable so that I understand the system status

## Functional Requirements

### Must Have (P0)
- **REQ-001**: Display total transcription seconds for the current day (JST)
  - Source: Sum of transcription duration from `usage_tracking` table
  - Filter: Records with `api_type = 'transcription'` and `created_at` within current JST day
  - Format: Simple number display (e.g., "3,456 seconds")

- **REQ-002**: Display total speaking-scoring token usage for the current day (JST)
  - Source: Sum of token usage from `usage_tracking` table
  - Filter: Records with `api_type = 'speaking-scoring'` and `created_at` within current JST day
  - Format: Simple number display (e.g., "12,345 tokens")

- **REQ-003**: Dashboard card component on top page
  - Location: Top page as a dedicated dashboard card/widget
  - Layout: Card with clear labels and values for both metrics
  - Styling: Consistent with existing UI components (Radix UI + Tailwind CSS)

- **REQ-004**: Automatic daily reset at midnight JST
  - Reset logic: Filter database queries by current JST date (YYYY-MM-DD)
  - Timezone handling: All date calculations use JST (UTC+9)
  - No manual reset required

- **REQ-005**: Placeholder display during loading or errors
  - Loading state: Show "---" or loading indicator when fetching data
  - Error state: Show "---" when database query fails
  - No error messages shown to user (graceful degradation)

### Should Have (P1)
- **REQ-006**: Automatic refresh mechanism
  - Update statistics periodically (e.g., every 30-60 seconds)
  - Option: Use polling or real-time updates via WebSocket

- **REQ-007**: API endpoint for fetching daily statistics
  - Endpoint: `GET /api/usage/daily`
  - Response format: JSON with `transcriptionSeconds` and `speakingTokens`
  - Include caching headers to optimize database queries

### Nice to Have (P2)
- **REQ-008**: Loading animation or skeleton screen
  - Display skeleton UI while initial data loads
  - Smooth transition to actual values

- **REQ-009**: Responsive design optimization
  - Card layout adapts to mobile, tablet, and desktop screens
  - Values remain readable on all screen sizes

## Technical Requirements

### Data Models
**Existing `usage_tracking` table** (from current implementation):
```typescript
{
  id: string (uuid)
  user_id: string | null
  api_type: 'transcription' | 'speaking-scoring'
  input_tokens: number | null
  output_tokens: number | null
  cached_tokens: number | null
  duration_seconds: number | null  // Used for transcription
  cost: number | null
  created_at: timestamp with timezone
}
```

**Query requirements**:
- Sum aggregation on `duration_seconds` for transcription
- Sum aggregation on `input_tokens + output_tokens` for speaking-scoring
- Date filtering using JST timezone (UTC+9)
- Filter by `api_type` field

### API Contracts

**New endpoint: `GET /api/usage/daily`**

Request:
```
GET /api/usage/daily
Headers:
  - None required (public endpoint showing aggregate data)
```

Response (200 OK):
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

Response (500 Error):
```json
{
  "error": "Failed to fetch usage statistics"
}
```

### UI/UX Requirements

**Dashboard Card Component**:
- Component name: `DailyUsageCard` or `UsageStatsCard`
- Location: Top page (`/` route)
- Layout structure:
  ```
  ┌─────────────────────────────────┐
  │  Daily Usage (Today)            │
  │  ───────────────────────────    │
  │  Transcription:    3,456 sec    │
  │  Speaking Score:   12,345 tokens│
  └─────────────────────────────────┘
  ```

**Visual states**:
1. Loading: Display "---" for both values
2. Loaded: Display formatted numbers with thousands separators
3. Error: Display "---" for both values (silent error handling)

**Styling**:
- Use existing Radix UI card component pattern
- Tailwind CSS classes for layout and typography
- Consistent spacing and typography with other dashboard elements

### Database Queries

**Transcription total query** (Supabase):
```typescript
const { data, error } = await supabase
  .from('usage_tracking')
  .select('duration_seconds')
  .eq('api_type', 'transcription')
  .gte('created_at', startOfDayJST)
  .lt('created_at', endOfDayJST);

const totalSeconds = data?.reduce((sum, row) => sum + (row.duration_seconds || 0), 0) || 0;
```

**Speaking-scoring total query** (Supabase):
```typescript
const { data, error } = await supabase
  .from('usage_tracking')
  .select('input_tokens, output_tokens')
  .eq('api_type', 'speaking-scoring')
  .gte('created_at', startOfDayJST)
  .lt('created_at', endOfDayJST);

const totalTokens = data?.reduce(
  (sum, row) => sum + (row.input_tokens || 0) + (row.output_tokens || 0),
  0
) || 0;
```

**JST date range calculation**:
```typescript
// Get current date in JST
const now = new Date();
const jstOffset = 9 * 60; // JST is UTC+9
const jstNow = new Date(now.getTime() + (jstOffset - now.getTimezoneOffset()) * 60000);

// Start of day in JST
const startOfDayJST = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate());
// End of day in JST
const endOfDayJST = new Date(startOfDayJST.getTime() + 24 * 60 * 60 * 1000);
```

## Non-Functional Requirements

### Performance
- **Response time**: API endpoint should respond within 500ms under normal load
- **Database optimization**: Consider adding indexes on `api_type` and `created_at` columns
- **Caching**: Consider caching results for 1-5 minutes to reduce database load
- **Client-side**: Dashboard card should not block page load (load asynchronously)

### Security
- **Data access**: Aggregate statistics only (no individual user data exposed)
- **Rate limiting**: Consider rate limiting on the API endpoint (e.g., 60 requests/minute)
- **SQL injection**: Use parameterized queries (handled by Supabase client)

### Reliability
- **Error handling**: Graceful degradation when database is unavailable
- **Fallback**: Display placeholder ("---") instead of error messages
- **Monitoring**: Log errors server-side for debugging without exposing to users

### Maintainability
- **Type safety**: Full TypeScript types for API responses and component props
- **Code organization**: Follow existing project structure (components/, app/api/)
- **Testing**: Unit tests for date/time calculations and aggregation logic

## Acceptance Criteria

- [ ] Dashboard card displays on the top page (`/` route)
- [ ] Transcription seconds show total for current JST day
- [ ] Speaking-scoring tokens show total for current JST day
- [ ] Numbers are formatted with thousands separators (e.g., "1,234")
- [ ] Statistics automatically reset at midnight JST (verified by checking at 00:00 JST)
- [ ] Placeholder ("---") displays during loading state
- [ ] Placeholder ("---") displays when database query fails
- [ ] API endpoint `/api/usage/daily` returns correct aggregated data
- [ ] Date range calculation correctly uses JST timezone (UTC+9)
- [ ] Component styling matches existing UI design system
- [ ] Page load time is not significantly impacted by statistics card
- [ ] TypeScript types are defined for all new code
- [ ] Code follows project conventions (Biome linting passes)

## Out of Scope

The following features are explicitly **NOT** included in this implementation:

- ❌ Historical data viewing (previous days, weeks, months)
- ❌ User-specific statistics (per-user breakdowns)
- ❌ Data visualization (charts, graphs, trend lines)
- ❌ Cost calculation display (focus on usage only)
- ❌ Export functionality (CSV, PDF downloads)
- ❌ Usage targets or limits (quotas, warnings)
- ❌ Real-time updates via WebSocket
- ❌ Comparison with previous periods (day-over-day, week-over-week)
- ❌ Detailed breakdowns by feature (transcription vs speaking-practice)
- ❌ Admin dashboard or analytics page
- ❌ Email notifications for usage milestones
- ❌ Custom date range selection

## Dependencies

### External Systems
- **Supabase**: Database for `usage_tracking` table
  - Connection configured via `lib/supabase.ts`
  - Table already exists with required columns

### Third-party Libraries
- **date-fns** or **dayjs**: For date/time manipulation (JST conversion)
  - May need to install if not already present
  - Alternative: Use native `Date` API with manual offset calculation

### Prerequisites
- `usage_tracking` table must be populated by existing tracking functions
- Existing tracking implementation for `/api/transcribe` endpoint ✅
- Existing tracking implementation for speaking-scoring API ✅
- Top page (`/` or `/home`) must exist in app router

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Already configured
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Already configured
- No new environment variables required

## Implementation Notes

### Timezone Handling Strategy
Use one of these approaches for JST conversion:

**Option A: Server-side timezone conversion**
```typescript
// In API route - use PostgreSQL timezone functions
const { data } = await supabase.rpc('get_daily_usage_jst', {
  target_date: '2025-12-02'
});
```

**Option B: Application-level timezone conversion**
```typescript
// Calculate JST date range in application code
const jstDate = new Date(Date.now() + (9 * 60 * 60 * 1000));
const startOfDay = new Date(jstDate.toISOString().split('T')[0] + 'T00:00:00+09:00');
```

**Recommended**: Option B for simplicity, unless timezone conversion becomes a bottleneck.

### Number Formatting
Use built-in internationalization:
```typescript
const formatted = totalSeconds.toLocaleString('en-US');
// Output: "1,234" or "12,345"
```

### Component Architecture
```
/app/page.tsx (Top page)
  └── <DailyUsageCard /> (New component)
        └── Uses custom hook: useDailyUsage()
              └── Fetches from /api/usage/daily
```

## Timeline and Effort Estimate

**Complexity**: Medium (2-3 days)

**Breakdown**:
1. API endpoint implementation: 0.5 day
2. Dashboard card component: 0.5 day
3. Date/timezone logic and testing: 0.5 day
4. Integration and end-to-end testing: 0.5 day
5. Edge case handling and polish: 0.5 day

**Total**: ~2.5 days (16-20 hours)
