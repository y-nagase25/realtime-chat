# Design Specification: Reading API Consolidation

## Architecture Overview

### Current Flow (2 API Calls)

```
User selects settings
  → POST /api/reading/generate (passage only)
  → User reads passage
  → Clicks "読み終わりました"
  → POST /api/reading/questions (sends passage text back)
  → Questions displayed
```

### New Flow (1 API Call)

```
User selects settings
  → POST /api/reading/generate (passage + questions)
  → Questions stored in frontend state
  → User reads passage
  → Clicks "読み終わりました"
  → Questions displayed instantly from state (no API call)
```

### Token Savings

Current: 2 separate completions
- Call 1: System prompt (~300 tokens) → Passage output (~500-1000 tokens)
- Call 2: System prompt (~500 tokens) + Passage as input (~500-1000 tokens) → Questions output (~800-1500 tokens)
- Total input: ~1300-1800 tokens, Total output: ~1300-2500 tokens

New: 1 combined completion
- Call 1: System prompt (~600 tokens) → Passage + Questions output (~1300-2500 tokens)
- Total input: ~600 tokens, Total output: ~1300-2500 tokens
- **Savings: ~700-1200 input tokens per request** (passage text not re-sent)

## Component Design

### Data Layer

**Modified Type: `Passage`** (`lib/types/reading.ts`)

```typescript
export type Passage = {
  title: string;
  content: string;
  level: ReadingLevel;
  topic: ReadingTopicId;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
  grammarFocus?: GrammarPatternId;
  questions: ComprehensionQuestion[];  // NEW
};
```

**Removed Types:**
- `GenerateQuestionsRequest` - no longer needed (internal to generate endpoint)
- `GenerateQuestionsResponse` - replaced by extended `Passage` response

**AI Response Schema** (internal to route handler):

```typescript
type CombinedPassageResponse = {
  title: string;
  content: string;
  questions: Array<{
    type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
    question: string;
    options?: [string, string, string, string];
    correctAnswer: number | boolean | string;
    acceptableAnswers?: string[];
    explanation: string;
    explanationJa: string;
  }>;
};
```

### Business Logic Layer

**Combined Prompt Strategy:**

The prompt instructs the model to:
1. Generate the passage first
2. Then create comprehension questions about that passage
3. Return everything in a single JSON structure

This avoids the current inefficiency where the full passage text is sent back as input for question generation.

**Question ID Generation:**

After parsing the AI response, the handler adds UUID v4 IDs to each question before returning to the client. This remains unchanged from current behavior.

**Validation:**

The `validateGeneratePassageRequest` function remains unchanged. The `validateGenerateQuestionsRequest` function is removed since question generation no longer has a separate endpoint.

**Error Handling - Graceful Degradation:**

If the AI response includes a valid passage but malformed questions, the handler returns the passage with an empty `questions: []` array rather than failing entirely. This ensures the user can still read the passage even if question generation has issues.

### Presentation Layer

**`app/reading/page.tsx` State Changes:**

```typescript
// handleSubmit now extracts questions from generate response
const handleSubmit = async (settings: ReadingSettingsValue) => {
  const data = await apiPost<ApiResponse<Passage>>('/api/reading/generate', settings);
  setPassage(data.data);
  setQuestions(data.data.questions);  // Store pre-generated questions
  setPhase('reading');
};

// handleFinishReading becomes synchronous - no API call
const handleFinishReading = () => {
  setVocabPopup(null);
  setPhase('questions');
  // Questions already in state from initial generation
};
```

## API Design

### Modified Endpoint: `POST /api/reading/generate`

**Request** (unchanged):
```json
{
  "level": "B1",
  "topic": "daily-life",
  "grammarFocus": "present-perfect"  // optional
}
```

**Response** (extended):
```json
{
  "success": true,
  "data": {
    "title": "A Day at the Market",
    "content": "Maria walked through the busy...",
    "level": "B1",
    "topic": "daily-life",
    "wordCount": 287,
    "estimatedReadingTimeMinutes": 2,
    "grammarFocus": "present-perfect",
    "questions": [
      {
        "id": "uuid-v4-here",
        "type": "multiple-choice",
        "question": "What did Maria buy at the market?",
        "options": ["Fruits", "Vegetables", "Both fruits and vegetables", "Nothing"],
        "correctAnswer": 2,
        "explanation": "The passage states that Maria bought both...",
        "explanationJa": "本文には、マリアは果物と野菜の両方を..."
      },
      {
        "id": "uuid-v4-here",
        "type": "true-false",
        "question": "Maria has visited this market many times before.",
        "correctAnswer": true,
        "explanation": "The text mentions she has been coming here for years...",
        "explanationJa": "テキストでは、彼女が何年も通っていると..."
      }
    ]
  }
}
```

### Removed Endpoint: `POST /api/reading/questions`

Deleted entirely. No deprecation needed (internal API, single consumer).

## Prompt Design

### Combined System Prompt Structure

```
You are an expert English teacher creating reading material for Japanese learners.

Generate an engaging English reading passage AND comprehension questions with the following specifications:

**Passage Requirements:**
[...existing passage requirements...]

**Comprehension Questions Requirements:**
[...existing question requirements, adapted to reference "the passage you generated above"...]

**Output Format:**
Return a valid JSON object with exactly this structure:
{
  "title": "...",
  "content": "...",
  "questions": [...]
}
```

Key differences from current prompts:
1. Single prompt combines both instructions
2. Questions reference "the passage you generated" instead of receiving it as input
3. Max tokens increased to 3500 to accommodate both passage and questions
4. JSON schema includes both passage and questions fields

## Error Handling Strategy

| Scenario | Behavior |
|----------|----------|
| AI returns valid passage + valid questions | Return full response |
| AI returns valid passage + invalid questions | Return passage with `questions: []` |
| AI returns invalid passage | Throw error, return 500 |
| AI returns no response | Throw error, return 500 |
| Request validation fails | Return 400 with validation error |

## Performance Considerations

- **Latency**: Single API call eliminates round-trip for second request. However, the combined completion is larger, so generation time increases slightly. Net effect is still faster for the user since they don't wait for the second call after finishing reading.
- **Max Tokens**: Set to 3500 (up from 1500 for passage-only). This accommodates ~500-1000 tokens for the passage and ~1500-2000 for questions within a single response.
- **Token Efficiency**: Saves ~700-1200 input tokens per usage by not re-sending the passage text as input to a separate questions endpoint.
