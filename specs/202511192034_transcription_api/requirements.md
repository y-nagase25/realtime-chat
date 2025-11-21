# Voice Recording and Transcription Feature

## Overview
Implement core functionality to record user's voice, transcribe it using OpenAI Whisper API, and display the transcribed text on screen. This is a minimal viable implementation focusing only on essential features.

## Scope
**In Scope:**
- Voice recording functionality
- Audio transcription via Whisper API
- Display of transcribed text

**Out of Scope:**
- Real-time recording status display
- Rich UI features (waveforms, visualizations, etc.)
- Recording status indicators
- Progress bars or animations

## Technical Requirements

### Backend API
**File:** `app/api/transcribe/route.ts`

**Responsibilities:**
- Receive audio file from client
- Send audio to OpenAI Whisper API
- Return transcribed text
- Handle API errors

### Frontend Hook
**File:** `lib/hooks/transcript/use-recording.ts`

**Responsibilities:**
- Manage recording state
- Handle browser MediaRecorder API
- Start/stop recording
- Send recorded audio to backend
- Store transcription result

## Acceptance Criteria

### Must Have
- [ ] User can start recording by clicking a button
- [ ] User can stop recording by clicking a button
- [ ] Recorded audio is sent to Whisper API
- [ ] Transcribed text is displayed on screen
- [ ] Error messages are shown if API fails
- [ ] Microphone permission is properly requested

### Must Not Have
- [ ] No real-time status display
- [ ] No recording timer/duration display
- [ ] No audio waveform visualization
- [ ] No recording progress indicator

## Data Flow
```
User clicks "Start Recording"
  ↓
Request microphone permission
  ↓
Start MediaRecorder
  ↓
User clicks "Stop Recording"
  ↓
Stop MediaRecorder & get audio blob
  ↓
Send audio to /api/transcribe
  ↓
API forwards to Whisper API
  ↓
Receive transcription
  ↓
Display transcribed text
```

## Testing Plan

### Manual Testing
1. **Happy Path**
   - Start recording
   - Speak clearly
   - Stop recording
   - Verify transcription appears

2. **Error Cases**
   - Deny microphone permission → Show error
   - Stop recording immediately → Handle empty audio
   - Invalid API key → Show API error
   - Network failure → Show network error

3. **Edge Cases**
   - Very short recording (< 1 second)
   - Long recording (> 1 minute)
   - Silent recording (no speech)
   - Multiple recordings in sequence

## Success Metrics

- User can successfully record and transcribe audio
- Transcription accuracy is acceptable (depends on Whisper API)
- No console errors during normal operation
- Proper error messages for all failure cases

## Future Enhancements (Not in this implementation)

- Real-time transcription display
- Recording status indicators
- Audio playback before transcription
- Multiple language support
- Custom Whisper model selection
- Recording duration limit
- Audio waveform visualization
- Recording history