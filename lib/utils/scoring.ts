/**
 * Scoring utility functions
 */

import type { SessionStats, SpeakingAttempt, ScoringRequest } from '@/lib/types/speaking';

/**
 * Build scoring prompt for GPT-4o
 */
export function buildScoringPrompt(scoringRequest: ScoringRequest): string {
  return `あなたは英語スピーキング指導者として、ユーザーの音声回答を書き起こしたテキストを評価します。

質問: ${scoringRequest.questionText}
模範解答: ${scoringRequest.modelAnswer}
ユーザーの書き起こし回答: ${scoringRequest.userTranscript}

ユーザーの回答テキストと模範解答テキストを比較し、以下の観点で評価してください:
1. 文法の正確性 - ユーザーの回答に文法的な誤りはないか?
2. 内容の関連性 - ユーザーの回答は模範解答の意味と一致しているか?
3. 語彙の使用 - 適切で模範解答に近い語彙が使われているか?

評価は必ず以下のJSON形式で日本語で提供してください:
{
  "score": <0から10までの数値>,
  "areasForImprovement": ["具体的な改善点1", "具体的な改善点2", ...],
  "goodPoints": ["良かった点1", "良かった点2", ...]
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
