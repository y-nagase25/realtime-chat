/**
 * Utility functions for reading session data
 */

import type { Passage } from '@/lib/types/reading';
import type { QuestionResult } from '@/components/reading/QuestionResults';
import type { ReadingSession } from '@/lib/types/local-storage';

/**
 * Session data without id and created_at (added by useLocalStorage)
 */
export type SessionData = Omit<ReadingSession, 'id' | 'created_at'>;

/**
 * Calculate words per minute based on word count and reading time
 * @param wordCount Number of words in the passage
 * @param readingTimeSeconds Time spent reading in seconds
 * @returns WPM rounded to the nearest integer, or 0 if time is invalid
 */
export function calculateWpm(wordCount: number, readingTimeSeconds: number): number {
  if (readingTimeSeconds <= 0) {
    return 0;
  }
  return Math.round((wordCount / readingTimeSeconds) * 60);
}

/**
 * Build session data from passage, results, and saved words
 * @param passage The passage that was read
 * @param readingTimeSeconds Time spent reading in seconds
 * @param results Array of question results
 * @param savedWords Array of words saved during the session
 * @returns SessionData object ready for storage
 */
export function buildSessionData(
  passage: Passage,
  readingTimeSeconds: number,
  results: QuestionResult[],
  savedWords: string[]
): SessionData {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    level: passage.level,
    topic: passage.topic,
    passageTitle: passage.title,
    wordCount: passage.wordCount,
    readingTimeSeconds,
    wordsPerMinute: calculateWpm(passage.wordCount, readingTimeSeconds),
    questionsTotal: totalCount,
    questionsCorrect: correctCount,
    scorePercentage: percentage,
    savedWords: [...new Set(savedWords)], // Remove duplicates
  };
}
