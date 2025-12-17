# Implementation Tasks: Admin Token Usage List

## Phase 1: Foundation (P0 Requirements)

### Task 1.1: Extend TypeScript Types
- [x] Open `lib/types/usage-stats.ts`
- [x] Locate the existing `DailyUsageStats` interface
- [x] Add two new fields to the interface:
  ```typescript {.line-numbers}
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
    records: TokenUsageRow[];      // ADD THIS
    totalRecordCount: number;      // ADD THIS
  }
  ```
- [x] Verify `TokenUsageRow` is already imported from `@/lib/types/db`
- [x] Run TypeScript check: `npx tsc --noEmit`

**Acceptance**: No TypeScript errors, DailyUsageStats interface includes new fields

---

### Task 1.2: Extend API Route Handler
- [x] Open `app/api/usage/daily/route.ts`
- [x] Locate the `Promise.all` at line 32
- [x] Add third query to fetch all records:
  ```typescript
  // CHANGE FROM:
  const [transcriptionResult, speakingResult] = await Promise.all([...]);

  // CHANGE TO:
  const [transcriptionResult, speakingResult, allRecordsResult] = await Promise.all([
    // Query 1: transcription data (keep existing)
    supabase
      .from(TABLE_NAME.TOKEN_USAGE)
      .select('audio_duration_seconds')
      .eq('api_type', 'transcription')
      .eq('model_name', audioModel)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString()),

    // Query 2: speaking-scoring data (keep existing)
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
      .select('*')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false }),
  ]);
  ```
- [x] Add error handling for third query (after line 59):
  ```typescript
  if (allRecordsResult.error) {
    throw new Error(`All records query failed: ${allRecordsResult.error.message}`);
  }
  ```
- [x] Add import for `TokenUsageRow` type at the top:
  ```typescript
  import type { DailyUsageStats, UsageTrackingRecord, TokenUsageRow } from '@/lib/types/usage-stats';
  ```
- [x] Extract all records data (after line 66):
  ```typescript
  const allRecords = (allRecordsResult.data ?? []) as TokenUsageRow[];
  ```
- [x] Extend the response object (modify lines 69-80):
  ```typescript
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
    records: allRecords,                    // ADD THIS
    totalRecordCount: allRecords.length,    // ADD THIS
  };
  ```
- [x] Save file and test API: `curl http://localhost:3000/api/usage/daily`

**Acceptance**: API returns extended response with `records` array and `totalRecordCount`

---

### Task 1.3: Extend Custom Hook
- [x] Open `lib/hooks/use-daily-usage.ts`
- [x] Locate the `UsageDisplayState` interface (if defined in this file) or check `lib/types/usage-stats.ts`
- [x] Add new fields to the state interface:
  ```typescript
  export interface UsageDisplayState {
    transcriptionSeconds: number | null;
    speakingTokens: number | null;
    records: TokenUsageRow[];          // ADD THIS
    totalRecordCount: number;          // ADD THIS
    isLoading: boolean;
    hasError: boolean;
    refetch: () => void;
  }
  ```
- [x] Update initial state (line 19-25):
  ```typescript
  const [state, setState] = useState<UsageDisplayState>({
    transcriptionSeconds: null,
    speakingTokens: null,
    records: [],              // ADD THIS
    totalRecordCount: 0,      // ADD THIS
    isLoading: true,
    hasError: false,
    refetch: () => {},
  });
  ```
- [x] Update success state in `fetchUsage` function (line 37-43):
  ```typescript
  setState({
    transcriptionSeconds: data.transcription.totalSeconds,
    speakingTokens: data.speakingScoring.totalTokens,
    records: data.records,                      // ADD THIS
    totalRecordCount: data.totalRecordCount,    // ADD THIS
    isLoading: false,
    hasError: false,
    refetch: fetchUsage,
  });
  ```
- [x] Update error state (line 46-52) to include default values:
  ```typescript
  setState({
    transcriptionSeconds: null,
    speakingTokens: null,
    records: [],              // ADD THIS
    totalRecordCount: 0,      // ADD THIS
    isLoading: false,
    hasError: true,
    refetch: fetchUsage,
  });
  ```
- [x] Add import for `TokenUsageRow` type if needed
- [x] Run TypeScript check: `npx tsc --noEmit`

**Acceptance**: Hook compiles without errors, returns new fields

---

### Task 1.4: Create Table Component Structure
- [x] Create file: `components/TodayTokenUsageList.tsx`
- [x] Add 'use client' directive at top
- [x] Add imports:
  ```typescript
  'use client';

  import { useDailyUsage } from '@/lib/hooks/use-daily-usage';
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
  } from '@/components/ui/card';
  import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
  } from '@/components/ui/table';
  import { RefreshCwIcon } from 'lucide-react';
  import { ADMIN_REFRESH_INTERVAL } from '@/lib/costants';
  import type { TokenUsageRow } from '@/lib/types/db';
  ```
- [x] Create main component `TodayTokenUsageList`:
  ```typescript
  export function TodayTokenUsageList() {
    const {
      records,
      totalRecordCount,
      isLoading,
      hasError,
      refetch
    } = useDailyUsage(ADMIN_REFRESH_INTERVAL);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Usage Records</CardTitle>
          <CardDescription>
            {totalRecordCount} {totalRecordCount === 1 ? 'record' : 'records'} today
          </CardDescription>
          <CardAction>
            <RefreshCwIcon
              onClick={refetch}
              color="var(--muted-foreground)"
              className="cursor-pointer"
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Table will go here
          </div>
        </CardContent>
      </Card>
    );
  }
  ```
- [x] Save and verify it compiles without errors

**Acceptance**: Component renders Card with title "Token Usage Records"

---

## Phase 2: Core Features (P0 Requirements)

### Task 2.1: Implement Time Formatting
- [ ] In `TodayTokenUsageList.tsx`, create utility function before component:
  ```typescript
  /**
   * Formats ISO timestamp to JST time-only display (HH:MM:SS)
   */
  function formatTime(isoTimestamp: string): string {
    return new Date(isoTimestamp).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
  ```
- [ ] Test in browser console with sample timestamp:
  ```javascript
  formatTime("2025-12-17T14:30:45.123Z") // Should render "14:30:45"
  ```

**Acceptance**: Timestamps display in HH:MM:SS format in JST timezone

---

### Task 2.2: Implement API Type and Model Display
- [ ] Create constant for API type labels:
  ```typescript
  const API_TYPE_LABELS: Record<string, string> = {
    text_generation: 'Text Generation',
    transcription: 'Transcription',
    realtime_session: 'Realtime Session',
  };
  ```
- [ ] Create helper function:
  ```typescript
  /**
   * Formats API type enum to human-readable label
   */
  function formatApiType(apiType: string): string {
    return API_TYPE_LABELS[apiType] || apiType;
  }
  ```
- [ ] Model name will display as-is (no formatting function needed)

**Acceptance**: API types show human-readable labels, model names display correctly

---

### Task 2.3: Implement Token/Duration Display Logic
- [ ] Create `TokensCell` sub-component:
  ```typescript
  interface TokensCellProps {
    record: TokenUsageRow;
  }

  /**
   * Displays token count or audio duration based on API type
   */
  function TokensCell({ record }: TokensCellProps) {
    // Transcription records show audio duration
    if (record.api_type === 'transcription' && record.model_name === 'whisper-1') {
      return (
        <span>
          {record.audio_duration_seconds !== null
            ? `${record.audio_duration_seconds}s`
            : '-'}
        </span>
      );
    }

    // Text generation shows total tokens
    if (record.total_tokens !== null) {
      return <span>{record.total_tokens}</span>;
    }

    // Fallback for null values
    return <span>-</span>;
  }
  ```
- [ ] Test logic manually with different record types

**Acceptance**: Correct values display based on API type, null values show "-"

---

### Task 2.4: Build Table Structure with shadcn/ui Components
- [ ] Replace placeholder div in `CardContent` with shadcn/ui table:
  ```typescript
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>API Type</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Tokens</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="tabular-nums">
              {formatTime(record.created_at)}
            </TableCell>
            <TableCell>{formatApiType(record.api_type)}</TableCell>
            <TableCell>{record.model_name}</TableCell>
            <TableCell>
              <TokensCell record={record} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
  ```
- [ ] Verify table renders with proper borders and spacing
- [ ] Note: shadcn/ui table components handle styling automatically (borders, hover states, etc.)

**Acceptance**: Table displays all 4 columns with proper styling, data renders in rows

---

### Task 2.5: Integrate Component into Admin Page
- [ ] Open `app/admin/page.tsx`
- [ ] Import new component:
  ```typescript
  import { TodayTokenUsageList } from '@/components/TodayTokenUsageList';
  ```
- [ ] Add component below `DailyUsageCard`:
  ```typescript
  <div className="space-y-4">
    <DailyUsageCard />
    <TodayTokenUsageList />
  </div>
  ```
- [ ] Start dev server: `npm run dev`
- [ ] Visit `http://localhost:3000/admin` and verify component renders

**Acceptance**: New component appears on admin page below existing card

---

## Phase 3: Polish (P1 Requirements)

### Task 3.1: Implement Loading State
- [ ] Create `SkeletonRow` sub-component:
  ```typescript
  /**
   * Skeleton loading row for table
   */
  function SkeletonRow() {
    return (
      <TableRow>
        <TableCell>
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </TableCell>
        <TableCell>
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </TableCell>
        <TableCell>
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </TableCell>
        <TableCell>
          <div className="h-4 w-12 bg-muted rounded animate-pulse" />
        </TableCell>
      </TableRow>
    );
  }
  ```
- [ ] Add conditional rendering in TableBody:
  ```typescript
  <TableBody>
    {isLoading && (
      <>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </>
    )}
    {!isLoading && records.map((record) => (
      <TableRow key={record.id}>
        {/* ... existing row content ... */}
      </TableRow>
    ))}
  </TableBody>
  ```
- [ ] Test by refreshing page and observing skeleton

**Acceptance**: Loading skeleton displays on initial load

---

### Task 3.2: Implement Empty State
- [ ] Add conditional rendering for empty state in TableBody:
  ```typescript
  <TableBody>
    {isLoading && (
      <>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </>
    )}

    {!isLoading && !hasError && records.length === 0 && (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
          No API calls recorded today
        </TableCell>
      </TableRow>
    )}

    {!isLoading && records.length > 0 && records.map((record) => (
      <TableRow key={record.id}>
        {/* ... existing row content ... */}
      </TableRow>
    ))}
  </TableBody>
  ```
- [ ] Test empty state by viewing page on a day with no API calls (or temporarily return empty array from API)

**Acceptance**: Empty state message displays when no records exist

---

### Task 3.3: Handle Error State
- [ ] Add error state handling in TableBody:
  ```typescript
  <TableBody>
    {isLoading && (
      <>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </>
    )}

    {!isLoading && hasError && (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
          Failed to load data
        </TableCell>
      </TableRow>
    )}

    {!isLoading && !hasError && records.length === 0 && (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
          No API calls recorded today
        </TableCell>
      </TableRow>
    )}

    {!isLoading && !hasError && records.length > 0 && records.map((record) => (
      <TableRow key={record.id}>
        {/* ... existing row content ... */}
      </TableRow>
    ))}
  </TableBody>
  ```
- [ ] Test error state by temporarily breaking API route

**Acceptance**: Error state displays gracefully without crashing

---

### Task 3.4: Verify Auto-refresh Works
- [ ] Start dev server: `npm run dev`
- [ ] Open `/admin` page
- [ ] Open browser DevTools Network tab
- [ ] Filter network tab by "daily"
- [ ] Wait 60 seconds
- [ ] Verify new request to `/api/usage/daily` appears
- [ ] Verify table updates with new data (if any)

**Acceptance**: Page automatically refreshes data every 60 seconds

---

### Task 3.5: Verify Manual Refresh Works
- [ ] On `/admin` page, click the refresh icon in `TodayTokenUsageList` card
- [ ] Observe network request in DevTools
- [ ] Verify table updates with latest data
- [ ] Verify no errors in console

**Acceptance**: Clicking refresh icon re-fetches and updates data

---

## Phase 4: Testing & Validation

### Task 4.1: Manual Testing - Data Scenarios
- [ ] **Scenario 1: Empty database** (0 records)
  - Clear token_usage table or view on new day
  - Verify empty state displays: "No API calls recorded today"

- [ ] **Scenario 2: Text generation records only**
  - Call `/api/text` endpoint to create text_generation records
  - Verify tokens display correctly (input/output/total)

- [ ] **Scenario 3: Transcription records only**
  - Call `/api/transcribe` endpoint to create transcription records
  - Verify audio duration displays with "s" suffix

- [ ] **Scenario 4: Speaking score records**
  - Call `/api/speaking/score` to create speaking-scoring records
  - Verify they display correctly

- [ ] **Scenario 5: Mixed API types**
  - Create multiple types of records
  - Verify all types render correctly in same table
  - Verify ordering is newest first

- [ ] **Scenario 6: Records with null values**
  - Verify null token values show "-"
  - Verify null audio duration shows "-"

**Acceptance**: All data scenarios render correctly

---

### Task 4.2: Manual Testing - UI/UX
- [ ] Verify table is readable on desktop (1920px width)
- [ ] Verify table is readable on laptop (1440px width)
- [ ] Verify table works on mobile (375px width) - may need horizontal scroll
- [ ] Verify loading skeleton matches final table layout (no layout shift)
- [ ] Verify timestamps are in JST timezone (not UTC)
- [ ] Verify records are ordered newest first (most recent at top)
- [ ] Verify styling matches `DailyUsageCard` design
- [ ] Verify card has consistent spacing with other admin page elements
- [ ] Verify text is readable (good contrast)

**Acceptance**: UI looks polished and consistent with existing design

---

### Task 4.3: Manual Testing - Functionality
- [ ] Verify page loads within 2 seconds (dev mode)
- [ ] Verify auto-refresh works every 60 seconds
- [ ] Verify manual refresh button works
- [ ] Verify no console errors appear
- [ ] Verify no terminal errors appear
- [ ] Create a new API call (via `/api/text` or `/api/transcribe`)
- [ ] Verify it appears in the list after refresh (within 60s or manual refresh)
- [ ] Verify record count updates correctly

**Acceptance**: All functionality works as expected

---

### Task 4.4: Verify DailyUsageCard Still Works
- [ ] On `/admin` page, verify `DailyUsageCard` still displays correctly
- [ ] Verify it shows transcription seconds
- [ ] Verify it shows speaking score tokens
- [ ] Verify its refresh button works
- [ ] Verify it auto-refreshes every 60 seconds
- [ ] Ensure extending the API response didn't break existing component

**Acceptance**: DailyUsageCard continues to work as before

---

### Task 4.5: Environment Protection Test
- [ ] Verify development environment works (already tested)
- [ ] Note: Production protection already exists in `/api/usage/daily`
- [ ] Confirm `env.isProduction` check is still at line 23 of route.ts
- [ ] No additional changes needed for environment protection

**Acceptance**: Production environment protection works correctly

---

### Task 4.6: TypeScript Validation
- [ ] Run: `npx tsc --noEmit`
- [ ] Verify no TypeScript errors
- [ ] Verify no `any` types are used
- [ ] Verify all props are properly typed
- [ ] Check all imports resolve correctly

**Acceptance**: TypeScript compiles with zero errors

---

### Task 4.7: Code Quality Check
- [ ] Run linter: `npm run lint`
- [ ] Fix any linting errors or warnings
- [ ] Run formatter: `npm run format`
- [ ] Verify code follows existing patterns from `DailyUsageCard`
- [ ] Verify all imports use `@/` path alias
- [ ] Verify indentation is 2 spaces
- [ ] Remove any commented-out code
- [ ] Remove any console.log statements (except error logging)

**Acceptance**: Code passes linting and formatting checks

---

## Phase 5: Final Verification

### Task 5.1: Acceptance Criteria Checklist
- [ ] List displays all token usage records for today (JST)
- [ ] Each record shows: time, API type, model, tokens/duration
- [ ] Records are ordered newest first
- [ ] Loading state displays while fetching data
- [ ] Empty state shows when no records exist
- [ ] Page auto-refreshes every 60 seconds
- [ ] Feature only accessible in development environment
- [ ] UI is consistent with existing admin page design
- [ ] No errors in console or terminal
- [ ] TypeScript types are properly defined with no 'any' types

**Acceptance**: All 10 acceptance criteria are met

---

### Task 5.2: Documentation Review
- [ ] Add JSDoc comment to `TodayTokenUsageList` component:
  ```typescript
  /**
   * Token Usage Records List Component
   *
   * Displays a detailed table of all token usage records for today (JST).
   * Shows timestamp, API type, model name, and token counts/audio duration.
   *
   * Features:
   * - Auto-refreshes every 60 seconds
   * - Manual refresh button
   * - Loading skeleton during fetch
   * - Empty state when no records exist
   * - Error handling with graceful degradation
   *
   * Data source: Reuses /api/usage/daily endpoint
   */
  export function TodayTokenUsageList() {
  ```
- [ ] Ensure helper functions have JSDoc comments
- [ ] Verify all complex logic has inline comments

**Acceptance**: Code is well-documented with clear comments

---

### Task 5.3: Final Code Review
- [ ] Review modified files:
  - `app/api/usage/daily/route.ts` - Check third query logic
  - `lib/hooks/use-daily-usage.ts` - Check new fields extraction
  - `lib/types/usage-stats.ts` - Check extended interface
  - `app/admin/page.tsx` - Check component integration
- [ ] Review new file:
  - `components/TodayTokenUsageList.tsx` - Check all logic
- [ ] Verify no unused imports
- [ ] Verify no commented-out code
- [ ] Verify consistent naming conventions
- [ ] Verify error handling is complete
- [ ] Verify all TypeScript types are accurate

**Acceptance**: Code is clean, production-ready, follows all conventions

---

### Task 5.4: Performance Verification
- [ ] Open browser DevTools Performance tab
- [ ] Record page load of `/admin`
- [ ] Verify no long tasks (> 50ms)
- [ ] Check Network tab:
  - Single request to `/api/usage/daily`
  - Response size is reasonable (< 100KB for typical day)
  - Response time < 500ms
- [ ] Verify smooth rendering (no jank)
- [ ] Test with 50+ records to ensure performance is acceptable

**Acceptance**: Page performs well, no performance regressions

---

## Summary

**Total Tasks**: 26 tasks across 5 phases
- **Phase 1** (Foundation): 4 tasks
- **Phase 2** (Core Features): 5 tasks
- **Phase 3** (Polish): 5 tasks
- **Phase 4** (Testing): 7 tasks
- **Phase 5** (Final Verification): 4 tasks

**Files Modified**: 4 files
- `app/api/usage/daily/route.ts` - Extended with 3rd query
- `lib/hooks/use-daily-usage.ts` - Returns new fields
- `lib/types/usage-stats.ts` - Extended DailyUsageStats interface
- `app/admin/page.tsx` - Added new component

**Files Created**: 1 file
- `components/TodayTokenUsageList.tsx` - New list component

**Estimated Complexity**: Medium
**Dependencies**: None (all dependencies exist in codebase)

**Key Advantages of This Approach**:
✅ Reuses existing `/api/usage/daily` endpoint (no new API route)
✅ Single API call serves both `DailyUsageCard` and `TodayTokenUsageList`
✅ Backward compatible - existing code continues to work
✅ Simpler implementation - extends existing patterns

**Ready to Implement**: All tasks are clearly defined and ready for execution
