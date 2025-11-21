# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application that implements real-time voice chat using OpenAI's Realtime API with WebRTC, as well as audio transcription using OpenAI's Whisper API. The application enables:
- Bidirectional voice communication between users and OpenAI's GPT models via WebRTC
- Audio file transcription using the Whisper speech-to-text API
- Text generation using OpenAI's GPT-5 models with cost calculation

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code with Biome
npm run lint

# Format code with Biome
npm run format
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Styling**: Tailwind CSS 4
- **Linting/Formatting**: Biome 2.2.0
- **UI Components**: Radix UI primitives with custom components
- **Real-time Communication**: WebRTC + OpenAI Realtime API

## Architecture Overview

### WebRTC Session Flow

The application establishes WebRTC connections to OpenAI's Realtime API following this sequence:

1. **Token Acquisition**: Backend route `/api/realtime/session` fetches ephemeral tokens from OpenAI
2. **Peer Connection Setup**: Client creates `RTCPeerConnection` and adds local audio track from microphone
3. **Data Channel**: Creates `oai-events` data channel for bidirectional event messaging
4. **SDP Negotiation**: Client generates SDP offer, sends to OpenAI, receives answer
5. **Audio Streaming**: Bidirectional audio streams via WebRTC tracks

### Key Components

**SessionControl** (`components/SessionControl.tsx`)
- Main orchestrator for WebRTC session lifecycle
- Manages peer connection, data channel, and audio element refs
- Handles session start/stop operations

**SessionActive** / **SessionStopped** (`components/SessionActive.tsx`, `components/SessionStopped.tsx`)
- UI states for active and inactive sessions
- Control interfaces for starting/stopping conversations

**RealtimeApiPage** (`app/realtime-api/beta/page.tsx`, `app/realtime-api/ga/page.tsx`)
- Beta version: Detailed implementation with comprehensive event logging
- GA version: Production-ready implementation using SessionControl component
- Connection state machine with states: idle → fetching-token → creating-peer → requesting-mic → creating-offer → connecting → connected
- Audio playback handling with browser autoplay policy detection

**TranscribePage** (`app/transcribe/page.tsx`)
- UI for audio file transcription using Whisper API
- Audio recording and upload interface (in development)

### API Routes

**`/api/realtime/session`** (`app/api/realtime/session/route.ts`)
- POST endpoint to obtain ephemeral tokens from OpenAI Realtime API
- Requires `OPENAI_API_KEY` environment variable
- Returns `clientSecret` and `expiresAt` for client WebRTC authentication

**`/api/transcribe`** (`app/api/transcribe/route.ts`)
- POST endpoint for audio file transcription using Whisper API
- Accepts multipart/form-data with audio file
- Returns transcription result with JSON format
- Uses `whisper-1` model with temperature 0.1

**`/api/text`** (`app/api/text/route.ts`)
- POST endpoint for text generation using GPT-5 models
- Demonstrates cost calculation for input/output tokens
- Supports GPT-5, GPT-5-mini, and GPT-5-nano models
- Includes pricing information and usage tracking

### Type System

**`lib/types/voice-chat.ts`**
- Comprehensive TypeScript definitions for WebRTC messages
- OpenAI Realtime API message types (audio, transcription, session updates)
- Connection state and status types

### Custom Hooks

**`lib/hooks/transcript/use-recording.ts`**
- Hook for managing audio recording state
- Handles MediaRecorder lifecycle and permissions
- Audio level monitoring and visualization support

### Utility Modules

**`lib/openai.ts`**
- OpenAI client initialization and configuration
- Whisper API model configuration (`whisper-1`)
- Cost calculation utilities for Whisper transcription ($0.006 per minute)
- Mock audio file helpers for testing

## Code Style and Conventions

The project uses Biome for linting and formatting with these key rules:

- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes for JS/TS, double quotes for JSX
- **Semicolons**: Always required
- **Trailing commas**: ES5 style
- **Unused variables**: Warning level
- **No explicit any**: Warning level

## Environment Variables

Required environment variables (add to `.env` file):

```
OPENAI_API_KEY=sk-...
```

## Path Aliases

The project uses `@/*` path alias mapping to the root directory:

```typescript
import { SessionControl } from '@/components/SessionControl';
```

## Browser Considerations

- WebRTC and MediaDevices API support required
- Microphone permissions must be granted
- Audio autoplay policies may block playback - implementation includes retry mechanisms
- HTTPS required for production (microphone access restriction)

## OpenAI API Integration

### Realtime API (WebRTC Voice Chat)
- Model: `gpt-4o-realtime-preview`
- Voice options: alloy, echo, shimmer, etc.
- Audio format: PCM16 (typically)
- Connection: WebRTC with ephemeral token authentication
- Events transmitted via `oai-events` data channel

### Whisper API (Audio Transcription)
- Model: `whisper-1`
- Pricing: $0.006 per minute
- Response format: JSON
- Temperature: 0.1 for more deterministic results
- Supports various audio formats (MP3, WAV, etc.)

### Text Generation API
- Models: GPT-5, GPT-5-mini, GPT-5-nano
- Pricing: Variable based on model and token usage
- Input/output token tracking and cost calculation
- Cached token support with 90% discount

## Pages and Routes
- `/` - Home page
- `/realtime-api/beta` - Realtime API implementation with detailed event logging
- `/realtime-api/ga` - Production-ready Realtime API implementation
- `/transcribe` - Audio transcription interface (in development)

## Requirements-Driven Development

When a `requirements.md` file exists in the `specs/[feature_name]/`:

1. **Read requirements first** before any implementation
2. **Follow the specification strictly**
3. **Implement only what is in scope**
4. **Do not add features marked as "Out of Scope"**
5. **Verify against acceptance criteria**
6. **Create design & task document** before implementation

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
Verify against acceptance criteria
  ↓
Run tests and checks
```