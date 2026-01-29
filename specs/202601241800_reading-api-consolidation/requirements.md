# Feature Requirements: Reading API Consolidation

## Overview

Consolidate the `/api/reading/questions` endpoint into `/api/reading/generate` so that passage generation and comprehension question generation happen in a single API call. This reduces the number of API requests from 2 to 1, improves user wait times by eliminating the sequential second request, and optimizes token consumption by combining prompts.

## User Stories

- As a learner, I want questions to be ready immediately when I finish reading so that I don't have to wait for a second API call.
- As a developer, I want fewer API endpoints to maintain so that the codebase is simpler.
- As a product owner, I want to reduce API costs by combining prompts into a single completion call so that token usage is optimized.

## Functional Requirements

### Must Have (P0)

- REQ-001: The `/api/reading/generate` endpoint must return both a passage and its associated comprehension questions in a single response.
- REQ-002: The combined prompt must generate 3-5 comprehension questions (same as current `/api/reading/questions` behavior).
- REQ-003: Questions must include a mix of types: multiple-choice (4 options), true/false, and fill-in-blank.
- REQ-004: Each question must include `explanation` (English) and `explanationJa` (Japanese) fields.
- REQ-005: The front-end must store the pre-generated questions in component state upon receiving the generate response.
- REQ-006: When the user clicks "読み終わりました" (finish reading), questions must display immediately from local state without any additional API call.
- REQ-007: The `/api/reading/questions` endpoint must be removed (route file deleted).
- REQ-008: The response type (`Passage`) must be extended to include a `questions` field of type `ComprehensionQuestion[]`.
- REQ-009: Question IDs must still be generated (UUID v4) before returning to the client.

### Should Have (P1)

- REQ-010: The combined prompt should be optimized to avoid redundant context (passage text is already generated, not re-sent).
- REQ-011: Token usage for the combined call should be less than the sum of the two individual calls.
- REQ-012: Max tokens for the combined response should be appropriately sized (passage ~1500 + questions ~2000, but optimized since context is shared).

### Nice to Have (P2)

- REQ-013: Add a loading skeleton or indicator on the questions phase in case of slow initial generation.

## Technical Requirements

### Data Models

**Extended `Passage` type:**
```typescript
type Passage = {
  title: string;
  content: string;
  level: ReadingLevel;
  topic: ReadingTopicId;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
  grammarFocus?: GrammarPatternId;
  questions: ComprehensionQuestion[];  // NEW FIELD
};
```

**No changes to `ComprehensionQuestion` types** - retain existing discriminated union with `MultipleChoiceQuestion`, `TrueFalseQuestion`, `FillInBlankQuestion`.

### API Contracts

**Modified endpoint: `POST /api/reading/generate`**

Request (unchanged):
```typescript
{
  level: ReadingLevel;
  topic: ReadingTopicId;
  grammarFocus?: GrammarPatternId;
}
```

Response (extended):
```typescript
{
  success: true;
  data: {
    title: string;
    content: string;
    level: ReadingLevel;
    topic: ReadingTopicId;
    wordCount: number;
    estimatedReadingTimeMinutes: number;
    grammarFocus?: GrammarPatternId;
    questions: ComprehensionQuestion[];  // NEW
  }
}
```

**Removed endpoint: `POST /api/reading/questions`**
- Completely removed. No deprecation period needed (internal API).

### Prompt Engineering

The combined prompt must:
1. First instruct the model to generate the passage (same quality as current)
2. Then instruct it to generate comprehension questions based on the passage it just created
3. Return a single JSON object containing both `title`, `content`, and `questions`
4. Maintain the same question format and quality requirements as the current separate prompt

### Frontend Changes

**`app/reading/page.tsx`:**
- `handleSubmit`: Extract `questions` from the generate response and store in state
- `handleFinishReading`: Remove the API call to `/api/reading/questions`; simply transition to the questions phase (questions already in state)
- Remove loading state logic for question fetching

### Files to Modify

1. `app/api/reading/generate/route.ts` - Merge question generation prompt and logic
2. `lib/types/reading.ts` - Add `questions` field to `Passage` type
3. `app/reading/page.tsx` - Update data flow, remove questions API call
4. `lib/utils/reading-validation.ts` - Remove `validateGenerateQuestionsRequest` (if no other consumers)

### Files to Delete

1. `app/api/reading/questions/route.ts` - Entire endpoint removed

## Non-Functional Requirements

### Performance

- NFR-001: Total generation time should not significantly exceed the current passage-only generation time (target: < 2x current latency for passage generation alone).
- NFR-002: The combined response should arrive before the user finishes reading, so questions are ready instantly when needed.

### Token Optimization

- NFR-003: The combined prompt should use fewer total tokens than sending two separate requests, since the passage text doesn't need to be re-sent as input to the questions prompt.
- NFR-004: Max tokens parameter should be tuned appropriately (estimated 3000-3500 for combined output).

### Reliability

- NFR-005: If question generation fails within the combined call, the passage should still be returned with an empty questions array (graceful degradation).

## Acceptance Criteria

- [ ] `/api/reading/generate` returns passage with questions in a single response
- [ ] Questions include all required fields (type, question, correctAnswer, explanation, explanationJa)
- [ ] Questions include a mix of at least 2 different types
- [ ] Front-end displays questions immediately upon clicking "読み終わりました" with no additional API call
- [ ] `/api/reading/questions` route file is deleted
- [ ] No network request to `/api/reading/questions` is made from the front-end
- [ ] Question IDs are generated (UUID v4) in the response
- [ ] Existing question types (multiple-choice, true-false, fill-in-blank) work correctly
- [ ] Build passes with no TypeScript errors
- [ ] Biome lint/format passes

## Out of Scope

- Changes to vocabulary lookup (`/api/reading/vocabulary`) - remains separate
- Changes to summary evaluation (`/api/reading/evaluate-summary`) - remains separate
- Streaming/SSE for progressive passage display
- Caching of generated passages or questions
- Changes to the ReadingSettings component
- Changes to question UI components (ComprehensionQuestions, QuestionResults)
- Data persistence (Phase 5 in original tasks.md)

## Dependencies

- OpenAI GPT-5 API (existing dependency)
- `uuid` package for question ID generation (existing dependency)
- No new third-party libraries required
