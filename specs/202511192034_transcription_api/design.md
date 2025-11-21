# Voice Recording and Transcription - Design Document

## Architecture

### Components
1. **Backend API** (`app/api/transcribe/route.ts`) - Already exists
   - Receives audio file via FormData
   - Forwards to OpenAI Whisper API
   - Returns transcription result

2. **Recording Hook** (`lib/hooks/transcript/use-recording.ts`)
   - Manages MediaRecorder lifecycle
   - Handles recording state machine
   - Sends audio to backend API

3. **UI Page** (`app/transcribe/page.tsx`)
   - Simple button interface
   - Displays transcription result
   - Shows error messages

## State Machine

```
IDLE → REQUESTING_PERMISSION → RECORDING → PROCESSING → COMPLETED
  ↓                                ↓            ↓
ERROR ←---------------------------←------------←
```

## Hook Interface

```typescript
interface UseRecordingReturn {
  isRecording: boolean;
  isProcessing: boolean;
  transcription: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  reset: () => void;
}
```

## Implementation Strategy

1. Use MediaRecorder API with `audio/webm` format
2. Store audio chunks in array during recording
3. On stop, create Blob and send via FormData to API
4. Handle permission errors gracefully
5. Keep UI minimal per requirements (no status displays)
