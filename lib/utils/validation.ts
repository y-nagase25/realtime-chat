/**
 * Validation utility functions
 */

import type { SpeakingAttempt } from '@/lib/types/speaking';

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB (Whisper limit)
const ALLOWED_MIME_TYPES = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];

/**
 * Validate audio blob before upload
 * @throws Error if validation fails
 */
export function validateAudioBlob(blob: Blob): void {
  if (!blob) {
    throw new Error('No audio file provided');
  }

  if (blob.size === 0) {
    throw new Error('Audio file is empty');
  }

  if (blob.size > MAX_AUDIO_SIZE) {
    throw new Error(`Audio file exceeds size limit (${MAX_AUDIO_SIZE / (1024 * 1024)}MB)`);
  }

  if (!ALLOWED_MIME_TYPES.some((type) => blob.type.includes(type.split('/')[1]))) {
    throw new Error(`Invalid audio file type: ${blob.type}`);
  }
}

/**
 * Validate scoring request data
 * @throws Error if validation fails
 */
export function validateScoringRequest(data: unknown): void {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid request format');
  }

  const { questionText, modelAnswer, userTranscript } = data as Record<string, unknown>;

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
    throw new Error('Transcript too long (max 5000 characters)');
  }
}

/**
 * Validate single speaking attempt from local storage
 */
function isValidSpeakingAttempt(item: unknown): item is SpeakingAttempt {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const attempt = item as Record<string, unknown>;

  return (
    typeof attempt.id === 'string' &&
    typeof attempt.question_id === 'number' &&
    typeof attempt.transcript === 'string' &&
    typeof attempt.score === 'number' &&
    Array.isArray(attempt.areas_for_improvement) &&
    attempt.areas_for_improvement.every((item) => typeof item === 'string') &&
    Array.isArray(attempt.good_points) &&
    attempt.good_points.every((item) => typeof item === 'string') &&
    typeof attempt.created_at === 'string' &&
    typeof attempt.processing_time_ms === 'number'
  );
}

/**
 * Validate and sanitize local storage data
 * Returns empty array if data is invalid
 */
export function sanitizeLocalStorageData(data: unknown): SpeakingAttempt[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isValidSpeakingAttempt);
}

/**
 * Validate speaking attempt before saving
 * @throws Error if validation fails
 */
export function validateSpeakingAttempt(attempt: Partial<SpeakingAttempt>): void {
  if (!attempt.id || typeof attempt.id !== 'string') {
    throw new Error('Invalid attempt ID');
  }

  if (typeof attempt.question_id !== 'number') {
    throw new Error('Invalid question ID');
  }

  if (typeof attempt.transcript !== 'string' || attempt.transcript.length === 0) {
    throw new Error('Invalid transcript');
  }

  if (typeof attempt.score !== 'number' || attempt.score < 0 || attempt.score > 10) {
    throw new Error('Invalid score (must be 0-10)');
  }

  if (!Array.isArray(attempt.areas_for_improvement)) {
    throw new Error('Invalid areas for improvement');
  }

  if (!Array.isArray(attempt.good_points)) {
    throw new Error('Invalid good points');
  }
}
