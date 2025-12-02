# Implementation Tasks: Daily Usage Dashboard

## Phase 1: Foundation (P0 Setup)

### 1.1 Type Definitions
- [x] Create `lib/types/usage-stats.ts`
  - [x] Define `UsageTrackingRecord` interface
  - [x] Define `DailyUsageStats` interface
  - [x] Define `UsageStatsError` interface
  - [x] Define `UsageDisplayState` interface
  - [x] Export all types

### 1.2 Utility Functions - Date/Time
- [x] Create `lib/utils/date-jst.ts`
  - [x] Implement `getJSTDayRange()` function
    - [x] Calculate JST offset (UTC+9)
    - [x] Convert current time to JST
    - [x] Calculate start of day (00:00:00 JST)
    - [x] Calculate end of day (23:59:59 JST)
    - [x] Return date range and formatted date string
  - [x] Implement `formatNumber()` function
    - [x] Use `toLocaleString('en-US')` for thousands separator
  - [x] Add JSDoc comments

### 1.3 Utility Functions - Data Aggregation
- [x] Create `lib/utils/aggregate-usage.ts`
  - [x] Implement `aggregateTranscriptionSeconds()`
    - [x] Sum `duration_seconds` from records
    - [x] Handle null/undefined values (default to 0)
  - [x] Implement `aggregateSpeakingTokens()`
    - [x] Sum `input_tokens + output_tokens` from records
    - [x] Handle null/undefined values (default to 0)
  - [x] Add JSDoc comments

## Phase 2: API Implementation (P0 Core)

### 2.1 API Route Setup
- [ ] Create `app/api/usage/daily/route.ts`
  - [ ] Set up file structure with `GET` export
  - [ ] Import required dependencies:
    - [ ] `NextResponse` from 'next/server'
    - [ ] `getSupabaseClient` from '@/lib/supabase'
    - [ ] `getJSTDayRange` from '@/lib/utils/date-jst'
    - [ ] Aggregation functions from '@/lib/utils/aggregate-usage'
    - [ ] Types from '@/lib/types/usage-stats'

### 2.2 API Business Logic
- [ ] Implement `GET` handler function
  - [ ] Add try-catch error handling wrapper
  - [ ] Initialize Supabase client
  - [ ] Calculate JST date range using `getJSTDayRange()`
  - [ ] Query transcription data:
    - [ ] Select `duration_seconds` column
    - [ ] Filter by `api_type = 'transcription'`
    - [ ] Filter by `created_at >= startOfDay`
    - [ ] Filter by `created_at < endOfDay`
  - [ ] Query speaking-scoring data:
    - [ ] Select `input_tokens, output_tokens` columns
    - [ ] Filter by `api_type = 'speaking-scoring'`
    - [ ] Filter by `created_at >= startOfDay`
    - [ ] Filter by `created_at < endOfDay`
  - [ ] Execute queries in parallel using `Promise.all()`
  - [ ] Handle query errors (check `error` from Supabase response)

### 2.3 API Response Formatting
- [ ] Aggregate query results
  - [ ] Call `aggregateTranscriptionSeconds()` with transcription data
  - [ ] Call `aggregateSpeakingTokens()` with speaking data
  - [ ] Count records for each type
- [ ] Build response object matching `DailyUsageStats` type
  - [ ] Include `date` (YYYY-MM-DD format)
  - [ ] Include `timezone: 'JST'`
  - [ ] Include transcription totals and count
  - [ ] Include speaking-scoring totals and count
- [ ] Return JSON response with 200 status

### 2.4 API Error Handling
- [ ] Implement error catch block
  - [ ] Log error to console with context
  - [ ] Return generic error message (don't expose details)
  - [ ] Set 500 status code
  - [ ] Match `UsageStatsError` type

### 2.5 API Performance Optimization (P1)
- [ ] Add HTTP cache headers
  - [ ] Set `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
  - [ ] Test cache behavior in browser DevTools

## Phase 3: Component Implementation (P0 UI)

### 3.1 Custom Hook
- [ ] Create `hooks/useDailyUsage.ts`
  - [ ] Define hook function with optional `refreshInterval` parameter
  - [ ] Initialize state using `useState<UsageDisplayState>`
    - [ ] Default: `isLoading: true`, `hasError: false`, `transcriptionSeconds: null`, `speakingTokens: null`
  - [ ] Create `fetchUsage` async function
    - [ ] Call `fetch('/api/usage/daily')`
    - [ ] Check response.ok
    - [ ] Parse JSON response as `DailyUsageStats`
    - [ ] Update state with data
    - [ ] Handle errors (catch block)
      - [ ] Log error to console
      - [ ] Set `hasError: true`
      - [ ] Set `isLoading: false`
  - [ ] Add `useEffect` hook
    - [ ] Call `fetchUsage()` on mount
    - [ ] Set up interval for auto-refresh (if `refreshInterval` provided)
    - [ ] Clean up interval on unmount
  - [ ] Return state object
  - [ ] Add TypeScript types for all function signatures

### 3.2 Sub-component: UsageStat
- [ ] Create `UsageStat` component in `components/DailyUsageCard.tsx`
  - [ ] Define `UsageStatProps` interface
    - [ ] `label: string`
    - [ ] `value: number | null`
    - [ ] `unit: string`
    - [ ] `isLoading: boolean`
    - [ ] `hasError: boolean`
  - [ ] Implement component JSX
    - [ ] Create flex container with `justify-between`
    - [ ] Display label with muted color
    - [ ] Display value:
      - [ ] Show "---" if loading, error, or null
      - [ ] Show formatted number with unit if loaded
    - [ ] Apply consistent spacing

### 3.3 Main Component: DailyUsageCard
- [ ] Create `components/DailyUsageCard.tsx`
  - [ ] Import dependencies:
    - [ ] `useDailyUsage` hook
    - [ ] Card components from '@/components/ui/card'
    - [ ] `formatNumber` from '@/lib/utils/date-jst'
  - [ ] Implement `DailyUsageCard` component
    - [ ] Call `useDailyUsage(60000)` for 60-second refresh (P1)
    - [ ] Destructure state: `{ transcriptionSeconds, speakingTokens, isLoading, hasError }`
    - [ ] Return JSX structure:
      - [ ] `<Card>` wrapper
      - [ ] `<CardHeader>` with `<CardTitle>Daily Usage (Today)</CardTitle>`
      - [ ] `<CardContent>` with `space-y-3` class
        - [ ] `<UsageStat>` for transcription (label: "Transcription", unit: "sec")
        - [ ] `<UsageStat>` for speaking score (label: "Speaking Score", unit: "tokens")
  - [ ] Export component as named export

### 3.4 Integration with Top Page
- [ ] Modify `app/page.tsx`
  - [ ] Import `DailyUsageCard` component
  - [ ] Add component to page JSX
  - [ ] Position card appropriately on page (after title, before other content)
  - [ ] Ensure responsive layout (card should fit in existing grid/layout)

## Phase 4: Polish & Testing (P0 Validation)

### 4.1 Visual Polish
- [ ] Review component styling
  - [ ] Verify card matches existing UI design system
  - [ ] Check spacing consistency with other components
  - [ ] Test typography (font size, weight, color)
  - [ ] Verify "---" placeholder is clearly visible
- [ ] Test responsive design
  - [ ] Mobile view (320px - 768px)
  - [ ] Tablet view (768px - 1024px)
  - [ ] Desktop view (1024px+)
  - [ ] Check text doesn't overflow

### 4.2 Manual Testing
- [ ] Test loading state
  - [ ] Verify "---" displays during initial load
  - [ ] Check smooth transition to data
  - [ ] Simulate slow network (DevTools throttling)
- [ ] Test loaded state
  - [ ] Verify numbers display correctly
  - [ ] Check thousands separator formatting (e.g., "1,234")
  - [ ] Verify units display ("sec", "tokens")
- [ ] Test error state
  - [ ] Stop Supabase connection (simulate error)
  - [ ] Verify "---" displays (not error message)
  - [ ] Check error logged to console
  - [ ] Restore connection and verify recovery
- [ ] Test auto-refresh (P1)
  - [ ] Open browser DevTools Network tab
  - [ ] Verify API called every 60 seconds
  - [ ] Check data updates if changed
- [ ] Test midnight reset
  - [ ] Add test data before midnight JST
  - [ ] Wait until 00:00:01 JST
  - [ ] Verify counters reset to 0 or new day's data

### 4.3 Data Validation
- [ ] Test with real data
  - [ ] Use `/api/transcribe` to create transcription records
  - [ ] Use `/api/speaking/score` to create speaking-scoring records
  - [ ] Verify totals displayed match database query
  - [ ] Test with varying amounts of data (0, 1, 10, 100+ records)
- [ ] Test date range filtering
  - [ ] Add records with yesterday's date
  - [ ] Verify they don't appear in today's total
  - [ ] Add records with tomorrow's date (change system clock if needed)
  - [ ] Verify future records don't appear

### 4.4 Performance Validation
- [ ] Measure API response time
  - [ ] Open DevTools Network tab
  - [ ] Reload page and check `/api/usage/daily` timing
  - [ ] Verify < 500ms response time
- [ ] Check database query performance
  - [ ] Run `EXPLAIN ANALYZE` on queries
  - [ ] Verify indexes are used
  - [ ] Check query execution time
- [ ] Test page load performance
  - [ ] Use Lighthouse or PageSpeed Insights
  - [ ] Verify component doesn't block rendering
  - [ ] Check for layout shift (CLS metric)
- [ ] Test caching
  - [ ] Make request, check response headers
  - [ ] Verify `Cache-Control` header present
  - [ ] Make second request within 60s
  - [ ] Check if served from cache

### 4.5 Code Quality
- [ ] Run Biome linter
  - [ ] `npm run lint`
  - [ ] Fix any linting errors
  - [ ] Verify no warnings
- [ ] Run Biome formatter
  - [ ] `npm run format`
  - [ ] Verify consistent code style
- [ ] Type checking
  - [ ] Run `npx tsc --noEmit`
  - [ ] Fix any TypeScript errors
  - [ ] Verify all types are properly defined
- [ ] Code review checklist
  - [ ] All files have proper imports
  - [ ] No console.log statements (except error logging)
  - [ ] Comments added where logic is complex
  - [ ] Functions have JSDoc comments
  - [ ] No hardcoded values (use constants)

## Phase 5: Documentation & Deployment (P0 Final)

### 5.1 Code Documentation
- [ ] Add inline comments to complex logic
  - [ ] JST date calculation
  - [ ] Aggregation functions
  - [ ] Error handling strategy
- [ ] Update CLAUDE.md (if needed)
  - [ ] Document new API endpoint
  - [ ] Document new component
  - [ ] Add to Architecture section

### 5.2 Testing Summary
- [ ] Create test report
  - [ ] List all acceptance criteria
  - [ ] Mark each as passed/failed
  - [ ] Include screenshots of UI states
  - [ ] Document any edge cases found

### 5.3 Deployment Checklist
- [ ] Environment verification
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` set
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` set
  - [ ] Database accessible
- [ ] Database setup
  - [ ] Run index migration (if not already done)
  - [ ] Verify `usage_tracking` table has data
  - [ ] Test queries manually in Supabase dashboard
- [ ] Build verification
  - [ ] Run `npm run build`
  - [ ] Check for build errors
  - [ ] Verify no type errors
  - [ ] Check bundle size (should be minimal increase)
- [ ] Production testing
  - [ ] Deploy to staging/production
  - [ ] Test all functionality in production
  - [ ] Verify API endpoint accessible
  - [ ] Check browser console for errors

## Phase 6: Enhancement (P1 Features - Optional)

### 6.1 Auto-Refresh Implementation
- [ ] Already implemented in hook with `refreshInterval` parameter
- [ ] Verify 60-second interval working correctly
- [ ] Add option to disable auto-refresh (user preference)
- [ ] Consider adding visual indicator for refresh

### 6.2 Loading Skeleton (P2)
- [ ] Create `DailyUsageCardSkeleton` component
  - [ ] Use existing `Skeleton` component from `@/components/ui/skeleton`
  - [ ] Match layout of actual card
  - [ ] Show animated skeleton for both stat rows
- [ ] Update `app/page.tsx` to use Suspense
  - [ ] Wrap `<DailyUsageCard>` with `<Suspense>`
  - [ ] Use `DailyUsageCardSkeleton` as fallback

### 6.3 Rate Limiting (P1 - Optional)
- [ ] Install rate limiting library (e.g., `@upstash/ratelimit`)
- [ ] Create `lib/rate-limit.ts`
  - [ ] Configure rate limit: 60 requests/minute per IP
- [ ] Update API route
  - [ ] Add rate limit check before processing
  - [ ] Return 429 status if limit exceeded
  - [ ] Include `Retry-After` header

## Acceptance Criteria Verification

After completing all tasks, verify these acceptance criteria:

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

## Files to Create/Modify

### New Files (8 files)
1. `lib/types/usage-stats.ts` - Type definitions
2. `lib/utils/date-jst.ts` - JST date utilities
3. `lib/utils/aggregate-usage.ts` - Data aggregation functions
4. `hooks/useDailyUsage.ts` - Custom React hook
5. `components/DailyUsageCard.tsx` - Main component
6. `app/api/usage/daily/route.ts` - API endpoint
7. `migrations/add_usage_tracking_index.sql` - Database migration (optional)

### Modified Files (1 file)
1. `app/page.tsx` - Add DailyUsageCard component

### Total Implementation Size
- ~500 lines of code
- ~8 new files
- ~2 KB bundle size increase
- Estimated time: 16-20 hours (2-3 days)

## Priority Summary

### Must Complete (P0)
- Phase 1: Foundation (types, utilities, database)
- Phase 2: API Implementation (endpoint, logic, error handling)
- Phase 3: Component Implementation (hook, component, integration)
- Phase 4: Polish & Testing (visual, manual, data, performance, code quality)
- Phase 5: Documentation & Deployment (docs, testing, deployment)

### Should Complete (P1)
- API caching (Phase 2.5)
- Auto-refresh (already in Phase 3.1, verify working)
- Rate limiting (Phase 6.3)

### Nice to Have (P2)
- Loading skeleton (Phase 6.2)
- Retry logic (not in current task list)

## Next Steps

After completing this implementation:
1. ✅ Run full acceptance criteria verification
2. ✅ Deploy to staging for user testing
3. ✅ Monitor performance and error rates
4. ✅ Gather user feedback
5. 🔜 Plan Phase 2 features (historical data, charts, etc.)
