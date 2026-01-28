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
 * Build session data from passage and results
 * @param passage The passage that was read
 * @param results Array of question results
 * @returns SessionData object ready for storage
 */
export function buildSessionData(passage: Passage, results: QuestionResult[]): SessionData {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    level: passage.level,
    topic: passage.topic,
    passageTitle: passage.title,
    wordCount: passage.wordCount,
    questionsTotal: totalCount,
    questionsCorrect: correctCount,
    scorePercentage: percentage,
  };
}
