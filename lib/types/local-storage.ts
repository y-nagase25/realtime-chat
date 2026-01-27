import type { ReadingLevel, ReadingTopicId } from '@/lib/types/reading';

/**
 * Reading session record for progress tracking
 */
export interface ReadingSession {
  id: string;
  level: ReadingLevel;
  topic: ReadingTopicId;
  passageTitle: string;
  wordCount: number;
  readingTimeSeconds: number;
  wordsPerMinute: number;
  questionsTotal: number;
  questionsCorrect: number;
  scorePercentage: number;
  savedWords: string[];
  created_at: string; // ISO timestamp
}

/**
 * Speaking attempt stored in local storage
 */
export interface SpeakingAttempt {
  id: string;
  question_id: number;
  questionText: string;
  modelAnswer: string;
  transcript: string;
  score: number; // 0-10
  areas_for_improvement: string[];
  good_points: string[];
  processing_time_ms: number;
  created_at: string; // ISO timestamp
}
