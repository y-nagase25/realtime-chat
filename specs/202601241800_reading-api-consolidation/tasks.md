# Implementation Tasks: Reading API Consolidation

## Phase 1: Type System Updates (P0)

- [x] Add `questions: ComprehensionQuestion[]` field to `Passage` type in `lib/types/reading.ts`
- [x] Remove `GenerateQuestionsRequest` type from `lib/types/reading.ts`
- [x] Remove `GenerateQuestionsResponse` type from `lib/types/reading.ts`

## Phase 2: API Route Consolidation (P0)

- [x] Update `app/api/reading/generate/route.ts`:
  - [x] Import `ComprehensionQuestion` type and `uuid`
  - [x] Create combined prompt function `buildCombinedPrompt()` that generates both passage and questions
  - [x] Define `CombinedPassageResponse` type for AI JSON response (title, content, questions)
  - [x] Update handler to parse combined response
  - [x] Add `addQuestionIds()` helper (moved from questions route)
  - [x] Add question validation with graceful degradation (return empty array if questions malformed)
  - [x] Increase max tokens from 1500 to 3500
  - [x] Return `Passage` object with `questions` field populated
- [x] Delete `app/api/reading/questions/route.ts`

## Phase 3: Validation Cleanup (P0)

- [x] Remove `validateGenerateQuestionsRequest` function from `lib/utils/reading-validation.ts`
- [x] Remove `GenerateQuestionsRequest` import from `lib/utils/reading-validation.ts`

## Phase 4: Frontend Updates (P0)

- [x] Update `app/reading/page.tsx`:
  - [x] Modify `handleSubmit` to extract `questions` from generate response and call `setQuestions(data.data.questions)`
  - [x] Simplify `handleFinishReading` to synchronous phase transition only (remove API call, remove try/catch)
  - [x] Remove unused `ApiResponse<{ questions: ComprehensionQuestion[] }>` type usage

## Phase 5: Token Optimization (P1)

- [x] Tune combined prompt to minimize redundant instructions
- [x] Verify max_completion_tokens value (3500) is sufficient for all levels (especially C1 with longer passages)
- [x] Ensure question prompt references "the passage above" rather than duplicating passage content

## Phase 6: Verification

- [x] Run `npm run build` - no TypeScript errors
- [x] Run `npm run lint` - no Biome errors
- [x] Run `npm run format` - code properly formatted
- [ ] Manual test: Generate passage at each level (A1-C1), verify questions returned
- [ ] Manual test: Click "読み終わりました" - questions appear instantly (no network request)
- [ ] Manual test: Verify question types are mixed (at least 2 different types)
- [ ] Manual test: Verify explanationJa fields are in Japanese
- [x] Verify no references to `/api/reading/questions` remain in codebase
