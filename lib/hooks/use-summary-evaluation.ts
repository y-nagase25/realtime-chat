import { useState, useCallback } from 'react';
import type { SummaryFeedback } from '@/lib/types/reading';
import { apiPost } from '@/lib/api-client';
import type { ApiResponse } from '@/lib/types/api';

export interface UseSummaryEvaluationReturn {
  text: string;
  setText: (text: string) => void;
  feedback: SummaryFeedback | null;
  isEvaluating: boolean;
  error: string | null;
  submitSummary: (passageContent: string) => Promise<void>;
}

/**
 * Custom hook for managing summary evaluation state and interactions
 *
 * Handles:
 * - Submitting summaries to the evaluation API
 * - Managing loading and error states
 */
export function useSummaryEvaluation(): UseSummaryEvaluationReturn {
  const [text, setText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<SummaryFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitSummary = useCallback(
    async (passageContent: string) => {
      setIsEvaluating(true);
      setError(null);

      try {
        const data = await apiPost<ApiResponse<SummaryFeedback>>('/api/reading/evaluate-summary', {
          passage: passageContent,
          userSummary: text.trim(),
        });

        if (data.success) {
          setFeedback(data.data);
        } else {
          setError(data.error || '要約の評価に失敗しました');
        }
      } catch {
        setError('要約の評価に失敗しました');
      } finally {
        setIsEvaluating(false);
      }
    },
    [text]
  );

  return {
    text,
    setText,
    feedback,
    isEvaluating,
    error,
    submitSummary,
  };
}
