/**
 * SummaryQuestionInput Component
 * Handles a single summary question with text area input,
 * independent evaluation via /api/reading/evaluate-summary,
 * and inline feedback display.
 */

'use client';

import { useState } from 'react';
import type { SummaryQuestion, SummaryFeedback } from '@/lib/types/reading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SummaryFeedbackDisplay } from '@/components/reading/SummaryFeedbackDisplay';
import { apiPost } from '@/lib/api-client';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

type SummaryQuestionInputProps = {
  question: SummaryQuestion;
  passageContent: string;
};

export function SummaryQuestionInput({ question, passageContent }: SummaryQuestionInputProps) {
  const [text, setText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<SummaryFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const minLength = question.minLength || 50;
  const trimmedLength = text.trim().length;
  const canSubmit = trimmedLength > 0 && !isEvaluating;

  const handleSubmit = async () => {
    if (!canSubmit) return;

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
        setError(data.error || '評価に失敗しました。もう一度お試しください。');
      }
    } catch {
      setError('評価に失敗しました。もう一度お試しください。');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          任意
        </span>
      </div>

      <p className="font-medium">{question.question}</p>
      <p className="text-sm text-muted-foreground">
        {question.questionJa || '要約を書いてください'}
      </p>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your summary here..."
        rows={5}
        maxLength={2000}
        disabled={isEvaluating}
        className="resize-y"
      />

      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            trimmedLength === 0
              ? 'text-muted-foreground'
              : trimmedLength < minLength
                ? 'text-orange-500'
                : 'text-green-600'
          }`}
        >
          {trimmedLength} / {minLength}文字
        </span>

        <Button onClick={handleSubmit} disabled={!canSubmit} size="sm" variant="outline">
          {isEvaluating ? '評価中...' : feedback ? '再送信' : '送信'}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {feedback && <SummaryFeedbackDisplay feedback={feedback} />}
    </div>
  );
}
