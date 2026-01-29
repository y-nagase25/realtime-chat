# Implementation Tasks: Save Reading History on Completion

## Phase 1: Foundation (P0)

### 1.1 Update ReadingTimer Component
- [x] Add `onTimeUpdate` callback prop to `ReadingTimerProps`
- [x] Call `onTimeUpdate` in the timer interval effect
- [x] Update component tests for new prop

### 1.2 Update QuestionResults Component
- [x] Update `QuestionResultsProps` type:
  - Add `passage: Passage` prop (optional for backward compatibility)
  - Add `readingTimeSeconds: number` prop (optional for backward compatibility)
  - Add `savedWords: string[]` prop (optional for backward compatibility)
  - Add `onSaveHistory: () => void` callback prop (optional for backward compatibility)
- [x] Import `useLocalStorage` hook and `READING_HISTORY_STORAGE_KEY` (completed in Phase 2)
- [x] Add save logic when `完了` button is pressed (completed in Phase 2 via `handleComplete`)
- [x] Update component tests for new props

## Phase 2: Core Features (P0)

### 2.1 Update Reading Page State Management
- [x] Add `elapsedSeconds` state variable
- [x] Add `savedWords` state variable (string array)
- [x] Add `capturedReadingTime` state variable
- [x] Connect `ReadingTimer.onTimeUpdate` to `setElapsedSeconds`

### 2.2 Update Saved Words Tracking
- [x] Modify `handleSaveWord` to add word to `savedWords` state
- [x] Ensure no duplicate words are added

### 2.3 Capture Reading Time on Submit
- [x] In `handleSubmitAnswers`, capture `elapsedSeconds` to `capturedReadingTime`
- [x] This ensures time is frozen when questions are submitted

### 2.4 Pass Data to QuestionResults
- [x] Pass `passage` prop to `QuestionResults`
- [x] Pass `capturedReadingTime` as `readingTimeSeconds` prop
- [x] Pass `savedWords` prop to `QuestionResults`

### 2.5 Implement Save Logic
- [x] Create `buildSessionData` utility function in `lib/utils/reading-session.ts`
- [x] Create `calculateWpm` utility function in `lib/utils/reading-session.ts`
- [x] Implement `handleComplete` callback:
  - Construct `ReadingSession` data
  - Call `add()` from `useLocalStorage`
  - Reset state and navigate to settings
- [x] Pass `handleComplete` as `onSaveHistory` to `QuestionResults`

## Phase 3: Polish (P1)

### 3.1 Add Toast Notifications
- [ ] Import `toast` from sonner
- [ ] Show success toast after saving: "学習履歴を保存しました"
- [ ] Show error toast if save fails: "履歴の保存に失敗しました"

### 3.2 Error Handling
- [x] Add try-catch around localStorage save
- [x] Log errors to console for debugging (silent catch to avoid blocking user)
- [x] Handle edge case where `passage` is null

## Phase 4: Enhancement (P2)

### 4.1 Optional Save Checkbox (Deferred)
- [ ] Add checkbox state for "Save to history"
- [ ] Conditionally save based on checkbox state
- [ ] Remember preference in localStorage

## Testing & Validation

### Unit Tests
- [x] Test `calculateWpm` utility function
- [x] Test `buildSessionData` utility function
- [x] Test `ReadingTimer` with `onTimeUpdate` callback
- [x] Test `QuestionResults` with new props (onSaveHistory callback)

### Integration Tests
- [ ] Test complete flow: settings → reading → results → save
- [ ] Verify data persists in localStorage
- [ ] Verify data appears in history page

### Manual Testing Checklist
- [ ] Complete a reading session and verify history is saved
- [ ] Check all fields are populated correctly in history
- [ ] Verify WPM calculation is accurate
- [ ] Verify saved words are recorded
- [ ] Verify score matches displayed result
- [ ] Refresh page and verify history persists
- [ ] Complete multiple sessions and verify max 50 limit
- [ ] Check history page displays saved sessions correctly

## File Changes Summary

| File | Changes |
|------|---------|
| `components/reading/ReadingTimer.tsx` | Add `onTimeUpdate` callback prop |
| `components/reading/QuestionResults.tsx` | Add new props, implement save logic |
| `app/reading/page.tsx` | Add state, connect timer, pass props |
| `lib/utils/reading-session.ts` | New file: `calculateWpm`, `buildSessionData` |
| `__tests__/components/reading/ReadingTimer.test.tsx` | Update tests |
| `__tests__/components/reading/QuestionResults.test.tsx` | Update tests |
| `__tests__/lib/utils/reading-session.test.ts` | New test file |
