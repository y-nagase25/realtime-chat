/**
 * Scoring utility functions
 */

import type { SessionStats, SpeakingAttempt } from '@/lib/types/speaking';

/**
 * Build scoring prompt for GPT-4o
 */
export function buildScoringPrompt(
  questionText: string,
  modelAnswer: string,
  userTranscript: string
): string {
  return `You are an English speaking tutor evaluating a student's spoken response by comparing their transcribed text with the model answer.

Question: ${questionText}
Model Answer: ${modelAnswer}
Student's Transcribed Response: ${userTranscript}

Your task is to compare the student's response text with the model answer text and evaluate based on:
1. Grammar accuracy - Are there grammatical errors in the student's response?
2. Content relevance - Does the student's answer match the meaning of the model answer?
3. Vocabulary usage - Is the vocabulary appropriate and similar to the model answer?

Provide your evaluation in the following JSON format:
{
  "score": <number 0-10>,
  "areasForImprovement": ["specific improvement 1", "specific improvement 2", ...],
  "goodPoints": ["positive aspect 1", "positive aspect 2", ...]
}`;
}

/**
 * Get color variant based on score
 * Green: 8-10, Yellow: 5-7, Red: 0-4
 */
export function getScoreColor(score: number): 'success' | 'warning' | 'destructive' {
  if (score >= 8) return 'success'; // green
  if (score >= 5) return 'warning'; // yellow
  return 'destructive'; // red
}

/**
 * Get badge variant for Tailwind CSS classes
 */
export function getScoreBadgeClass(score: number): string {
  if (score >= 8) {
    return 'bg-green-100 text-green-800 border-green-500 dark:bg-green-900 dark:text-green-200';
  }
  if (score >= 5) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-500 dark:bg-yellow-900 dark:text-yellow-200';
  }
  return 'bg-red-100 text-red-800 border-red-500 dark:bg-red-900 dark:text-red-200';
}

/**
 * Calculate session statistics from all attempts
 */
export function calculateSessionStats(attempts: SpeakingAttempt[]): SessionStats {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      latestScore: null,
    };
  }

  const scores = attempts.map((a) => a.score);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);

  return {
    totalAttempts: attempts.length,
    averageScore: totalScore / attempts.length,
    bestScore: Math.max(...scores),
    latestScore: attempts[attempts.length - 1]?.score ?? null,
  };
}
