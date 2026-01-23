# Reading Practice Feature - Implementation Tasks

## Overview

This document outlines the implementation tasks for the Reading Practice feature as defined in `requirements.md`.

---

## Phase 1: Foundation & API

### Task 1.1: Create API Endpoint for Passage Generation

- [x] Create `/app/api/reading/generate/route.ts`
- [x] Define request schema (level, topic, grammarFocus)
- [x] Implement GPT-5 prompt for passage generation
- [x] Return structured response (title, content, wordCount, metadata)
- [x] Add error handling and validation
- [x] Add rate limiting middleware

### Task 1.2: Create API Endpoint for Comprehension Questions

- [x] Create `/app/api/reading/questions/route.ts`
- [x] Define request schema (passage content, level)
- [x] Implement GPT-5 prompt for question generation
- [x] Return 3-5 questions with correct answers
- [x] Support multiple question types (multiple choice, true/false, fill-in-blank)

### Task 1.3: Create API Endpoint for Vocabulary Lookup

- [x] Create `/app/api/reading/vocabulary/route.ts`
- [x] Define request schema (word, context sentence)
- [x] Implement GPT-5 prompt for definition and translation
- [x] Return definition, Japanese translation, part of speech, example
- [x] Check against Wasei-Eigo dictionary and include warning if applicable

### Task 1.4: Create API Endpoint for Summary Evaluation

- [x] Create `/app/api/reading/evaluate-summary/route.ts`
- [x] Define request schema (passage, userSummary)
- [x] Implement GPT-5 prompt for evaluation
- [x] Return feedback in Japanese with model summary

---

## Phase 2: Type Definitions & Data

### Task 2.1: Create Type Definitions

- [x] Create `/lib/types/reading.ts`
- [x] Define `ReadingLevel` type (A1, A2, B1, B2, C1)
- [x] Define `ReadingTopic` type with Japanese labels
- [x] Define `GrammarPattern` type
- [x] Define `Passage` interface
- [x] Define `ComprehensionQuestion` interface
- [x] Define `VocabularyEntry` interface
- [x] Define `ReadingSession` interface for progress tracking
- [x] Define `WaseiEigoEntry` interface

### Task 2.2: Create Wasei-Eigo Dictionary

- [x] Create `/lib/data/wasei-eigo.ts`
- [x] Add initial 12 entries from requirements
- [x] Export lookup function by word
- [x] Add type safety for entries

### Task 2.3: Create Constants and Configuration

- [x] Create `/lib/constants/reading.ts`
- [x] Define difficulty levels with metadata (wordCount range, WPM targets)
- [x] Define topics with Japanese labels
- [x] Define grammar patterns with Japanese descriptions

---

## Phase 3: Core UI Components

### Task 3.1: Create Reading Settings Component

- [x] Create `/components/reading/ReadingSettings.tsx`
- [x] Implement level selector dropdown (A1-C1)
- [x] Implement topic selector dropdown (6 topics)
- [x] Implement optional grammar focus selector
- [x] Add Japanese labels for all options
- [x] Style with Tailwind CSS

### Task 3.2: Create Passage Display Component

- [x] Create `/components/reading/PassageDisplay.tsx`
- [x] Display title and metadata (level, word count, estimated time)
- [x] Render passage text with clickable words
- [x] Highlight Wasei-Eigo words with warning icon
- [x] Highlight grammar patterns (if selected)
- [x] Handle word click to trigger vocabulary popup

### Task 3.3: Create Vocabulary Popup Component

- [x] Create `/components/reading/VocabularyPopup.tsx`
- [x] Display word, pronunciation, part of speech
- [x] Display English definition and Japanese translation
- [x] Display Wasei-Eigo warning if applicable
- [x] Display example sentence
- [x] Add "Save to List" button
- [x] Implement click-outside to dismiss
- [x] Position popup near clicked word

### Task 3.4: Create Comprehension Questions Component

- [x] Create `/components/reading/ComprehensionQuestions.tsx`
- [x] Render multiple choice questions with radio buttons
- [x] Render true/false questions
- [x] Render fill-in-the-blank questions with text input
- [x] Track user answers in state
- [x] Add submit button with Japanese label

### Task 3.5: Create Question Results Component

- [x] Create `/components/reading/QuestionResults.tsx`
- [x] Display score as fraction and percentage
- [x] Show correct/incorrect status for each question
- [x] Display correct answer and explanation
- [x] Explanations in Japanese

### Task 3.6: Create Reading Timer Component

- [x] Create `/components/reading/ReadingTimer.tsx`
- [x] Start timer when passage is displayed
- [x] Display elapsed time in mm:ss format
- [x] Calculate and display WPM when finished
- [x] Show target WPM benchmark for current level
- [x] Add "Finished Reading" button

### Task 3.7: Create Summary Writing Component

- [x] Create `/components/reading/SummaryWriting.tsx`
- [x] Text area for user input
- [x] Character/word count display
- [x] Submit button for evaluation
- [x] Display AI feedback in Japanese
- [x] Display model summary for comparison

---

## Phase 4: Main Page Implementation

### Task 4.1: Create Reading Page Layout

- [ ] Create `/app/reading/page.tsx`
- [ ] Set up page metadata with Japanese title
- [ ] Create responsive layout structure
- [ ] Add page header with title and description

### Task 4.2: Implement State Management

- [ ] Define page state (settings, passage, questions, results, timer)
- [ ] Create state transitions for reading flow
- [ ] Handle loading states for API calls
- [ ] Handle error states with Japanese messages

### Task 4.3: Implement Reading Flow

- [ ] Step 1: Settings selection → Generate passage
- [ ] Step 2: Display passage → User reads
- [ ] Step 3: User clicks "Finished" → Show questions
- [ ] Step 4: User answers → Show results
- [ ] Step 5: Optional summary writing
- [ ] Step 6: Option to generate new passage

### Task 4.4: Integrate All Components

- [ ] Wire up ReadingSettings with API call
- [ ] Wire up PassageDisplay with vocabulary lookup
- [ ] Wire up ComprehensionQuestions with submission
- [ ] Wire up QuestionResults display
- [ ] Wire up SummaryWriting with evaluation API
- [ ] Add transitions between steps

---

## Phase 5: Data Persistence

### Task 5.1: Implement Vocabulary Storage

- [ ] Create `/lib/storage/vocabulary.ts`
- [ ] Implement save word to local storage
- [ ] Implement get all saved words
- [ ] Implement remove word from list
- [ ] Add TypeScript types for stored data

### Task 5.2: Implement Session History Storage

- [ ] Create `/lib/storage/reading-history.ts`
- [ ] Implement save session to local storage
- [ ] Implement get session history
- [ ] Store: date, topic, level, score, WPM
- [ ] Limit history to last 50 sessions

### Task 5.3: Display Current Session Stats

- [ ] Show session count on page
- [ ] Show average score (current session)
- [ ] Show reading speed comparison to previous

---

## Phase 6: Polish & UX

### Task 6.1: Loading States

- [ ] Add skeleton loader for passage generation
- [ ] Add spinner for vocabulary lookup
- [ ] Add loading state for question submission
- [ ] Add loading state for summary evaluation

### Task 6.2: Error Handling

- [ ] Display error message if passage generation fails
- [ ] Display error message if vocabulary lookup fails
- [ ] Add retry buttons where appropriate
- [ ] All error messages in Japanese

### Task 6.3: Responsive Design

- [ ] Test and adjust layout for mobile (320px)
- [ ] Test and adjust layout for tablet (768px)
- [ ] Test and adjust layout for desktop (1024px+)
- [ ] Ensure touch targets are 44px minimum

### Task 6.4: Accessibility

- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation works
- [ ] Test color contrast ratios
- [ ] Add focus indicators

### Task 6.5: Final UI Polish

- [ ] Consistent spacing and typography
- [ ] Smooth transitions between steps
- [ ] Proper Japanese font rendering
- [ ] Match existing app design system

---

## Phase 7: Testing & Documentation

### Task 7.1: Manual Testing

- [ ] Test all difficulty levels
- [ ] Test all topics
- [ ] Test vocabulary lookup for various words
- [ ] Test Wasei-Eigo detection
- [ ] Test comprehension question flow
- [ ] Test timer accuracy
- [ ] Test summary evaluation
- [ ] Test local storage persistence

### Task 7.2: Edge Case Testing

- [ ] Test with very short passages
- [ ] Test with very long passages
- [ ] Test rapid clicking on words
- [ ] Test network error scenarios
- [ ] Test local storage quota exceeded

### Task 7.3: Update Navigation

- [ ] Add link to reading page in main navigation
- [ ] Update home page with reading practice card
- [ ] Ensure consistent navigation experience

---

## Task Dependencies

```
Phase 1 (API) ─────────────────┐
                               ├──→ Phase 4 (Page)
Phase 2 (Types & Data) ────────┤
                               │
Phase 3 (Components) ──────────┘

Phase 4 (Page) ──→ Phase 5 (Storage) ──→ Phase 6 (Polish) ──→ Phase 7 (Testing)
```

---

## Estimated Component Count

| Category | Count |
|----------|-------|
| API Routes | 4 |
| Type Files | 1 |
| Data Files | 2 |
| Components | 7 |
| Pages | 1 |
| Storage Utils | 2 |
| **Total Files** | **17** |

---

## Notes

- All UI text should be in Japanese
- Use existing UI components from `/components/ui` where possible
- Follow Biome linting rules
- Use `@/*` path aliases consistently
- Test on Chrome, Safari, and Firefox
