# Feature Requirements: Admin Token Usage List

## Overview
Add a comprehensive list view of today's individual token usage records to the `/admin` page. This feature will display all API calls made today with detailed information including timestamps, API types, models used, token counts, and costs. The list will complement the existing aggregated daily usage statistics to provide granular visibility into API usage patterns.

## User Stories
As a developer monitoring API usage, I want to see a detailed list of all token usage records for today so that I can understand which API calls are being made, when they occur, and how much they cost.

## Functional Requirements

### Must Have (P0)

- **REQ-001**: Display a list of all token usage records for the current day (JST timezone)
  - Query `token_usage` table filtering by `created_at >= start of today (JST)` and `created_at < start of tomorrow (JST)`
  - Use existing `getJSTDayRange()` utility for consistent date range calculation

- **REQ-002**: Show timestamp for each record
  - Display `created_at` field in human-readable format (e.g., "2:30:45 PM" or "14:30:45")
  - Format should show time only (not date, since all records are from today)

- **REQ-003**: Show API type and model name for each record
  - Display `api_type` field (text_generation, transcription, or realtime_session)
  - Display `model_name` field (gpt-5-mini, whisper-1, gpt-4o-mini, etc.)
  - Format should be clear and readable (e.g., "Text Generation - gpt-5-mini")

- **REQ-004**: Show token counts for each record
  - Display `input_tokens`, `output_tokens`, and `total_tokens` when available
  - Show "N/A" or "-" for null values (e.g., transcription records don't have token counts)
  - For transcription records, show `audio_duration_seconds` instead

- **REQ-005**: Maintain development-only access
  - Keep existing `prodNotFound()` protection on `/admin` route
  - Feature should only be accessible in development environment

### Should Have (P1)

- **REQ-006**: Show loading state
  - Display skeleton or placeholder UI while fetching data
  - Prevent layout shift when data loads

- **REQ-007**: Show empty state
  - When no records exist for today, display appropriate message
  - Example: "No API calls recorded today"


## Technical Requirements

### Data Models

**Existing Schema** (no changes required):
```typescript
interface TokenUsageRow {
  id: string;
  created_at: string;
  api_type: 'text_generation' | 'transcription' | 'realtime_session';
  model_name: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  audio_duration_seconds: number | null;
  cost_usd: number;
  metadata: Record<string, unknown> | null;
}
```

**New Type for API Response**:
```typescript
interface TodayTokenUsageResponse {
  date: string;
  timezone: string;
  records: TokenUsageRow[];
  recordCount: number;
}
```

### API Contracts

**New Endpoint**: `GET /api/usage/today`

**Request**: None (no query parameters)

**Response**:
```json
{
  "date": "2025-12-17",
  "timezone": "JST",
  "records": [
    {
      "id": "uuid",
      "created_at": "2025-12-17T14:30:45.123Z",
      "api_type": "text_generation",
      "model_name": "gpt-5-mini",
      "input_tokens": 150,
      "output_tokens": 200,
      "total_tokens": 350,
      "audio_duration_seconds": null,
      "cost_usd": 0.0012,
      "metadata": null
    }
  ],
  "recordCount": 42,
}
```

**Status Codes**:
- 200: Success
- 500: Production environment (blocked by environment check)
- 500: Database error

**Cache Strategy**:
- Revalidate every 60 seconds
- Use Next.js unstable_cache or similar caching mechanism

### UI/UX Requirements

**Component Structure**:
- New component: `TodayTokenUsageList` or `TokenUsageListCard`
- Place in `/admin` page below existing `DailyUsageCard`
- Use consistent styling with existing components

**Layout**:
- Table or list layout with clear column headers
- Responsive design (stack on mobile if needed)
- Fixed header row for column labels

**Column Headers**:
1. Time (created_at)
2. API Type (api_type)
3. Model (model_name)
4. Tokens (input/output/total or audio duration)

**Visual Design**:
- Match existing Tailwind CSS styling
- Use existing color scheme and spacing
- Consistent with `DailyUsageCard` appearance
- Consider using table or card-based layout

### Database Queries

**Query Pattern** (using Supabase client):
```typescript
const { startOfToday, startOfTomorrow } = getJSTDayRange();

const { data, error } = await supabase
  .from('token_usage')
  .select('*')
  .gte('created_at', startOfToday.toISOString())
  .lt('created_at', startOfTomorrow.toISOString())
  .order('created_at', { ascending: false });
```

**Performance Considerations**:
- Existing index `idx_token_usage_created_at` will optimize date range queries
- Expected record count: 10-100 records per day (low volume)
- No pagination needed initially (P2 feature if volume increases)

## Non-Functional Requirements

### Performance
- Initial page load should complete within 2 seconds
- Auto-refresh should not cause visible UI flicker
- Database query should execute in < 200ms (indexed query)

### Security
- Development-only access enforced by `prodNotFound()` utility
- No authentication required (development environment assumption)
- No sensitive data exposure (token usage is internal monitoring data)

### Maintainability
- Reuse existing utilities (`getJSTDayRange`, `formatNumber`, etc.)
- Follow established code patterns from `DailyUsageCard` implementation
- Use existing TypeScript types from `lib/types/db.ts`

### Browser Compatibility
- Support same browsers as main application
- No special requirements beyond existing Next.js/React support

## Acceptance Criteria

- [ ] List displays all token usage records for today (JST)
- [ ] Each record shows: time, API type, model, tokens/duration, and cost
- [ ] Records are ordered newest first
- [ ] Loading state displays while fetching data
- [ ] Empty state shows when no records exist
- [ ] Page auto-refreshes every 60 seconds
- [ ] Feature only accessible in development environment
- [ ] UI is consistent with existing admin page design
- [ ] No errors in console or terminal
- [ ] TypeScript types are properly defined with no 'any' types

## Out of Scope

The following items are explicitly NOT included in this feature:

- **Pagination**: All today's records shown in single list (low volume expected)
- **Sorting controls**: Always newest first, no user-controllable sorting
- **Filtering controls**: No UI to filter by API type or model
- **Search functionality**: No search box to find specific records
- **Date range selection**: Only today's data, no historical data browsing
- **Export functionality**: No CSV/JSON export of records
- **Real-time updates**: Uses polling (60s refresh), not WebSocket/SSE
- **Production access**: Remains development-only
- **Authentication/Authorization**: No user login or permissions system
- **Detailed metadata display**: `metadata` field not shown in list
- **Edit/Delete capabilities**: Read-only view of records
- **Charts/Visualizations**: Plain list view only (charts exist on separate page)

## Dependencies

### External Systems
- Supabase PostgreSQL database (existing)
- `token_usage` table with existing schema

### Internal Dependencies
- `/lib/supabase.ts`: Database client
- `/lib/utils/date-jst.ts`: JST date range calculation
- `/lib/types/db.ts`: TypeScript type definitions
- `/lib/utils/env.ts`: `prodNotFound()` utility

### Third-party Libraries
- No new dependencies required
- Uses existing Next.js, React, Tailwind CSS stack

## References

### Related Specifications
- `/specs/202512011734_token_usage_tracking/`: Original token tracking implementation
- `/specs/202512021914_daily_usage_dashboard/`: Aggregated daily stats (existing feature)

### Related Files
- `/app/admin/page.tsx`: Target page for implementation
- `/app/api/usage/daily/route.ts`: Example API route pattern
- `/components/DailyUsageCard.tsx`: Example component pattern
- `/lib/hooks/use-daily-usage.ts`: Example data fetching hook

## Implementation Notes

### Suggested Approach
1. Create new API route: `/app/api/usage/today/route.ts`
2. Create new component: `/components/TodayTokenUsageList.tsx`
3. Create new hook: `/lib/hooks/use-today-token-usage.ts`
4. Add component to `/app/admin/page.tsx`

### Code Reuse Opportunities
- Reuse `getJSTDayRange()` for date filtering
- Reuse `formatNumber()` for numeric display
- Reuse `supabaseClient` singleton for database access
- Follow patterns from `DailyUsageCard` for loading/error states

### Testing Considerations
- Verify correct JST timezone handling
- Test with zero records (empty state)
- Test with various API types (text_generation, transcription, realtime_session)
- Test auto-refresh functionality
- Verify development-only access
