# Feature Requirements: Save Reading History on Completion

## Overview

When users press the `完了` (Complete) button in the `QuestionResults` component after finishing reading practice, the application should automatically save a `ReadingSession` record to localStorage. This enables progress tracking and allows users to review their reading practice history.

## User Stories

- As a learner, I want my reading practice results saved automatically so that I can track my progress over time.
- As a learner, I want to see my reading history including scores, WPM, and topics so that I can identify areas for improvement.

## Functional Requirements

### Must Have (P0)

- REQ-001: When the `完了` button is pressed in `QuestionResults`, create a `ReadingSession` record in localStorage
- REQ-002: The `ReadingSession` must include all required fields:
  - `id`: Auto-generated unique identifier
  - `created_at`: ISO timestamp of when the record was created
  - `level`: The CEFR level selected for the reading practice (A1-C1)
  - `topic`: The topic ID selected for the passage
  - `passageTitle`: The title of the generated passage
  - `wordCount`: Number of words in the passage
  - `readingTimeSeconds`: Time spent reading (from `ReadingTimer`)
  - `wordsPerMinute`: Calculated WPM
  - `questionsTotal`: Total number of comprehension questions
  - `questionsCorrect`: Number of correctly answered questions
  - `scorePercentage`: Percentage score (0-100)
  - `savedWords`: Array of words saved during the session (can be empty)
- REQ-003: Use the existing `useLocalStorage` hook with `READING_HISTORY_STORAGE_KEY`
- REQ-004: Maintain maximum history size of 50 records (existing `MAX_HISTORY_SIZE` constant)

### Should Have (P1)

- REQ-005: Display a brief toast notification confirming the save was successful

### Nice to Have (P2)

- REQ-006: Allow users to optionally skip saving (add a "Save" checkbox before completion)

## Technical Requirements

### Data Models

**ReadingSession** (already defined in `lib/types/local-storage.ts`):
```typescript
interface ReadingSession extends LocalStorageBase {
  level: ReadingLevel;
  topic: ReadingTopicId;
  passageTitle: string;
  wordCount: number;
  readingTimeSeconds: number;
  wordsPerMinute: number;
  questionsTotal: number;
  questionsCorrect: number;
  scorePercentage: number;
  savedWords: string[];
}
```

### Component Changes

**QuestionResults.tsx**:
- Needs access to additional data not currently in props:
  - `passage`: For `level`, `topic`, `passageTitle`, `wordCount`
  - `readingTimeSeconds` and `wordsPerMinute`: From `ReadingTimer`
  - `savedWords`: Words saved during the session

**Reading Page (app/reading/page.tsx)**:
- Must track reading time when timer is running
- Must track saved vocabulary words
- Must pass additional data to `QuestionResults` component

### State Flow

1. User starts reading practice with settings (level, topic)
2. Passage is generated and displayed
3. `ReadingTimer` tracks time spent reading
4. User may save vocabulary words (track in state)
5. User answers comprehension questions
6. User views results in `QuestionResults`
7. User presses `完了` button
8. Application constructs `ReadingSession` from available data
9. Application calls `add()` from `useLocalStorage` hook
10. (Optional) Toast notification confirms save
11. Navigation returns to settings phase

## Non-Functional Requirements

### Performance

- localStorage write should complete synchronously (blocking is acceptable)
- No API calls required for this feature

### Data Integrity

- All numeric fields must be validated (non-negative)
- `savedWords` array should not contain duplicates
- Reading time should be captured at the moment questions are submitted, not when `完了` is pressed

## Acceptance Criteria

- [ ] Pressing `完了` in QuestionResults saves a ReadingSession to localStorage
- [ ] All required fields are populated correctly
- [ ] Saved session appears in history page (`/history` reading tab)
- [ ] Reading WPM and time are accurately recorded
- [ ] Score percentage matches the displayed result
- [ ] Feature works correctly on page refresh (data persists)
- [ ] Maximum 50 records are maintained in history

## Out of Scope

- Server-side storage of reading history
- Syncing history across devices
- Export/import of history data
- Detailed analytics dashboard
- Summary question results (excluded from scoring currently)

## Dependencies

- Existing `useLocalStorage` hook (`lib/hooks/use-local-storage.ts`)
- Existing `ReadingSession` type (`lib/types/local-storage.ts`)
- Existing `READING_HISTORY_STORAGE_KEY` constant
- `ReadingTimer` component for time tracking
- History page for displaying saved records
