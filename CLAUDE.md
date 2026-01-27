# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for English language learning that provides:
- **Reading Practice**: AI-generated passages with comprehension questions and vocabulary lookup
- **Speaking Practice**: Audio recording, transcription, and AI-powered scoring
- **Learning History**: Progress tracking dashboard for reading and speaking activities
- **Realtime Voice Chat**: WebRTC-based bidirectional voice communication with OpenAI (development only)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting and formatting (Biome)
npm run lint
npm run format

# Unit tests (Vitest)
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage

# E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Styling**: Tailwind CSS 4
- **Linting/Formatting**: Biome 2.2.0
- **UI Components**: Radix UI primitives with custom components
- **Database**: Supabase (usage tracking)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Real-time Communication**: WebRTC + OpenAI Realtime API

## Architecture Overview

### Directory Structure

```
/app                          - Next.js app directory (routes and pages)
  /api/                       - API route handlers
    /csrf/                    - CSRF token generation
    /reading/                 - Reading practice APIs
    /speaking/                - Speaking practice APIs
    /usage/                   - Usage limit checking
    /realtime/                - WebRTC session tokens
    /text/                    - Text generation
    /transcribe/              - Audio transcription

/components                   - React components
  /reading/                   - Reading feature components
  /speaking/                  - Speaking feature components
  /history/                   - History feature components
  /ui/                        - Generic UI components (Radix-based)
  /providers/                 - Context providers (CSRF)

/lib                          - Utilities and types
  /types/                     - TypeScript definitions
  /hooks/                     - Custom React hooks
  /utils/                     - Utility functions
  /constants/                 - Constants and config
  /rate-limit/                - Rate limiting middleware
  /csrf/                      - CSRF protection

/specs                        - Specification documents
/e2e                          - Playwright E2E tests
/__tests__                    - Unit tests
```

### Pages and Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with navigation to Reading, Speaking, and History |
| `/reading` | Reading practice with AI-generated passages and questions |
| `/speaking` | Speaking practice with audio recording and AI scoring |
| `/history` | Learning history dashboard (reading and speaking tabs) |
| `/realtime-chat` | WebRTC voice chat (development only) |

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/csrf` | GET | Generate CSRF token |
| `/api/reading/generate` | POST | Generate reading passages with questions |
| `/api/reading/vocabulary` | POST | Lookup word definitions |
| `/api/reading/evaluate-summary` | POST | Evaluate user-written summaries |
| `/api/speaking/score` | POST | Score speaking responses |
| `/api/transcribe` | POST | Transcribe audio using Whisper |
| `/api/text` | POST | Text generation using GPT models |
| `/api/usage/limit` | GET | Check daily usage limits |
| `/api/realtime/session` | POST | Get ephemeral WebRTC tokens |

### Key Components

**Reading Feature** (`components/reading/`)
- `PassageDisplay.tsx` - Renders passage with clickable words for vocabulary
- `ComprehensionQuestions.tsx` - Multiple-choice, true/false, fill-in-blank questions
- `VocabularyPopup.tsx` - Word definitions popup (English/Japanese)
- `ReadingSettings.tsx` - Level, topic, grammar selection form
- `ReadingTimer.tsx` - Reading time and WPM calculation
- `SummaryWriting.tsx` - Summary writing with AI evaluation
- `QuestionResults.tsx` - Comprehension score display

**Speaking Feature** (`components/speaking/`)
- `SpeakingPracticeContainer.tsx` - Main container with state management
- `AudioRecorder.tsx` - MediaRecorder-based audio capture
- `TranscriptDisplay.tsx` - Transcription display
- `ScoringResults.tsx` - Score display with feedback

**History Feature** (`components/history/`)
- `Histories.tsx` - Tabbed interface for reading/speaking history
- `AtemptHistory.tsx` - List view with expandable details
- `Attempt.tsx` - Individual attempt card

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useLocalStorage` | Generic localStorage persistence with TypeScript support |
| `useRecording` | Audio recording with noise suppression, echo cancellation |
| `useSpeakingScoring` | State machine for speaking practice flow |
| `useRealtimeSession` | WebRTC connection management |
| `useQuestionNavigation` | Question navigation (prev/next) |
| `useQuestionSelection` | Question selection state |

### Type Definitions

**Reading Types** (`lib/types/reading.ts`)
- `ReadingLevel` - CEFR levels (A1-C1)
- `ReadingTopic` - Topics (daily-life, business, travel, news, science, culture)
- `Passage` - Generated passage with questions and metadata
- `ComprehensionQuestion` - Union type for all question types
- `VocabularyEntry` - Word definition structure

**Speaking Types** (`lib/types/speaking.ts`)
- `ScoringResult` - Score (0-10), improvement areas, good points
- `SpeakingState` - State machine states
- `SpeakingEvent` - State transition events

**Local Storage Types** (`lib/types/local-storage.ts`)
- `ReadingSession` - Stored reading practice data
- `SpeakingAttempt` - Stored speaking attempt data

## Security Features

### CSRF Protection
- Token generation via `/api/csrf` endpoint
- Cookie-based token storage
- `CsrfProvider` context for client-side access

### Rate Limiting
- Configurable per-endpoint limits (`lib/rate-limit/config.ts`)
- In-memory store with sliding window
- 60 requests/minute default for speaking score API

### Usage Limits
- Daily Whisper API limit: 60 seconds
- JST timezone-based daily reset
- Supabase-backed usage tracking

## OpenAI API Integration

### Whisper API (Transcription)
- Model: `whisper-1`
- Pricing: $0.006 per minute
- Daily limit: 60 seconds

### Text Generation
- Models: GPT-5, GPT-5-mini, GPT-5-nano
- Used for: passage generation, scoring, vocabulary lookup, summary evaluation

### Realtime API (Voice Chat)
- Model: `gpt-4o-realtime-preview`
- Connection: WebRTC with ephemeral tokens
- Events via `oai-events` data channel

## Code Style and Conventions

Biome configuration:
- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes for JS/TS, double quotes for JSX
- **Semicolons**: Always required
- **Trailing commas**: ES5 style

## Environment Variables

```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
```

## Path Aliases

```typescript
import { Component } from '@/components/Component';
import { useHook } from '@/lib/hooks/useHook';
```

## Requirements-Driven Development

When a `requirements.md` file exists in `specs/[feature_name]/`:

1. **Read requirements first** before implementation
2. **Follow the specification strictly**
3. **Implement only what is in scope**
4. **Create design & task document** before implementation
5. **Check off completed tasks** in `tasks.md` using `[x]` syntax
6. **Verify against acceptance criteria**

### Workflow
```
requirements.md exists
  ↓
Read and parse
  ↓
Create design & task specs
  ↓
Implement according to spec
  ↓
Check off tasks as completed
  ↓
Verify against acceptance criteria
  ↓
Run tests and checks
```

## Testing

### Unit Tests (Vitest)
- Location: `__tests__/` and co-located `*.test.tsx` files
- Coverage target: 80%+
- Run: `npm run test:unit`

### E2E Tests (Playwright)
- Location: `/e2e/`
- Run: `npm run test:e2e`
- Debug: `npm run test:e2e:ui`

## Browser Considerations

- WebRTC and MediaDevices API support required
- Microphone permissions must be granted
- Audio autoplay policies may block playback
- HTTPS required for production (microphone access)
