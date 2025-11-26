# Feature Requirements: Speaking Practice Scoring System

## Overview
This feature implements an automated scoring system for speaking practice exercises. Users record their spoken response to a given question. The audio is first transcribed to text using OpenAI's Whisper API. Once transcription is complete, a "Score" button is displayed. When the user clicks the "Score" button, the transcribed text is sent to OpenAI's Chat Completion API for evaluation by comparing it with the model answer. The system provides detailed feedback including a numerical score, areas for improvement, and positive aspects of their response. All scoring attempts are saved in browser local storage for session-based historical review. Note: History data persists only while the browser remains open; closing the browser or reloading the page will clear all history and return to the initial state.

## User Stories
- As a language learner, I want to record my spoken answer to practice questions so that I can improve my English speaking skills
- As a language learner, I want to see my transcribed response before requesting scoring so that I can verify the transcription accuracy
- As a language learner, I want to manually trigger scoring by clicking a button so that I have control over when to submit for evaluation
- As a language learner, I want to receive automated scoring and feedback on my spoken responses so that I understand my strengths and weaknesses
- As a language learner, I want to review my past scoring attempts during my current session so that I can track my progress
- As a language learner, I want to see my score and feedback immediately after requesting scoring so that I can learn from my mistakes right away

## Functional Requirements

### Must Have (P0)

**Audio Recording**
- REQ-001: System must allow users to record audio using their device microphone
- REQ-002: System must display recording status (recording/stopped/processing)
- REQ-003: System must show audio level visualization during recording
- REQ-004: Recording must be one-time only (no re-recording allowed before submission)
- REQ-005: System must support stopping the recording manually
- REQ-006: System must transcribe recorded audio to English text using OpenAI Whisper API

**Transcription Display**
- REQ-007: System must display the transcribed text to the user after successful transcription
- REQ-008: System must show a "Score" button after transcription is complete
- REQ-009: "Score" button must be disabled/hidden until transcription is successfully completed
- REQ-010: System must allow users to review the transcript before triggering scoring

**Scoring & Evaluation**
- REQ-011: Scoring must only be triggered when user explicitly clicks the "Score" button
- REQ-012: System must send transcribed text (not audio) along with question text and model answer text to OpenAI Chat Completion API for scoring
- REQ-013: Scoring API must compare user's transcribed response with the model answer text
- REQ-014: System must generate custom evaluation prompts based on the text comparison
- REQ-015: OpenAI API must return structured scoring with: Score (0-10), Areas for improvement, Good points
- REQ-016: Scoring criteria must evaluate grammar accuracy, content relevance compared to model answer, and vocabulary usage
- REQ-017: System must handle API errors gracefully and display user-friendly error messages

**Results Display**
- REQ-018: Scoring results must be displayed inline on the same page below the question card
- REQ-019: Display must show the numerical score prominently (0-10 scale)
- REQ-020: Display must list areas for improvement with specific, actionable feedback
- REQ-021: Display must highlight good points about the response
- REQ-022: Display must show the user's transcribed text for reference

**Data Persistence**
- REQ-023: System must save all scoring attempts to browser local storage
- REQ-024: Each attempt must store: question_id, transcript, score, feedback, timestamp
- REQ-025: Users must be able to access their scoring history for any question during the current browser session
- REQ-026: System must display timestamp for each historical attempt
- REQ-027: System must display initial state (no history) when browser is closed/reloaded
- REQ-028: System must warn users that history data is temporary and not persistent across sessions

### Should Have (P1)

**User Experience**
- REQ-029: System should provide audio playback of the user's recording before submission
- REQ-030: System should display loading state during transcription separately from scoring
- REQ-031: System should show loading indicator when "Score" button is clicked
- REQ-032: System should provide visual feedback for successful scoring completion
- REQ-033: System should allow user to re-record without scoring if transcript is unsatisfactory

**Analytics**
- REQ-034: System should track average score across all questions in current session
- REQ-035: System should calculate improvement percentage compared to previous attempts in current session
- REQ-036: System should display session statistics (total attempts, average score) if available

### Nice to Have (P2)

**Enhanced Features**
- REQ-037: System could provide voice comparison with native speaker pronunciation
- REQ-038: System could suggest specific exercises based on areas for improvement
- REQ-039: System could export session scoring history as PDF report
- REQ-040: System could allow users to add personal notes to each attempt

## Technical Requirements

### System Workflow

**Complete Processing Flow:**
```
1. User clicks "Start Recording"
   ↓
2. Browser captures audio via MediaRecorder API
   ↓
3. User clicks "Stop Recording"
   ↓
4. Audio blob created in browser
   ↓
5. [TRANSCRIPTION] Audio sent to /api/transcribe
   ↓
6. Whisper API transcribes audio → returns text
   ↓
7. Transcript displayed to user
   ↓
8. "Score" button appears/enables
   ↓
9. [USER ACTION] User reviews transcript and clicks "Score" button
   ↓
10. [SCORING] Text sent to /api/speaking/score with:
    - questionText
    - modelAnswer (from database)
    - userTranscript (from step 6)
   ↓
11. Chat Completion API compares texts → returns scoring
   ↓
12. Results displayed inline on page
   ↓
13. Attempt saved to local storage
```

**Key Points:**
- Two separate API calls: transcription first, then scoring
- Transcription happens automatically after recording
- "Score" button appears only after successful transcription
- Scoring is triggered manually by user button click
- User can review transcript before requesting score
- Audio file is NOT sent to scoring API
- Scoring API only receives and compares text data
- Audio blob is discarded after transcription

### Data Models

**SpeakingAttempt (Local Storage)**
```typescript
{
  id: string;                    // Unique ID (generated client-side, e.g., UUID)
  question_id: number;           // Question identifier
  transcript: string;            // Transcribed text from Whisper API
  score: number;                 // Score out of 10
  areas_for_improvement: string[]; // Array of improvement suggestions
  good_points: string[];         // Array of positive aspects
  created_at: string;            // ISO timestamp string
  processing_time_ms: number;    // Time taken for scoring
}
```

**Local Storage Schema**
- Key: `speaking_attempts` (stores array of all attempts)
- Data structure: `SpeakingAttempt[]`
- Storage limit: ~5MB (browser dependent)
- Persistence: Session-only (cleared on browser close/reload)

### API Contracts

**Two-Step Processing Flow:**
1. Client sends audio to `/api/transcribe` → receives transcript text
2. Client sends transcript + question + answer to `/api/speaking/score` → receives scoring

**POST /api/transcribe** (existing endpoint)
Request:
```typescript
FormData {
  file: File;  // Audio blob from recording
}
```

Response:
```typescript
{
  text: string;  // Transcribed text from Whisper API
}
```

**POST /api/speaking/score** (new endpoint)
Request:
```typescript
{
  questionId: number;
  questionText: string;
  modelAnswer: string;         // Expected/model answer text
  userTranscript: string;      // Transcribed text from Whisper (NOT audio)
}
```

Response:
```typescript
{
  success: boolean;
  data: {
    score: number;               // 0-10
    areasForImprovement: string[];
    goodPoints: string[];
    processingTime: number;
  };
  error?: string;
}
```

**Processing Flow:**
1. User records audio
2. Audio sent to `/api/transcribe` (Whisper API)
3. Transcript text received and displayed to user
4. "Score" button appears
5. User clicks "Score" button
6. Transcript + question + model answer sent to `/api/speaking/score` (Chat Completion API)
7. Scoring result received and displayed

Note: No history API endpoint needed - history is managed client-side via local storage

### UI/UX Requirements

**Recording Interface**
- Prominent "Start Recording" button when idle
- "Stop Recording" button during recording
- Audio level meter with visual waveform
- Timer showing recording duration
- Clear visual states: idle/recording/transcribing/transcribed/scoring/completed

**Transcript Display (After Transcription)**
- Display area showing the transcribed text
- Clear, readable text formatting
- Prominent "Score" button (primary action button)
- "Score" button disabled/hidden until transcription completes
- Optional: "Re-record" button to start over without scoring
- Loading indicator during transcription process

**Results Display (After Scoring)**
- Card component below question displaying:
  - Large score badge with color coding (green: 8-10, yellow: 5-7, red: 0-4)
  - Transcript in expandable/collapsible section (if not already visible)
  - Areas for improvement as bulleted list with icons
  - Good points as bulleted list with checkmark icons
  - "View History" button to show past attempts
- Responsive design for mobile and desktop
- Loading indicator while waiting for scoring API response

**History View**
- Timeline/list view of all attempts for current session
- Each entry shows: date, score, brief feedback summary
- Expandable to see full details
- Sort by date (newest first) or score (highest first)
- Warning message: "History is temporary and will be cleared on page reload"
- Empty state when no history exists (initial page load)

### OpenAI Integration

**Step 1: Whisper API (Transcription)**
- Endpoint: `/api/transcribe` (proxies to OpenAI Whisper)
- Model: `whisper-1`
- Format: JSON
- Language: English
- Temperature: 0.1
- Input: Audio file (blob from recording)
- Output: Transcribed text string

**Step 2: Chat Completion API (Text-Based Scoring)**
- Endpoint: `/api/speaking/score` (proxies to OpenAI Chat Completion)
- Model: `gpt-4o` (or latest available)
- Input: Text data only (no audio)
  - Question text
  - Model answer text
  - User's transcribed response text
- Output: Scoring result (score, improvements, good points)

**Scoring Prompt Template:**
```
You are an English speaking tutor evaluating a student's spoken response by comparing their transcribed text with the model answer.

Question: {questionText}
Model Answer: {modelAnswer}
Student's Transcribed Response: {userTranscript}

Your task is to compare the student's response text with the model answer text and evaluate based on:
1. Grammar accuracy - Are there grammatical errors in the student's response?
2. Content relevance - Does the student's answer match the meaning of the model answer?
3. Vocabulary usage - Is the vocabulary appropriate and similar to the model answer?

Provide your evaluation in the following JSON format:
{
  "score": <number 0-10>,
  "areasForImprovement": ["specific improvement 1", "specific improvement 2", ...],
  "goodPoints": ["positive aspect 1", "positive aspect 2", ...]
}
```

**Important Notes:**
- Scoring API receives TEXT only, not audio files
- The AI compares transcribed text with model answer text
- No pronunciation analysis (audio is not sent to scoring API)
- Pronunciation quality is inferred from transcription quality only

## Non-Functional Requirements

### Performance
- REQ-NFR-001: Audio transcription must complete within 10 seconds for 30-second recordings
- REQ-NFR-002: Text-based scoring API response must return within 5 seconds
- REQ-NFR-003: Total processing time (transcription + scoring) must not exceed 15 seconds
- REQ-NFR-004: UI must remain responsive during processing with loading indicators

### Security
- REQ-NFR-005: Audio files must be transmitted securely to API endpoint (HTTPS only)
- REQ-NFR-006: OpenAI API keys must be stored in environment variables, never exposed to client
- REQ-NFR-007: API routes must validate request format and file size limits
- REQ-NFR-008: Local storage data should be validated before use to prevent injection attacks

### Reliability
- REQ-NFR-009: System must handle network failures gracefully with retry mechanism
- REQ-NFR-010: Failed attempts must be logged for debugging
- REQ-NFR-011: User must be able to retry submission if processing fails

### Usability
- REQ-NFR-012: Error messages must be clear and actionable for users
- REQ-NFR-013: Recording interface must work on Chrome, Firefox, Safari, Edge
- REQ-NFR-014: Mobile users must be able to record using device microphone

## Acceptance Criteria

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

## Out of Scope

- Multi-language support (English only for this release)
- Real-time pronunciation analysis during recording
- Comparison with other users' scores (leaderboards)
- AI-generated voice feedback (text-to-speech reading the feedback)
- Video recording alongside audio
- Offline mode support
- Custom scoring criteria configuration by users
- Integration with external language learning platforms
- Automatic question difficulty adjustment based on user performance
- User authentication and authorization
- Persistent data storage (database or cloud storage)
- Cross-device or cross-session data synchronization
- Audio file storage (files are sent to API and not retained)

## Dependencies

### External Services
- OpenAI Whisper API for audio transcription
- OpenAI Chat Completion API (GPT-4) for scoring

### Technical Prerequisites
- Browser support for MediaRecorder API
- Browser support for Local Storage API
- Microphone permission granted by user
- Active internet connection for API calls
- Environment variables configured:
  - `OPENAI_API_KEY`

### Internal Dependencies
- Existing Questions database table and loader functions
- Question navigation component (already implemented)

## Assumptions

- Users have access to a working microphone
- Users will record responses in English
- Expected answer text is available in the database for comparison
- Audio recordings will be 10-60 seconds in length
- OpenAI APIs have sufficient rate limits for expected usage
- Users understand that history data is temporary and session-based
- Browser local storage has at least 1MB available space
- Users are comfortable with data loss on page reload/browser close
