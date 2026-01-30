import { useState, useCallback } from 'react';
import type { SummaryFeedback } from '@/lib/types/reading';
import { apiPost } from '@/lib/api-client';
import type { ApiResponse } from '@/lib/types/api';
import { useToast } from '@/lib/hooks/use-toast';
import { EXCEEDED_USAGE_LIMIT_MSG } from '@/lib/constants';
import { RateLimitError } from '@/lib/errors';

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
  const { showToast: showExceededUsageLimitToast } = useToast(EXCEEDED_USAGE_LIMIT_MSG, 'warning');

  const submitSummary = useCallback(
    async (passageContent: string) => {
      setIsEvaluating(true);
      setError(null);

      try {
        const data = await apiPost<ApiResponse<SummaryFeedback>>('/api/reading/evaluate-summary', {
          passage: passageContent,
          userSummary: text.trim(),
        });

        if (!data.success) {
          throw new Error(data.error || '要約の評価に失敗しました');
        }

        setFeedback(data.data);
      } catch (err) {
        if (err instanceof RateLimitError) {
          showExceededUsageLimitToast();
          setError(EXCEEDED_USAGE_LIMIT_MSG);
        } else {
          setError('要約の評価に失敗しました');
        }
      } finally {
        setIsEvaluating(false);
      }
    },
    [text, showExceededUsageLimitToast]
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
