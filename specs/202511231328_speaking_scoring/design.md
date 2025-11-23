# Design Specification: Speaking Practice Scoring System

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Presentation Layer (React Components)              │    │
│  │  - SpeakingPractice (main container)                │    │
│  │  - AudioRecorder                                    │    │
│  │  - TranscriptDisplay                                │    │
│  │  - ScoringResults                                   │    │
│  │  - AttemptHistory                                   │    │
│  └─────────────┬──────────────────────────────────────┘    │
│                │                                             │
│  ┌─────────────▼──────────────────────────────────────┐    │
│  │  State Management (React Hooks)                     │    │
│  │  - useRecording                                     │    │
│  │  - useSpeakingScoring                               │    │
│  │  - useLocalStorage                                  │    │
│  └─────────────┬──────────────────────────────────────┘    │
│                │                                             │
│  ┌─────────────▼──────────────────────────────────────┐    │
│  │  Data Layer (Local Storage)                         │    │
│  │  - speaking_attempts: SpeakingAttempt[]             │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTPS
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   API Layer (Next.js)                        │
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │ POST /api/transcribe │    │ POST /api/speaking/  │      │
│  │                      │    │      score           │      │
│  │ - Validate audio     │    │ - Validate request   │      │
│  │ - Call Whisper API   │    │ - Build prompt       │      │
│  │ - Return transcript  │    │ - Call GPT-4o        │      │
│  └──────────┬───────────┘    └──────────┬───────────┘      │
└─────────────┼──────────────────────────┼───────────────────┘
              │                          │
              │                          │
┌─────────────▼──────────────────────────▼───────────────────┐
│                   OpenAI APIs                               │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Whisper API     │         │  GPT-4o API       │         │
│  │  (whisper-1)     │         │  (Chat Completion)│         │
│  │  Audio → Text    │         │  Text → Scoring   │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Phase 1: Recording & Transcription**
```
User → Click "Start Recording"
     → MediaRecorder starts
     → Audio visualization shown
     → User clicks "Stop Recording"
     → Audio blob created
     → POST /api/transcribe (audio blob)
     → Whisper API transcribes
     → Transcript displayed
     → "Score" button enabled
```

**Phase 2: Scoring (User-Triggered)**
```
User → Reviews transcript
     → Clicks "Score" button
     → POST /api/speaking/score (transcript + question + model answer)
     → GPT-4o evaluates text
     → Scoring result returned
     → Results displayed
     → Attempt saved to local storage
```

## Component Design

### Presentation Layer

#### Component Hierarchy

```
SpeakingPracticePage
├── Questions (existing)
│   └── QuestionBadge (existing)
└── SpeakingPractice (new)
    ├── AudioRecorder
    │   ├── RecordButton
    │   ├── AudioVisualizer
    │   └── RecordingTimer
    ├── TranscriptDisplay
    │   ├── TranscriptText
    │   └── ScoreButton
    ├── ScoringResults
    │   ├── ScoreBadge
    │   ├── TranscriptSection
    │   ├── ImprovementsList
    │   └── GoodPointsList
    └── AttemptHistory
        ├── HistoryList
        ├── HistoryItem
        └── SessionStats
```

#### Component Specifications

**SpeakingPractice** (Container Component)
```typescript
interface SpeakingPracticeProps {
  question: Question;
}

type SpeakingState =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'transcribed'
  | 'scoring'
  | 'completed';

const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({ question }) => {
  const [state, setState] = useState<SpeakingState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

  // Manages overall state and coordinates child components
};
```

**AudioRecorder**
```typescript
interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  disabled
}) => {
  const {
    isRecording,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
    error
  } = useRecording();

  // Handles audio recording lifecycle
};
```

**TranscriptDisplay**
```typescript
interface TranscriptDisplayProps {
  transcript: string;
  onScore: () => void;
  isScoring: boolean;
  canScore: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  onScore,
  isScoring,
  canScore
}) => {
  // Displays transcript and Score button
};
```

**ScoringResults**
```typescript
interface ScoringResultsProps {
  result: ScoringResult;
  transcript: string;
}

interface ScoringResult {
  score: number;
  areasForImprovement: string[];
  goodPoints: string[];
  processingTime: number;
}

const ScoringResults: React.FC<ScoringResultsProps> = ({
  result,
  transcript
}) => {
  // Displays score, feedback, and transcript
};
```

**AttemptHistory**
```typescript
interface AttemptHistoryProps {
  questionId: number;
}

const AttemptHistory: React.FC<AttemptHistoryProps> = ({ questionId }) => {
  const attempts = useAttemptHistory(questionId);
  const stats = useSessionStats();

  // Displays past attempts and session statistics
};
```

### Business Logic Layer

#### Custom Hooks

**useRecording**
```typescript
interface UseRecordingReturn {
  isRecording: boolean;
  audioLevel: number;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
}

export function useRecording(): UseRecordingReturn {
  // MediaRecorder API integration
  // Audio level monitoring
  // Error handling
}
```

**useSpeakingScoring**
```typescript
interface UseSpeakingScoringOptions {
  questionId: number;
  questionText: string;
  modelAnswer: string;
}

interface UseSpeakingScoringReturn {
  state: SpeakingState;
  transcript: string | null;
  scoringResult: ScoringResult | null;
  error: string | null;
  transcribeAudio: (audioBlob: Blob) => Promise<void>;
  requestScoring: (transcript: string) => Promise<void>;
  reset: () => void;
}

export function useSpeakingScoring(
  options: UseSpeakingScoringOptions
): UseSpeakingScoringReturn {
  // Orchestrates transcription and scoring
  // Manages state transitions
  // Error handling and retry logic
}
```

**useLocalStorage**
```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  // Read from local storage
  // Write to local storage
  // Clear local storage
  // Handle JSON parse errors
}
```

**useAttemptHistory**
```typescript
interface UseAttemptHistoryReturn {
  attempts: SpeakingAttempt[];
  addAttempt: (attempt: Omit<SpeakingAttempt, 'id' | 'created_at'>) => void;
  clearHistory: () => void;
  getQuestionAttempts: (questionId: number) => SpeakingAttempt[];
}

export function useAttemptHistory(): UseAttemptHistoryReturn {
  // Load attempts from local storage
  // Add new attempts
  // Filter by question ID
  // Persist to local storage
}
```

#### Utility Functions

**audio.ts**
```typescript
export async function createAudioBlob(
  mediaRecorder: MediaRecorder,
  chunks: Blob[]
): Promise<Blob> {
  // Combine audio chunks into single blob
}

export function formatDuration(ms: number): string {
  // Format milliseconds as MM:SS
}

export async function getAudioLevel(
  stream: MediaStream
): Promise<number> {
  // Get current audio level from stream
}
```

**scoring.ts**
```typescript
export function buildScoringPrompt(
  questionText: string,
  modelAnswer: string,
  userTranscript: string
): string {
  // Build prompt for GPT-4o
}

export function getScoreColor(score: number): string {
  // green: 8-10, yellow: 5-7, red: 0-4
}

export function calculateSessionStats(
  attempts: SpeakingAttempt[]
): SessionStats {
  // Calculate average score, total attempts, etc.
}
```

**validation.ts**
```typescript
export function validateAudioBlob(blob: Blob): void {
  // Check file size
  // Check MIME type
  // Throw error if invalid
}

export function validateSpeakingAttempt(data: unknown): SpeakingAttempt {
  // Runtime type validation for local storage data
  // Prevent injection attacks
}
```

### Data Layer

#### Type Definitions

**types/speaking.ts**
```typescript
export interface SpeakingAttempt {
  id: string;
  question_id: number;
  transcript: string;
  score: number;
  areas_for_improvement: string[];
  good_points: string[];
  created_at: string;
  processing_time_ms: number;
}

export interface ScoringResult {
  score: number;
  areasForImprovement: string[];
  goodPoints: string[];
  processingTime: number;
}

export interface SessionStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  latestScore: number | null;
}

export type SpeakingState =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'transcribed'
  | 'scoring'
  | 'completed'
  | 'error';
```

#### Local Storage Schema

**Storage Key**: `speaking_attempts`

**Data Structure**:
```typescript
{
  "speaking_attempts": [
    {
      "id": "uuid-v4-string",
      "question_id": 1,
      "transcript": "This is my answer...",
      "score": 8,
      "areas_for_improvement": [
        "Use more varied vocabulary",
        "Watch grammar with past tense"
      ],
      "good_points": [
        "Clear pronunciation",
        "Good content coverage"
      ],
      "created_at": "2025-11-23T12:34:56.789Z",
      "processing_time_ms": 3500
    }
  ]
}
```

## API Design

### Endpoints

#### POST /api/transcribe (Existing)

**Description**: Transcribes audio to text using Whisper API

**Request**:
```typescript
Content-Type: multipart/form-data

{
  file: File  // Audio blob (webm, mp3, wav, etc.)
}
```

**Response**:
```typescript
{
  text: string  // Transcribed text
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  error: "No audio file provided"
}

// 413 Payload Too Large
{
  error: "Audio file exceeds size limit"
}

// 500 Internal Server Error
{
  error: "Transcription failed"
}
```

#### POST /api/speaking/score (New)

**Description**: Scores user's transcribed response against model answer

**Request**:
```typescript
Content-Type: application/json

{
  questionId: number;
  questionText: string;
  modelAnswer: string;
  userTranscript: string;
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    score: number;           // 0-10
    areasForImprovement: string[];
    goodPoints: string[];
    processingTime: number;  // milliseconds
  }
}
```

**Error Responses**:
```typescript
// 400 Bad Request
{
  success: false,
  error: "Missing required fields"
}

// 500 Internal Server Error
{
  success: false,
  error: "Scoring failed"
}
```

**Implementation**:
```typescript
// app/api/speaking/score/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionText, modelAnswer, userTranscript } = body;

    // Validation
    if (!questionText || !modelAnswer || !userTranscript) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Build prompt
    const prompt = buildScoringPrompt(questionText, modelAnswer, userTranscript);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        score: result.score,
        areasForImprovement: result.areasForImprovement,
        goodPoints: result.goodPoints,
        processingTime,
      },
    });

  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Scoring failed' },
      { status: 500 }
    );
  }
}
```

## Security Design

### Input Validation

**Audio File Validation**:
```typescript
const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB (Whisper limit)
const ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg'
];

function validateAudioFile(file: File): void {
  if (!file) {
    throw new Error('No audio file provided');
  }

  if (file.size > MAX_AUDIO_SIZE) {
    throw new Error('Audio file exceeds size limit');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid audio file type');
  }
}
```

**Scoring Request Validation**:
```typescript
function validateScoringRequest(data: unknown): void {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid request format');
  }

  const { questionText, modelAnswer, userTranscript } = data as any;

  if (typeof questionText !== 'string' || questionText.length === 0) {
    throw new Error('Invalid question text');
  }

  if (typeof modelAnswer !== 'string' || modelAnswer.length === 0) {
    throw new Error('Invalid model answer');
  }

  if (typeof userTranscript !== 'string' || userTranscript.length === 0) {
    throw new Error('Invalid user transcript');
  }

  // Prevent excessively long inputs
  if (userTranscript.length > 5000) {
    throw new Error('Transcript too long');
  }
}
```

### API Key Protection

**Environment Variables**:
```bash
# .env
OPENAI_API_KEY=sk-...
```

**Server-Side Only**:
- OpenAI API calls only from API routes
- Never expose API key to client
- Use Next.js server-side rendering

### Local Storage Security

**Data Sanitization**:
```typescript
function sanitizeLocalStorageData(data: unknown): SpeakingAttempt[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(item => {
    return (
      typeof item.id === 'string' &&
      typeof item.question_id === 'number' &&
      typeof item.transcript === 'string' &&
      typeof item.score === 'number' &&
      Array.isArray(item.areas_for_improvement) &&
      Array.isArray(item.good_points)
    );
  });
}
```

## Performance Considerations

### Transcription Optimization

**Whisper API Configuration**:
```typescript
{
  model: 'whisper-1',
  temperature: 0.1,  // More deterministic
  language: 'en',    // Specify language for faster processing
}
```

### Scoring Optimization

**GPT-4o Configuration**:
```typescript
{
  model: 'gpt-4o',
  temperature: 0.3,         // Consistent but creative
  max_tokens: 500,          // Limit response length
  response_format: { type: 'json_object' },  // Structured output
}
```

### Client-Side Optimization

**Audio Recording**:
```typescript
// Use compressed format
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000,  // 128kbps sufficient for speech
});
```

**Local Storage**:
```typescript
// Limit stored attempts to prevent quota issues
const MAX_ATTEMPTS = 100;

function addAttempt(attempt: SpeakingAttempt): void {
  const attempts = getAttempts();

  if (attempts.length >= MAX_ATTEMPTS) {
    // Remove oldest attempts
    attempts.splice(0, attempts.length - MAX_ATTEMPTS + 1);
  }

  attempts.push(attempt);
  saveAttempts(attempts);
}
```

### Loading States

**Optimistic UI Updates**:
```typescript
// Show immediate feedback while waiting for API
setState('transcribing');  // Before API call
// ... API call
setState('transcribed');   // After success
```

**Progress Indicators**:
- Transcribing: Spinner with "Transcribing audio..."
- Scoring: Spinner with "Evaluating your response..."
- Use skeleton loaders for results

## Error Handling Strategy

### User-Facing Errors

**Error Categories**:
```typescript
type ErrorType =
  | 'permission_denied'     // Microphone permission
  | 'network_error'         // API request failed
  | 'transcription_failed'  // Whisper API error
  | 'scoring_failed'        // GPT-4o API error
  | 'validation_error'      // Invalid input
  | 'unknown_error';        // Unexpected error

interface UserError {
  type: ErrorType;
  message: string;
  action?: string;  // Suggested action
}
```

**Error Messages**:
```typescript
const ERROR_MESSAGES: Record<ErrorType, UserError> = {
  permission_denied: {
    type: 'permission_denied',
    message: 'Microphone access is required to record your response.',
    action: 'Please allow microphone access in your browser settings.',
  },
  network_error: {
    type: 'network_error',
    message: 'Unable to connect to the server.',
    action: 'Please check your internet connection and try again.',
  },
  transcription_failed: {
    type: 'transcription_failed',
    message: 'Failed to transcribe your audio.',
    action: 'Please try recording again.',
  },
  scoring_failed: {
    type: 'scoring_failed',
    message: 'Failed to score your response.',
    action: 'Please try again.',
  },
  validation_error: {
    type: 'validation_error',
    message: 'Invalid input provided.',
    action: 'Please check your input and try again.',
  },
  unknown_error: {
    type: 'unknown_error',
    message: 'An unexpected error occurred.',
    action: 'Please try again later.',
  },
};
```

### Recovery Mechanisms

**Retry Logic**:
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry validation errors
      if (error instanceof ValidationError) {
        throw error;
      }

      // Exponential backoff
      if (i < maxRetries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  throw lastError!;
}
```

**State Recovery**:
```typescript
function handleError(error: Error, currentState: SpeakingState): void {
  // Log error for debugging
  console.error('Speaking practice error:', error);

  // Reset to appropriate state
  if (currentState === 'transcribing') {
    setState('idle');
    setError('transcription_failed');
  } else if (currentState === 'scoring') {
    setState('transcribed');
    setError('scoring_failed');
  }

  // Show user-friendly error message
  showErrorToast(error);
}
```

### Logging

**Client-Side Logging**:
```typescript
function logError(
  context: string,
  error: Error,
  metadata?: Record<string, any>
): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack,
    metadata,
  };

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorLog);
  }

  // Could send to error tracking service in production
}
```

## State Management

### State Machine

```typescript
type SpeakingState =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'transcribed'
  | 'scoring'
  | 'completed'
  | 'error';

type SpeakingEvent =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'TRANSCRIPTION_SUCCESS'; transcript: string }
  | { type: 'TRANSCRIPTION_ERROR'; error: Error }
  | { type: 'REQUEST_SCORING' }
  | { type: 'SCORING_SUCCESS'; result: ScoringResult }
  | { type: 'SCORING_ERROR'; error: Error }
  | { type: 'RESET' };

function speakingReducer(
  state: SpeakingState,
  event: SpeakingEvent
): SpeakingState {
  switch (state) {
    case 'idle':
      if (event.type === 'START_RECORDING') return 'recording';
      break;
    case 'recording':
      if (event.type === 'STOP_RECORDING') return 'transcribing';
      break;
    case 'transcribing':
      if (event.type === 'TRANSCRIPTION_SUCCESS') return 'transcribed';
      if (event.type === 'TRANSCRIPTION_ERROR') return 'error';
      break;
    case 'transcribed':
      if (event.type === 'REQUEST_SCORING') return 'scoring';
      if (event.type === 'RESET') return 'idle';
      break;
    case 'scoring':
      if (event.type === 'SCORING_SUCCESS') return 'completed';
      if (event.type === 'SCORING_ERROR') return 'error';
      break;
    case 'completed':
      if (event.type === 'RESET') return 'idle';
      break;
    case 'error':
      if (event.type === 'RESET') return 'idle';
      break;
  }

  return state;
}
```

## UI/UX Design Patterns

### Loading States

**Transcription**:
```tsx
<div className="flex items-center gap-2">
  <Spinner className="size-4" />
  <p>Transcribing your response...</p>
</div>
```

**Scoring**:
```tsx
<div className="flex items-center gap-2">
  <Spinner className="size-4" />
  <p>Evaluating your answer...</p>
</div>
```

### Empty States

**No History**:
```tsx
<div className="text-center py-8">
  <p className="text-muted-foreground">
    No attempts yet. Record your first response to get started!
  </p>
</div>
```

### Warning Messages

**Temporary Data**:
```tsx
<Alert variant="warning">
  <AlertDescription>
    Your attempt history is temporary and will be cleared when you close
    or reload this page.
  </AlertDescription>
</Alert>
```

### Score Badge Color Coding

```tsx
function getScoreBadgeVariant(score: number) {
  if (score >= 8) return 'success';  // green
  if (score >= 5) return 'warning';  // yellow
  return 'destructive';              // red
}
```
