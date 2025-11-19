# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application that implements real-time voice chat using OpenAI's Realtime API with WebRTC. The application enables bidirectional voice communication between users and OpenAI's GPT models.

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

**RealtimeApiPage** (`app/realtime-api/page.tsx`)
- Detailed implementation with comprehensive event logging
- Connection state machine with states: idle → fetching-token → creating-peer → requesting-mic → creating-offer → connecting → connected
- Audio playback handling with browser autoplay policy detection

### API Routes

**`/api/realtime/session`** (`app/api/realtime/session/route.ts`)
- POST endpoint to obtain ephemeral tokens from OpenAI
- Requires `OPENAI_API_KEY` environment variable
- Returns `clientSecret` and `expiresAt` for client WebRTC authentication

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

## OpenAI Realtime API Integration

- Model: `gpt-4o-realtime-preview`
- Voice options: alloy, echo, shimmer, etc.
- Audio format: PCM16 (typically)
- Connection: WebRTC with ephemeral token authentication
- Events transmitted via `oai-events` data channel

## Current Development Status

Based on recent commits:
- Core session start/stop functionality implemented
- UI components for active/stopped states created
- Header and menubar styling completed
