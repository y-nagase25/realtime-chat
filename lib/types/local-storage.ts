import type { ReadingLevel, ReadingTopicId } from '@/lib/types/reading';

export type LocalStorageType = ReadingSession | SpeakingAttempt;

export interface LocalStorageBase {
  id: string;
  created_at: string; // ISO timestamp
}

/**
 * Reading session record for progress tracking
 */
export interface ReadingSession extends LocalStorageBase {
  level: ReadingLevel;
  topic: ReadingTopicId;
  passageTitle: string;
  wordCount: number;
  questionsTotal: number;
  questionsCorrect: number;
  scorePercentage: number;
}

/**
 * Speaking attempt stored in local storage
 */
export interface SpeakingAttempt extends LocalStorageBase {
  question_id: number;
  questionText: string;
  modelAnswer: string;
  transcript: string;
  score: number; // 0-10
  areas_for_improvement: string[];
  good_points: string[];
  processing_time_ms: number;
}
