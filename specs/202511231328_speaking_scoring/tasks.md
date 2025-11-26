# Implementation Tasks: Speaking Practice Scoring System

## Phase 1: Foundation & Setup (P0)

### Type Definitions & Interfaces
- [ ] Create `lib/types/speaking.ts` with all TypeScript interfaces
  - [ ] `SpeakingAttempt` interface
  - [ ] `ScoringResult` interface
  - [ ] `SessionStats` interface
  - [ ] `SpeakingState` type union
  - [ ] `SpeakingEvent` type union
  - [ ] `UserError` interface

### Utility Functions
- [ ] Create `lib/utils/audio.ts` for audio utilities
  - [ ] `createAudioBlob()` function
  - [ ] `formatDuration()` function
  - [ ] `getAudioLevel()` function (if needed)

- [ ] Create `lib/utils/scoring.ts` for scoring utilities
  - [ ] `buildScoringPrompt()` function
  - [ ] `getScoreColor()` function
  - [ ] `calculateSessionStats()` function

- [ ] Create `lib/utils/validation.ts` for validation
  - [ ] `validateAudioBlob()` function
  - [ ] `validateScoringRequest()` function
  - [ ] `validateSpeakingAttempt()` function (local storage)
  - [ ] `sanitizeLocalStorageData()` function

### Custom Hooks
- [ ] Create `lib/hooks/use-recording.ts`
  - [ ] Implement MediaRecorder API integration
  - [ ] Add microphone permission handling
  - [ ] Add audio level monitoring
  - [ ] Add recording duration timer
  - [ ] Implement error handling
  - [ ] Export `useRecording` hook

- [ ] Create `lib/hooks/use-local-storage.ts`
  - [ ] Implement generic local storage hook
  - [ ] Add JSON parse error handling
  - [ ] Add clear functionality
  - [ ] Export `useLocalStorage` hook

- [ ] Create `lib/hooks/use-attempt-history.ts`
  - [ ] Load attempts from local storage
  - [ ] Implement `addAttempt()` function
  - [ ] Implement `clearHistory()` function
  - [ ] Implement `getQuestionAttempts()` function
  - [ ] Add UUID generation for attempt IDs
  - [ ] Export `useAttemptHistory` hook

- [ ] Create `lib/hooks/use-speaking-scoring.ts`
  - [ ] Implement state machine reducer
  - [ ] Add transcription API call
  - [ ] Add scoring API call
  - [ ] Implement retry logic
  - [ ] Add error handling
  - [ ] Export `useSpeakingScoring` hook

## Phase 2: API Endpoints (P0)

### POST /api/speaking/score
- [ ] Create `app/api/speaking/score/route.ts`
- [ ] Implement request validation
  - [ ] Validate required fields (questionText, modelAnswer, userTranscript)
  - [ ] Validate field types
  - [ ] Validate transcript length limit (< 5000 chars)
- [ ] Implement scoring prompt builder
  - [ ] Use `buildScoringPrompt()` utility
  - [ ] Include question text
  - [ ] Include model answer
  - [ ] Include user transcript
- [ ] Implement OpenAI Chat Completion API call
  - [ ] Use GPT-4o model
  - [ ] Set temperature to 0.3
  - [ ] Set response_format to json_object
  - [ ] Set max_tokens to 500
- [ ] Parse and validate API response
  - [ ] Extract score
  - [ ] Extract areasForImprovement
  - [ ] Extract goodPoints
- [ ] Calculate processing time
- [ ] Return formatted response
- [ ] Add error handling
  - [ ] 400 for validation errors
  - [ ] 500 for API errors
- [ ] Add server-side logging

### Verify /api/transcribe endpoint
- [ ] Ensure existing endpoint works correctly
- [ ] Verify audio file validation
- [ ] Verify Whisper API integration
- [ ] Test with different audio formats

## Phase 3: UI Components (P0)

### AudioRecorder Component
- [ ] Create `components/speaking/AudioRecorder.tsx`
- [ ] Add "Start Recording" button (idle state)
- [ ] Add "Stop Recording" button (recording state)
- [ ] Integrate `useRecording` hook
- [ ] Add audio level visualization
  - [ ] Visual waveform or level meter
  - [ ] Real-time updates during recording
- [ ] Add recording duration timer
  - [ ] Format as MM:SS
  - [ ] Update every second
- [ ] Add microphone permission error UI
- [ ] Add recording state indicators
- [ ] Style with Tailwind CSS
- [ ] Make responsive for mobile

### TranscriptDisplay Component
- [ ] Create `components/speaking/TranscriptDisplay.tsx`
- [ ] Add transcript text display area
  - [ ] Clear, readable formatting
  - [ ] Scrollable if long
- [ ] Add "Score" button
  - [ ] Primary button style
  - [ ] Disabled when not ready
  - [ ] Loading state when scoring
- [ ] Add optional "Re-record" button
- [ ] Add loading indicator during transcription
- [ ] Style with Tailwind CSS
- [ ] Make responsive for mobile

### ScoringResults Component
- [ ] Create `components/speaking/ScoringResults.tsx`
- [ ] Add score badge
  - [ ] Large, prominent display
  - [ ] Color coding: green (8-10), yellow (5-7), red (0-4)
  - [ ] Show "X/10" format
- [ ] Add transcript section
  - [ ] Expandable/collapsible if needed
  - [ ] Clear formatting
- [ ] Add areas for improvement list
  - [ ] Bulleted list
  - [ ] Warning/info icons
  - [ ] Each item on separate line
- [ ] Add good points list
  - [ ] Bulleted list
  - [ ] Checkmark icons
  - [ ] Each item on separate line
- [ ] Add "View History" button
- [ ] Add loading state
- [ ] Style with Tailwind CSS
- [ ] Make responsive for mobile

### AttemptHistory Component
- [ ] Create `components/speaking/AttemptHistory.tsx`
- [ ] Integrate `useAttemptHistory` hook
- [ ] Display attempts list
  - [ ] Timeline/card layout
  - [ ] Show date/time
  - [ ] Show score
  - [ ] Show brief feedback summary
- [ ] Add expandable details
  - [ ] Full transcript
  - [ ] All feedback
- [ ] Add sort functionality
  - [ ] By date (newest first)
  - [ ] By score (highest first)
- [ ] Add warning message about temporary data
  - [ ] Alert component
  - [ ] Clear explanation
- [ ] Add empty state
  - [ ] Helpful message
  - [ ] Icon or illustration
- [ ] Add session statistics (if available)
  - [ ] Total attempts
  - [ ] Average score
- [ ] Style with Tailwind CSS
- [ ] Make responsive for mobile

### SpeakingPractice Container
- [ ] Create `components/speaking/SpeakingPractice.tsx`
- [ ] Integrate `useSpeakingScoring` hook
- [ ] Manage overall state machine
  - [ ] idle → recording → transcribing → transcribed → scoring → completed
- [ ] Coordinate child components
  - [ ] Pass props to AudioRecorder
  - [ ] Pass props to TranscriptDisplay
  - [ ] Pass props to ScoringResults
  - [ ] Pass props to AttemptHistory
- [ ] Handle transcription flow
  - [ ] Receive audio blob from AudioRecorder
  - [ ] Call transcription API
  - [ ] Display transcript
  - [ ] Enable Score button
- [ ] Handle scoring flow
  - [ ] Wait for user to click Score button
  - [ ] Call scoring API
  - [ ] Display results
  - [ ] Save to local storage
- [ ] Add error handling UI
  - [ ] Toast notifications
  - [ ] Error messages
- [ ] Add loading states
  - [ ] Separate for transcription and scoring
- [ ] Style with Tailwind CSS

### Page Integration
- [ ] Update existing speaking practice page
- [ ] Import SpeakingPractice component
- [ ] Pass current question as prop
- [ ] Ensure proper layout
- [ ] Test with Questions navigation component

## Phase 4: Error Handling & Validation (P0)

### Client-Side Error Handling
- [ ] Add error boundaries
- [ ] Implement user-friendly error messages
  - [ ] Permission denied
  - [ ] Network errors
  - [ ] Transcription errors
  - [ ] Scoring errors
- [ ] Add retry mechanisms
  - [ ] Retry buttons in UI
  - [ ] Automatic retry with backoff
- [ ] Add error logging
  - [ ] Console logs in development
  - [ ] Structured error objects

### Input Validation
- [ ] Validate audio blob before upload
  - [ ] File size (< 25MB)
  - [ ] MIME type (audio/webm, audio/mp3, etc.)
- [ ] Validate scoring request
  - [ ] Required fields present
  - [ ] Correct data types
  - [ ] Length limits
- [ ] Validate local storage data
  - [ ] JSON parse error handling
  - [ ] Type checking
  - [ ] Sanitization

### Loading & Empty States
- [ ] Add loading spinners
  - [ ] Transcribing state
  - [ ] Scoring state
- [ ] Add skeleton loaders (optional)
- [ ] Add empty state for history
- [ ] Add warning about temporary data

## Phase 5: Testing & Validation (P0)

### Manual Testing
- [ ] Test recording flow
  - [ ] Start recording
  - [ ] Stop recording
  - [ ] Audio level visualization
  - [ ] Timer accuracy
- [ ] Test transcription
  - [ ] Various audio lengths
  - [ ] Clear speech
  - [ ] Accented speech
  - [ ] Background noise
- [ ] Test Score button behavior
  - [ ] Appears only after transcription
  - [ ] Triggers scoring correctly
  - [ ] Loading state works
- [ ] Test scoring display
  - [ ] Score badge color coding
  - [ ] Feedback lists
  - [ ] Transcript display
- [ ] Test local storage
  - [ ] Saves attempts correctly
  - [ ] Retrieves attempts correctly
  - [ ] Clears on page reload
- [ ] Test history view
  - [ ] Shows all attempts
  - [ ] Sorting works
  - [ ] Expandable details
  - [ ] Empty state
- [ ] Test error handling
  - [ ] No microphone permission
  - [ ] Network failures
  - [ ] API errors
  - [ ] Invalid inputs

### Browser Compatibility Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile Safari (iOS)
- [ ] Test on mobile Chrome (Android)

### Performance Testing
- [ ] Measure transcription time
  - [ ] Should be < 10s for 30s audio
- [ ] Measure scoring time
  - [ ] Should be < 5s
- [ ] Test with multiple attempts
  - [ ] Local storage performance
  - [ ] Memory usage
- [ ] Test audio recording quality
  - [ ] File size
  - [ ] Audio quality

## Phase 6: Polish & UX Improvements (P1)

### Audio Playback Feature
- [ ] Add audio playback component
- [ ] Allow user to listen to recording before transcription
- [ ] Add play/pause controls
- [ ] Add audio visualization during playback

### Enhanced Loading States
- [ ] Add progress indicators
  - [ ] Transcription progress
  - [ ] Scoring progress
- [ ] Add estimated time remaining
- [ ] Add success animations
  - [ ] Confetti for high scores (optional)
  - [ ] Smooth transitions

### Re-record Feature
- [ ] Add "Re-record" button after transcription
- [ ] Clear current state
- [ ] Return to idle state
- [ ] Don't save incomplete attempts

### Session Analytics
- [ ] Calculate average score across all questions
- [ ] Calculate improvement percentage
- [ ] Display session statistics
  - [ ] Total attempts
  - [ ] Average score
  - [ ] Best score
  - [ ] Latest score
- [ ] Add statistics card/component

## Phase 7: Code Quality & Documentation

### Code Review
- [ ] Review all components for consistency
- [ ] Check TypeScript types are correct
- [ ] Ensure proper error handling
- [ ] Verify accessibility (a11y)
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] ARIA labels

### Documentation
- [ ] Add JSDoc comments to utilities
- [ ] Add component prop documentation
- [ ] Add inline code comments for complex logic
- [ ] Update README if needed

### Code Cleanup
- [ ] Remove console.logs (except error logs)
- [ ] Remove unused imports
- [ ] Remove commented code
- [ ] Run linter and fix warnings
- [ ] Run formatter

## Phase 8: Enhancement Features (P2)

### Voice Comparison
- [ ] Research native speaker audio samples
- [ ] Add playback of model pronunciation
- [ ] Add side-by-side comparison

### Exercise Suggestions
- [ ] Analyze areas for improvement
- [ ] Generate exercise recommendations
- [ ] Display suggestions in UI

### PDF Export
- [ ] Add PDF generation library
- [ ] Create PDF template for history
- [ ] Add export button
- [ ] Generate and download PDF

### Personal Notes
- [ ] Add notes field to SpeakingAttempt
- [ ] Add textarea in results
- [ ] Save notes to local storage
- [ ] Display notes in history

## Phase 9: Final Validation

### Acceptance Criteria Checklist
- [ ] User can successfully record audio response using microphone
- [ ] Recording displays visual feedback (waveform, timer, status)
- [ ] Audio is transcribed accurately using Whisper API
- [ ] Transcribed text is displayed to the user after transcription completes
- [ ] "Score" button appears/enables only after successful transcription
- [ ] User can review the transcript before clicking "Score" button
- [ ] Scoring is triggered ONLY when user clicks the "Score" button
- [ ] Transcription is sent to OpenAI scoring API with custom prompt when "Score" is clicked
- [ ] API returns structured response with score (0-10), improvements, and good points
- [ ] Results are displayed inline below the question card
- [ ] Score is visually prominent with appropriate color coding
- [ ] Areas for improvement and good points are clearly listed
- [ ] User's transcript is shown for reference in results
- [ ] Scoring attempt is saved to local storage with all required fields
- [ ] User can view history of all previous attempts for the question during current session
- [ ] History shows timestamps, scores, and feedback summaries
- [ ] History displays warning about temporary nature of data
- [ ] Page reload/browser close clears all history and shows initial state
- [ ] System shows separate loading states for transcription and scoring
- [ ] System handles errors gracefully (API failures, network issues, permission denied)
- [ ] Processing completes within performance requirements (< 15s total)
- [ ] Feature works on both desktop and mobile devices
- [ ] Feature is accessible without authentication

### Performance Validation
- [ ] Transcription completes in < 10s for 30s audio
- [ ] Scoring completes in < 5s
- [ ] Total time < 15s
- [ ] UI remains responsive during processing

### Security Validation
- [ ] API keys not exposed to client
- [ ] Audio transmitted over HTTPS
- [ ] Input validation on all endpoints
- [ ] Local storage data sanitized

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] All acceptance criteria met
- [ ] No console errors in production build
- [ ] Linter passes
- [ ] Build succeeds

### Environment Setup
- [ ] Verify OPENAI_API_KEY is set
- [ ] Test API endpoints in production
- [ ] Verify HTTPS is enabled

### Post-Deployment
- [ ] Test in production environment
- [ ] Monitor error logs
- [ ] Verify OpenAI API usage and costs
- [ ] Collect user feedback

## Notes

### Dependencies Required
```json
{
  "uuid": "^9.0.0"  // For generating attempt IDs
}
```

### Existing Code to Reference
- `lib/hooks/transcript/use-recording.ts` - May have recording logic to adapt
- `app/api/transcribe/route.ts` - Existing transcription endpoint
- `components/Questions.tsx` - Existing question display
- `lib/types/db.ts` - Existing Question type

### Performance Targets
- Audio transcription: < 10s for 30s recording
- Text scoring: < 5s
- Total processing: < 15s
- UI should remain responsive throughout

### Browser Support Priority
1. Chrome (desktop & mobile)
2. Safari (desktop & mobile)
3. Firefox
4. Edge
