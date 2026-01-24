# Implementation Tasks: Summary Questions

## Phase 1: Foundation (P0 - Types & API)

### 1.1 Extend Type System
- [x] Add `'summary'` to `QuestionType` union in `lib/types/reading.ts`
- [x] Add `SummaryQuestion` type with fields: `id`, `type`, `question`, `questionJa`, `minLength?`, `explanation`, `explanationJa`
- [x] Add `SummaryQuestion` to `ComprehensionQuestion` union type

### 1.2 Update `/api/reading/generate` Endpoint
- [x] Extend `buildCombinedPrompt` to include summary question generation instructions
- [x] Add summary question format to the JSON output schema in the prompt
- [x] Extend `CombinedPassageResponse` type to include summary question fields (`questionJa`, `minLength`)
- [x] Add `'summary'` case to `extractValidQuestions` validation function
- [x] Increase max tokens from 3500 to 4000
- [x] Verify summary questions are appended after regular questions

## Phase 2: Core UI (P0 - Component Updates)

### 2.1 Update ComprehensionQuestions Component
- [x] Add `passageContent` prop to `ComprehensionQuestionsProps`
- [x] Split questions into `regularQuestions` and `summaryQuestions` arrays
- [x] Update `allAnswered` check to only consider regular questions
- [x] Render summary questions after regular questions with a separator
- [x] Pass `passageContent` to summary question inputs

### 2.2 Create SummaryQuestionInput Sub-Component
- [x] Create component with props: `question: SummaryQuestion`, `passageContent: string`
- [x] Add "Optional" badge/label (muted style)
- [x] Display question prompt in English and Japanese (`questionJa`)
- [x] Add text area (4-6 rows, maxLength 2000)
- [x] Add character count indicator (current length / minLength)
- [x] Add individual "Submit" button for the summary question
- [x] Manage local state: text, isEvaluating, feedback, error
- [x] Call `/api/reading/evaluate-summary` on submit
- [x] Show loading spinner during evaluation
- [x] Display evaluation error with retry option

### 2.3 Create SummaryFeedbackDisplay Sub-Component
- [x] Create component with props: `feedback: SummaryFeedback`
- [x] Display key points captured (green list)
- [x] Display key points missed (red list)
- [x] Display grammar feedback in Japanese
- [x] Display vocabulary feedback in Japanese
- [x] Display overall feedback in Japanese
- [x] Display model summary (reference answer)
- [x] Display score badge (0-100)

### 2.4 Update Page-Level Score Calculation
- [x] Filter out `type === 'summary'` questions in `handleSubmitAnswers`
- [x] Ensure `QuestionResults` only receives regular question results
- [x] Pass `passage.content` as `passageContent` prop to `ComprehensionQuestions`

## Phase 3: Polish (P1)

### 3.1 Japanese Instructions
- [x] Verify `questionJa` field is properly rendered in the UI
- [x] Add fallback text if `questionJa` is missing: "要約を書いてください"

### 3.2 Loading & UX States
- [x] Add loading spinner animation to summary submit button
- [x] Disable text area and submit button during evaluation
- [x] Show success state after feedback is received
- [ ] Add smooth transition/animation for feedback appearance

### 3.3 Character Count Guidance
- [x] Show character count below text area: "XX / YY文字" format
- [x] Style count as warning (orange) when below minLength
- [x] Style count as success (green) when at or above minLength
- [x] Disable submit button when text is empty

## Phase 4: Enhancement (P2)

### 4.1 Separate Score Badge
- [ ] Display summary score (0-100) as a separate badge in results
- [ ] Style distinctly from the main comprehension score
- [ ] Only show if user submitted a summary answer

### 4.2 Re-submission Support
- [x] Allow editing text area after feedback is received
- [x] Show "Re-submit" button after initial feedback
- [x] Replace old feedback with new feedback on re-submission

## Testing & Validation

### Type Safety
- [x] Verify TypeScript compilation passes with new types
- [x] Verify `checkAnswer` function handles summary case for exhaustive check

### API Validation
- [ ] Test that `/api/reading/generate` returns summary questions in response
- [ ] Test that summary questions are properly validated in `extractValidQuestions`
- [ ] Test that malformed summary questions are gracefully dropped

### UI Verification
- [ ] Verify regular questions still work as before (no regression)
- [ ] Verify summary questions appear after regular questions
- [ ] Verify "Optional" badge is visible
- [ ] Verify text area accepts input and shows character count
- [ ] Verify submit button calls `/evaluate-summary` endpoint
- [ ] Verify feedback displays correctly inline
- [ ] Verify overall score excludes summary questions
- [ ] Verify submitting regular questions works without answering summary questions

### Build & Lint
- [x] Run `npm run build` - passes
- [x] Run `npm run lint` - passes
- [x] Run `npm run format` - passes
