# Feature Requirements: Summary Questions

## Overview

Add summary questions to the reading training feature that appear alongside regular comprehension questions. Summary questions are optional (not required), use free-form text input evaluated by the `/evaluate-summary` API, and their scores do not affect the overall comprehension score.

## User Stories

- As a learner, I want to see summary questions after regular comprehension questions so that I can optionally practice summarizing what I read.
- As a learner, I want summary questions to be clearly marked as optional so that I don't feel pressured to answer them.
- As a learner, I want my summary answers evaluated with detailed feedback so that I can improve my writing skills.
- As a learner, I want my overall score to reflect only required questions so that optional summary practice doesn't penalize me.

## Functional Requirements

### Must Have (P0)

- REQ-001: Summary questions are displayed in the same list as regular comprehension questions, appearing after all regular questions.
- REQ-002: Summary questions use a text area input for free-form written answers.
- REQ-003: Summary questions are visually marked as "Optional" so users understand they can skip them.
- REQ-004: Summary questions are generated as part of the `/api/reading/generate` response (included in the combined prompt).
- REQ-005: When a user submits an answer to a summary question, a request is made to `POST /api/reading/evaluate-summary` with the passage content and the user's answer.
- REQ-006: The overall comprehension score calculation excludes summary questions entirely (only regular questions count).
- REQ-007: Summary question evaluation feedback is displayed inline (below the text area) after submission.

### Should Have (P1)

- REQ-008: Each summary question includes a Japanese prompt/instruction explaining what the user should write.
- REQ-009: The evaluation feedback displays: key points captured, key points missed, grammar feedback (Japanese), vocabulary feedback (Japanese), overall feedback (Japanese), and a model summary.
- REQ-010: A loading indicator is shown while the `/evaluate-summary` request is in progress.
- REQ-011: Summary questions have a minimum character count indicator (e.g., "Write at least 50 characters") to guide users.

### Nice to Have (P2)

- REQ-012: Summary question score (0-100) is displayed separately as a "Summary Score" badge, distinct from the main score.
- REQ-013: Users can re-submit their summary answer to get updated feedback.

## Technical Requirements

### Data Models

**New Question Type** (addition to `ComprehensionQuestion` union):

```typescript
type SummaryQuestion = {
  type: 'summary';
  question: string;         // The prompt in English (e.g., "Summarize the main idea...")
  questionJa: string;       // Japanese instruction
  minLength?: number;       // Minimum character count suggestion
  explanation: string;      // Not used for scoring, but for context
  explanationJa: string;
};
```

**Extended Passage Type:**

The `questions` array in `Passage` already supports mixed types. Summary questions are simply additional entries with `type: 'summary'`.

### API Contracts

**Modified Endpoint: `POST /api/reading/generate`**

- Response: `Passage` object now includes 1-2 summary questions appended after regular questions in the `questions` array.
- The generation prompt instructs the AI to include summary-type questions.

**Existing Endpoint: `POST /api/reading/evaluate-summary`**

- Request: `{ passage: string, summary: string }`
- Response: `SummaryFeedback` (already defined — includes score, key points, grammar/vocabulary/overall feedback in Japanese, model summary)
- No changes needed to this endpoint.

### UI/UX Requirements

- Summary questions appear after all regular questions in the `ComprehensionQuestions` component.
- Each summary question displays:
  - An "Optional" badge/label (e.g., gray or blue tag)
  - The question prompt (English + Japanese)
  - A text area (4-6 rows) for the answer
  - A character count indicator
  - A "Submit" button (distinct from the main answer submission)
- After submission, feedback is displayed inline below the text area.
- In the results phase, summary question results are shown in a separate section from the main score.

## Non-Functional Requirements

### Performance

- Summary question evaluation should complete within 10 seconds (existing `/evaluate-summary` latency).
- The addition of summary questions to the `/generate` prompt should not significantly increase generation time (< 2 seconds additional).

### Security

- Summary text input must be sanitized before sending to the API.
- Maximum text length should be enforced (e.g., 2000 characters) to prevent abuse.

## Acceptance Criteria

- [ ] Summary questions appear after regular questions in the question list
- [ ] Summary questions are clearly marked as "Optional"
- [ ] Summary questions use a text area for free-form input
- [ ] Submitting a summary answer calls `/api/reading/evaluate-summary`
- [ ] Evaluation feedback is displayed inline after submission
- [ ] The overall comprehension score excludes summary questions
- [ ] The `/generate` endpoint returns summary-type questions in the response
- [ ] Users can skip summary questions without affecting their score
- [ ] Loading state is shown during evaluation
- [ ] Character count guidance is displayed

## Out of Scope

- Changing the existing `SummaryWriting` component (separate from this feature)
- Adding summary questions to the results phase score breakdown
- Persisting summary question answers or feedback
- Offline evaluation of summary answers
- Multiple summary submissions per session (P2 nice-to-have)

## Dependencies

- Existing `/api/reading/evaluate-summary` endpoint (no changes needed)
- Existing `/api/reading/generate` endpoint (prompt modification needed)
- `ComprehensionQuestion` type union in `lib/types/reading.ts` (extension needed)
- `ComprehensionQuestions` component (modification needed)
