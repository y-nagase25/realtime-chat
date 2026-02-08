/**
 * SummaryQuestionInput Component
 * Handles a single summary question with text area input,
 * independent evaluation via /api/reading/evaluate-summary,
 * and inline feedback display.
 */

'use client';

import type { SummaryQuestion } from '@/lib/types/reading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SummaryFeedbackDisplay } from '@/components/reading/SummaryFeedbackDisplay';
import { useSummaryEvaluation } from '@/lib/hooks/use-summary-evaluation';

type SummaryQuestionInputProps = {
  question: SummaryQuestion;
  passageContent: string;
};

export function SummaryQuestionInput({ question, passageContent }: SummaryQuestionInputProps) {
  const { text, setText, feedback, isEvaluating, error, submitSummary } = useSummaryEvaluation();

  const minLength = question.minLength || 50;
  const trimmedLength = text.trim().length;
  const canSubmit = trimmedLength > 0 && !isEvaluating;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    await submitSummary(passageContent);
  };

  return (
    <div className="space-y-3" data-testid="summary-question-input">
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
        data-testid="summary-question-textarea"
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

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="sm"
          variant="outline"
          data-testid="summary-submit-button"
        >
          {isEvaluating ? '評価中...' : feedback ? '再送信' : '送信'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive" data-testid="summary-error">
          {error}
        </p>
      )}

      {feedback && <SummaryFeedbackDisplay feedback={feedback} />}
    </div>
  );
}
