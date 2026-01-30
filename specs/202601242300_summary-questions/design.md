# Design Specification: Summary Questions

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      /api/reading/generate                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Combined Prompt (passage + regular questions + summary Qs) │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↓                                    │
│  Passage { questions: [...regular, ...summary] }                  │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                   ComprehensionQuestions Component                 │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │  Regular Questions     │  │  Summary Questions (Optional)    │ │
│  │  - Multiple Choice     │  │  - Text Area                     │ │
│  │  - True/False          │  │  - Character Count               │ │
│  │  - Fill-in-Blank       │  │  - Individual Submit Button      │ │
│  └──────────────────────┘  │  - Inline Feedback                │ │
│                              └──────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│  Score Calculation: ONLY regular questions count                   │
│  Summary evaluation: /api/reading/evaluate-summary (existing)     │
└──────────────────────────────────────────────────────────────────┘
```

## Component Design

### Data Layer

#### Type Additions (`lib/types/reading.ts`)

```typescript
// New question type added to QuestionType union
export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'summary';

// New summary question type
export type SummaryQuestion = {
  id: string;
  type: 'summary';
  question: string;
  questionJa: string;
  minLength?: number;
  explanation: string;
  explanationJa: string;
};

// Extended ComprehensionQuestion union
export type ComprehensionQuestion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion
  | SummaryQuestion;
```

#### Key Design Decision: Summary questions share the same `ComprehensionQuestion` union

- Summary questions are part of the `questions[]` array in `Passage`
- They are distinguished by `type: 'summary'`
- The `checkAnswer` function and score calculation filter them out
- No separate data structure needed

### Business Logic Layer

#### Score Calculation (page.tsx)

The `handleSubmitAnswers` function must filter out summary questions:

```typescript
// Only score regular questions
const regularQuestions = questions.filter(q => q.type !== 'summary');
const results = regularQuestions.map(question => {
  const userAnswer = answers[question.id];
  const isCorrect = checkAnswer(question, userAnswer);
  return { question, userAnswer, isCorrect };
});
```

#### Summary Submission Flow

Each summary question submits independently to `/api/reading/evaluate-summary`:

```
User types in text area
  → Clicks "Submit" button on that summary question
  → Loading state shown on that question only
  → POST /api/reading/evaluate-summary { passage, userSummary }
  → Feedback displayed inline below the text area
```

#### "All Answered" Validation

The submit button for regular questions should only consider regular questions:

```typescript
const regularQuestions = questions.filter(q => q.type !== 'summary');
const allAnswered = regularQuestions.every(q => answers[q.id] !== undefined && answers[q.id] !== '');
```

### Presentation Layer

#### ComprehensionQuestions Component Changes

The component will render summary questions after regular questions with:
- A visual separator between regular and summary sections
- "Optional" badge on each summary question
- Text area (4-6 rows) instead of radio buttons or input
- Character count indicator (current / minimum)
- Individual "Submit" button per summary question
- Inline loading spinner during evaluation
- Inline feedback display after evaluation

#### Component Hierarchy

```
ComprehensionQuestions
├── Regular Question List
│   ├── MultipleChoiceInput
│   ├── TrueFalseInput
│   └── FillInBlankInput
├── Submit Button (regular questions only)
└── Summary Question List
    └── SummaryQuestionInput (new)
        ├── Optional Badge
        ├── Question Prompt (EN + JA)
        ├── TextArea (4-6 rows)
        ├── Character Count Indicator
        ├── Submit Button (individual)
        └── SummaryFeedbackDisplay (inline, new)
```

#### New Sub-Components

**SummaryQuestionInput** - Handles a single summary question:
- Props: `question: SummaryQuestion`, `passageContent: string`, `onEvaluate: callback`
- Internal state: text value, loading, feedback

**SummaryFeedbackDisplay** - Renders feedback inline:
- Props: `feedback: SummaryFeedback`
- Displays: key points, grammar/vocabulary/overall feedback (Japanese), model summary, score badge

## API Design

### Modified Endpoint: `POST /api/reading/generate`

**Change**: Extend the prompt to include summary question generation.

The prompt will instruct the AI to also generate 1 summary-type question appended after regular questions.

**Output Format Addition**:
```json
{
  "type": "summary",
  "question": "Summarize the main idea of the passage in 2-3 sentences.",
  "questionJa": "この文章の主なアイデアを2〜3文で要約してください。",
  "minLength": 50,
  "explanation": "A good summary captures the central theme and key supporting details.",
  "explanationJa": "良い要約は中心的なテーマと主要な裏付けの詳細を捉えます。"
}
```

**Validation**: The `extractValidQuestions` function will be extended to handle `type: 'summary'` questions.

**Max Tokens**: Increase from 3500 to 4000 to accommodate the additional summary question.

### Existing Endpoint: `POST /api/reading/evaluate-summary`

No changes needed. The existing endpoint already:
- Accepts `{ passage: string, userSummary: string }`
- Returns `SummaryFeedback` with score, key points, and Japanese feedback

## Security Design

### Input Validation

- Summary text area enforces `maxLength={2000}` at the HTML level
- Before API call, validate: `summary.trim().length > 0 && summary.length <= 2000`
- The existing `/api/reading/evaluate-summary` validation handles server-side checks

### XSS Prevention

- Summary text is passed as JSON string to the API (no HTML rendering of user input)
- Feedback is rendered as text content, not dangerouslySetInnerHTML

## Performance Considerations

### Generation Prompt

- Adding 1 summary question to the prompt adds ~100-150 tokens to the output
- Max tokens increased from 3500 to 4000 (marginal cost increase)
- No noticeable latency impact

### Evaluation Calls

- Summary evaluation is triggered per-question, not batched
- Each call uses the existing `/evaluate-summary` endpoint (already optimized at 1500 max tokens)
- Loading state provides feedback during the ~3-5 second evaluation

### Bundle Size

- No new dependencies required
- New sub-components are small (~100-150 lines each)
- Text area and feedback display use existing Radix UI primitives

## Error Handling Strategy

### Generation Errors

- If summary question fails validation in `extractValidQuestions`, it is silently dropped (graceful degradation)
- The reading experience still works with only regular questions

### Evaluation Errors

- If `/evaluate-summary` fails, show an error message below the text area: "評価に失敗しました。もう一度お試しください。"
- User can re-submit (the submit button remains active)

### Network Errors

- Caught in try/catch, error state displayed inline
- No impact on the main question flow or score

## State Management

### New State in ComprehensionQuestions

```typescript
// Per-summary-question state
type SummaryQuestionState = {
  text: string;
  isEvaluating: boolean;
  feedback: SummaryFeedback | null;
  error: string | null;
};
```

This state is managed locally within `SummaryQuestionInput` components, not lifted to the page level. This keeps summary question interactions independent of the main question flow.

### Props Changes

```typescript
type ComprehensionQuestionsProps = {
  questions: ComprehensionQuestion[];
  onSubmit: (answers: Record<string, UserAnswer>) => void;
  isSubmitting: boolean;
  passageContent: string;  // NEW: needed for summary evaluation
};
```
