/**
 * Type definitions for Speaking Practice Scoring System
 */

/**
 * Speaking attempt stored in local storage
 */
export interface SpeakingAttempt {
  id: string; // UUID generated client-side
  question_id: number;
  transcript: string;
  score: number; // 0-10
  areas_for_improvement: string[];
  good_points: string[];
  created_at: string; // ISO timestamp
  processing_time_ms: number;
}

/**
 * Scoring result from API
 */
export interface ScoringResult {
  score: number; // 0-10
  areasForImprovement: string[];
  goodPoints: string[];
  processingTime: number; // milliseconds
}

/**
 * Session statistics across all attempts
 */
export interface SessionStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  latestScore: number | null;
}

/**
 * State machine states for speaking practice flow
 */
export type SpeakingState =
  | 'idle' // Initial state, ready to record
  | 'recording' // Currently recording audio
  | 'transcribing' // Sending audio to Whisper API
  | 'transcribed' // Transcript received, ready to score
  | 'scoring' // Sending transcript to scoring API
  | 'completed' // Scoring complete, results displayed
  | 'error'; // Error occurred

/**
 * State machine events
 */
export type SpeakingEvent =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'TRANSCRIPTION_SUCCESS'; transcript: string }
  | { type: 'TRANSCRIPTION_ERROR'; error: Error }
  | { type: 'REQUEST_SCORING' }
  | { type: 'SCORING_SUCCESS'; result: ScoringResult }
  | { type: 'SCORING_ERROR'; error: Error }
  | { type: 'RESET' };

/**
 * Error types for user-facing error messages
 */
export type ErrorType =
  | 'permission_denied' // Microphone permission not granted
  | 'network_error' // API request failed
  | 'transcription_failed' // Whisper API error
  | 'scoring_failed' // GPT-4o API error
  | 'validation_error' // Invalid input
  | 'unknown_error'; // Unexpected error

/**
 * User-facing error with message and suggested action
 */
export interface UserError {
  type: ErrorType;
  message: string;
  action?: string; // Suggested action for user
}

/**
 * API request for scoring
 */
export interface ScoringRequest {
  questionId: number;
  questionText: string;
  modelAnswer: string;
  userTranscript: string;
}

/**
 * API response for scoring
 */
export interface ScoringResponse {
  success: boolean;
  data?: {
    score: number;
    areasForImprovement: string[];
    goodPoints: string[];
    processingTime: number;
  };
  error?: string;
}
