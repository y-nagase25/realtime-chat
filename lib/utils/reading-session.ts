/**
 * Utility functions for reading session data
 */

import type {
  ComprehensionQuestion,
  Passage,
  QuestionResult,
  UserAnswer,
} from '@/lib/types/reading';
import type { ReadingSession } from '@/lib/types/local-storage';

/**
 * Session data without id and created_at (added by useLocalStorage)
 */
export type SessionData = Omit<ReadingSession, 'id' | 'created_at'>;

export const CORRECT = '○';
export const INCORRECT = '✗';

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

/**
 * Check if user's answer is correct for a given question
 */
export function checkAnswer(question: ComprehensionQuestion, userAnswer: UserAnswer): boolean {
  switch (question.type) {
    case 'multiple-choice':
      return userAnswer === question.correctAnswer;
    case 'true-false':
      return userAnswer === question.correctAnswer;
    case 'fill-in-blank': {
      const normalized = String(userAnswer).trim().toLowerCase();
      const correctNormalized = question.correctAnswer.trim().toLowerCase();
      if (normalized === correctNormalized) return true;
      return question.acceptableAnswers.some((a) => a.trim().toLowerCase() === normalized);
    }
    case 'summary':
      return false;
  }
}

/**
 * Format user's answer for display based on question type
 */
export function formatUserAnswer(question: ComprehensionQuestion, answer: UserAnswer): string {
  switch (question.type) {
    case 'multiple-choice':
      return question.options[answer as number] ?? String(answer);
    case 'true-false':
      return answer === true ? CORRECT : INCORRECT;
    case 'fill-in-blank':
      return String(answer);
    case 'summary':
      return String(answer);
  }
}

/**
 * Format correct answer for display based on question type
 */
export function formatCorrectAnswer(question: ComprehensionQuestion): string {
  switch (question.type) {
    case 'multiple-choice':
      return question.options[question.correctAnswer];
    case 'true-false':
      return question.correctAnswer ? CORRECT : INCORRECT;
    case 'fill-in-blank':
      return question.correctAnswer;
    case 'summary':
      return '';
  }
}
