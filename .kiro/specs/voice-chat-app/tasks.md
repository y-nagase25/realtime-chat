# Implementation Plan

## Overview

This implementation plan breaks down the voice chat application into discrete, actionable coding tasks. Each task builds incrementally on previous work, starting with core infrastructure and progressing to full functionality.

## Tasks

- [x] 1. Set up project structure and type definitions
  - Create new page route at `app/voice-chat/page.tsx`
  - Create types file at `lib/types/voice-chat.ts` with Message, ApiConfig, ConnectionState, and WebSocket message interfaces
  - Create hooks directory at `lib/hooks/voice-chat/` for custom hooks
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1_

- [ ] 2. Implement local storage management hook
  - Create `lib/hooks/voice-chat/use-conversation-storage.ts`
  - Implement loadMessages function to retrieve conversation history from local storage
  - Implement addMessage function to save new messages with timestamp and UUID
  - Implement clearMessages function to remove all messages from storage
  - Handle storage errors gracefully with fallback to in-memory storage
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.3, 5.4, 6.4_

- [ ] 3. Implement API key management
  - Create `components/voice-chat/api-key-dialog.tsx` component using existing dialog UI component
  - Implement API key input field with validation for OpenAI key format (starts with "sk-")
  - Implement save functionality to store API key in local storage under key "openai_api_key"
  - Implement cancel functionality to close dialog without saving
  - Add helper functions to retrieve and validate stored API key
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 4. Implement audio recording hook
  - Create `lib/hooks/voice-chat/use-audio-recorder.ts`
  - Implement microphone permission request using navigator.mediaDevices.getUserMedia
  - Initialize AudioContext with 24kHz sample rate for OpenAI compatibility
  - Implement startRecording function to begin audio capture
  - Implement stopRecording function to end capture and cleanup
  - Convert audio to PCM16 format and pass chunks to callback function
  - Handle permission denial and other recording errors
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3, 4.4, 4.5, 6.3_

- [ ] 5. Implement audio playback hook
  - Create `lib/hooks/voice-chat/use-audio-player.ts`
  - Initialize Web Audio API context for playback
  - Implement playAudio function to play received audio buffers
  - Implement queueAudio function to buffer audio chunks for smooth playback
  - Implement stopAudio function for interruption support
  - Handle playback completion callback
  - Decode base64 PCM16 audio from API responses
  - _Requirements: 1.4, 8.2, 8.4_

- [ ] 6. Implement WebSocket connection hook for OpenAI Realtime API
  - Create `lib/hooks/voice-chat/use-realtime-api.ts`
  - Implement connect function to establish WebSocket connection to `wss://api.openai.com/v1/realtime`
  - Add authentication header with API key as Bearer token
  - Send session.update message after connection with model configuration
  - Implement disconnect function to close WebSocket cleanly
  - Handle connection state changes (connecting, connected, disconnected, error)
  - Implement reconnection logic with exponential backoff
  - _Requirements: 1.2, 6.1, 6.2, 7.5_

- [ ] 7. Implement WebSocket message handling
  - In `use-realtime-api.ts`, implement sendAudio function to send audio chunks as input_audio_buffer.append messages
  - Encode audio data to base64 before sending
  - Implement message parser for incoming WebSocket messages
  - Handle conversation.item.created messages to extract user transcripts
  - Handle response.audio_transcript.delta messages to extract assistant transcripts
  - Handle response.audio.delta messages to extract audio data
  - Call appropriate callbacks (onTranscriptReceived, onAudioReceived) when messages arrive
  - _Requirements: 1.3, 1.4, 2.1, 2.2_

- [ ] 8. Implement interruption support
  - In `use-realtime-api.ts`, implement interrupt function to send response.cancel message
  - In `use-audio-player.ts`, ensure stopAudio immediately halts playback
  - Coordinate interruption between recording start and audio playback
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Create conversation display component
  - Create `components/voice-chat/conversation-display.tsx`
  - Implement message list rendering with user/assistant distinction using existing UI components
  - Style user messages differently from assistant messages (e.g., alignment, colors)
  - Display timestamps for each message
  - Implement auto-scroll to latest message using useEffect and ref
  - Add loading indicator for when waiting for response
  - Add clear conversation button with confirmation dialog
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.4, 5.1, 5.2, 5.5_

- [ ] 10. Create voice controls component
  - Create `components/voice-chat/voice-controls.tsx`
  - Implement recording button that toggles between "Start Recording" and "Stop Recording"
  - Add visual indicator for recording state (e.g., pulsing red dot, microphone icon)
  - Add visual indicator for playback state (e.g., audio wave animation)
  - Display connection status (connected, connecting, disconnected)
  - Disable controls when appropriate (e.g., no API key, no permission)
  - Use existing button and badge UI components
  - _Requirements: 1.5, 4.1, 4.2, 4.4_

- [ ] 11. Create main voice chat container component
  - Create `components/voice-chat/voice-chat-container.tsx`
  - Initialize all custom hooks (useConversationStorage, useRealtimeAPI, useAudioRecorder, useAudioPlayer)
  - Implement state management for recording, playing, and connection status
  - Wire up audio recorder callback to send audio to WebSocket
  - Wire up WebSocket callbacks to add transcripts and play audio
  - Handle API key check on mount and show dialog if missing
  - Coordinate interruption: when starting recording during playback, stop audio and send interrupt
  - Implement error handling and display error messages using toast or inline alerts
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.3, 6.5, 7.4, 8.1, 8.3_

- [ ] 12. Create voice chat page
  - Update `app/voice-chat/page.tsx` to render VoiceChatContainer
  - Add page layout with proper spacing and responsive design
  - Add page title and description
  - Ensure HTTPS requirement is documented in comments
  - _Requirements: All requirements integrated_

- [ ] 13. Add error handling and user feedback
  - Implement error display for microphone permission denial with helpful message
  - Implement error display for WebSocket connection failures with retry button
  - Implement error display for API authentication errors with re-enter key option
  - Implement warning for local storage unavailability
  - Add toast notifications for transient errors using existing UI components
  - Log all errors to console for debugging
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 14. Implement Page Visibility API for connection management
  - In `use-realtime-api.ts`, add event listener for visibilitychange
  - Disconnect WebSocket when page becomes hidden
  - Reconnect WebSocket when page becomes visible
  - Ensure clean state management during visibility changes
  - _Requirements: 1.2_

- [ ]* 15. Add performance optimizations
  - [ ]* 15.1 Implement conversation history limit (last 100 messages)
    - Modify useConversationStorage to trim old messages
    - _Requirements: 3.5_
  - [ ]* 15.2 Add React virtualization for long conversation lists
    - Install and configure react-window or similar library
    - Update ConversationDisplay to use virtualized list
    - _Requirements: 2.4_

- [ ]* 16. Add accessibility features
  - [ ]* 16.1 Add ARIA labels to all interactive elements
    - Add aria-label to recording button, clear button
    - Add role attributes where appropriate
    - _Requirements: 4.1, 5.1_
  - [ ]* 16.2 Implement keyboard navigation
    - Add keyboard shortcuts for start/stop recording (e.g., Space bar)
    - Ensure all controls are keyboard accessible
    - _Requirements: 4.1, 4.2_
  - [ ]* 16.3 Add screen reader announcements
    - Use aria-live regions for status changes
    - Announce when recording starts/stops, when messages arrive
    - _Requirements: 1.5, 2.5, 4.4_

- [ ]* 17. Write integration tests
  - [ ]* 17.1 Test audio pipeline flow
    - Mock microphone input and verify audio reaches WebSocket
    - Mock WebSocket responses and verify audio playback
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 17.2 Test interruption handling
    - Verify starting recording during playback stops audio
    - Verify interrupt message is sent to API
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 17.3 Test storage persistence
    - Verify messages persist after component remount
    - Verify clear functionality removes all messages
    - _Requirements: 3.1, 3.2, 3.5, 5.3, 5.4_

- [ ]* 18. Create development documentation
  - [ ]* 18.1 Add README with setup instructions
    - Document HTTPS requirement for development
    - Document API key configuration
    - Add troubleshooting section
    - _Requirements: 7.1, 7.4_
  - [ ]* 18.2 Add inline code comments
    - Document complex audio processing logic
    - Document WebSocket message formats
    - _Requirements: All_
