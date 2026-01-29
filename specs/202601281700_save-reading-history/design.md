# Design Specification: Save Reading History on Completion

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Reading Page                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │ Settings    │  │ Passage     │  │ State Management            │  │
│  │ (level,     │──│ Display     │──│ - elapsedSeconds            │  │
│  │  topic)     │  │             │  │ - savedWords[]              │  │
│  └─────────────┘  └─────────────┘  │ - passage                   │  │
│         │               │          │ - questionResults           │  │
│         ▼               ▼          └─────────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐             │                     │
│  │ Reading     │  │ Vocabulary  │             │                     │
│  │ Timer       │──│ Popup       │─────────────┤                     │
│  │ (time)      │  │ (save word) │             │                     │
│  └─────────────┘  └─────────────┘             │                     │
│         │                                      │                     │
│         ▼                                      ▼                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    QuestionResults                           │   │
│  │  Props: results, passage, readingTime, savedWords, onSave    │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │ 完了 Button → onSave() → useLocalStorage.add()          │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    localStorage                              │   │
│  │  Key: "reading-practice-history"                             │   │
│  │  Value: ReadingSession[]                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Design

### Data Layer

**ReadingSession Type** (existing - no changes):
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

**Data Validation Rules**:
- `readingTimeSeconds` >= 0
- `wordsPerMinute` >= 0
- `questionsTotal` >= 0
- `questionsCorrect` >= 0 and <= `questionsTotal`
- `scorePercentage` >= 0 and <= 100
- `savedWords` contains unique strings only

### Business Logic Layer

**WPM Calculation**:
```typescript
function calculateWpm(wordCount: number, readingTimeSeconds: number): number {
  if (readingTimeSeconds <= 0) return 0;
  return Math.round((wordCount / readingTimeSeconds) * 60);
}
```

**Session Data Construction**:
```typescript
type SessionData = Omit<ReadingSession, 'id' | 'created_at'>;

function buildSessionData(
  passage: Passage,
  readingTimeSeconds: number,
  results: QuestionResult[],
  savedWords: string[]
): SessionData {
  const correctCount = results.filter(r => r.isCorrect).length;
  const totalCount = results.length;
  const percentage = totalCount > 0
    ? Math.round((correctCount / totalCount) * 100)
    : 0;

  return {
    level: passage.level,
    topic: passage.topic,
    passageTitle: passage.title,
    wordCount: passage.wordCount,
    readingTimeSeconds,
    wordsPerMinute: calculateWpm(passage.wordCount, readingTimeSeconds),
    questionsTotal: totalCount,
    questionsCorrect: correctCount,
    scorePercentage: percentage,
    savedWords: [...new Set(savedWords)], // Remove duplicates
  };
}
```

### Presentation Layer

**QuestionResults Props Update**:
```typescript
// Current props
type QuestionResultsProps = {
  results: QuestionResult[];
  onNewPassage: () => void;
};

// Updated props
type QuestionResultsProps = {
  results: QuestionResult[];
  passage: Passage;
  readingTimeSeconds: number;
  savedWords: string[];
  onComplete: () => void;  // Renamed from onNewPassage for clarity
};
```

**Reading Page State Additions**:
```typescript
// New state variables
const [elapsedSeconds, setElapsedSeconds] = useState(0);
const [savedWords, setSavedWords] = useState<string[]>([]);

// Capture time when questions are submitted (not when viewing results)
const [capturedReadingTime, setCapturedReadingTime] = useState(0);
```

**Event Flow**:
1. `ReadingTimer` reports elapsed time via callback or ref
2. `VocabularyPopup.onSave` adds word to `savedWords` state
3. `handleSubmitAnswers` captures current reading time
4. `QuestionResults` receives all data via props
5. `完了` button calls `onComplete` which:
   - Constructs `SessionData`
   - Calls `useLocalStorage.add()`
   - Shows toast notification (P1)
   - Resets state and returns to settings

## State Management Design

### Reading Timer Integration

**Option A: Callback prop** (Recommended)
```typescript
// ReadingTimer with callback
type ReadingTimerProps = {
  isRunning: boolean;
  wordCount: number;
  level: ReadingLevel;
  onTimeUpdate?: (seconds: number) => void;  // New prop
};

// Usage in page
<ReadingTimer
  isRunning={phase === 'reading'}
  wordCount={passage.wordCount}
  level={passage.level}
  onTimeUpdate={setElapsedSeconds}
/>
```

**Option B: Expose via ref**
```typescript
// ReadingTimer with ref
const timerRef = useRef<{ getElapsedSeconds: () => number }>(null);

// Capture time
const time = timerRef.current?.getElapsedSeconds() ?? 0;
```

**Decision**: Use Option A (callback) for simplicity and React best practices.

### Saved Words Tracking

```typescript
// In reading page
const [savedWords, setSavedWords] = useState<string[]>([]);

const handleSaveWord = useCallback(() => {
  if (vocabPopup?.word) {
    setSavedWords(prev => {
      if (prev.includes(vocabPopup.word)) return prev;
      return [...prev, vocabPopup.word];
    });
  }
  setVocabPopup(prev => prev ? { ...prev, isSaved: true } : null);
}, [vocabPopup?.word]);
```

## Error Handling Strategy

### localStorage Errors

```typescript
try {
  add(sessionData);
  toast.success('学習履歴を保存しました');
} catch (error) {
  console.error('Failed to save reading history:', error);
  toast.error('履歴の保存に失敗しました');
}
```

### Data Validation Errors

- If `passage` is null when completing, log error and skip save
- If `readingTimeSeconds` is 0, still save (user may have very fast reading)

## Performance Considerations

- localStorage write is synchronous and fast (<1ms for this data size)
- No performance concerns for this feature
- `savedWords` deduplication uses Set for O(n) complexity

## Security Considerations

- Data stored in localStorage is client-only
- No sensitive information in `ReadingSession`
- No authentication required
