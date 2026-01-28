import type { ReadingLevel, ReadingTopicId, VocabularyEntry } from '@/lib/types/reading';

export type LocalStorageType = ReadingSession | SpeakingAttempt | SavedVocabulary;

export type LocalStorageBase = {
  id: string;
  created_at: string; // ISO timestamp
};

/**
 * Reading session record for progress tracking
 */
export type ReadingSession = LocalStorageBase & {
  level: ReadingLevel;
  topic: ReadingTopicId;
  passageTitle: string;
  wordCount: number;
  questionsTotal: number;
  questionsCorrect: number;
  scorePercentage: number;
};

/**
 * Speaking attempt stored in local storage
 */
export type SpeakingAttempt = LocalStorageBase & {
  question_id: number;
  questionText: string;
  modelAnswer: string;
  transcript: string;
  score: number; // 0-10
  areas_for_improvement: string[];
  good_points: string[];
  processing_time_ms: number;
};

/**
 * Saved vocabulary record for progress tracking
 */
export type SavedVocabulary = LocalStorageBase & VocabularyEntry;
