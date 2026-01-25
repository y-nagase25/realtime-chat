/**
 * SummaryWriting Component
 * Provides a textarea for users to write a summary of the passage,
 * submits it for AI evaluation, and displays feedback in Japanese.
 */

'use client';

import { useState } from 'react';
import type { SummaryFeedback } from '@/lib/types/reading';
import { ErrorMessage } from '@/components/reading/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

/**
 * Props for the SummaryWriting component
 */
export type SummaryWritingProps = {
  /** Callback when user submits their summary */
  onSubmit: (summary: string) => void;
  /** Whether the evaluation is in progress */
  isEvaluating: boolean;
  /** AI feedback result (null before submission) */
  feedback: SummaryFeedback | null;
  /** Error message to display */
  error?: string;
  /** Callback when user clicks retry after an error */
  onRetry?: () => void;
};

/**
 * Count words in a string
 */
function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * SummaryWriting - Text area with AI evaluation feedback
 */
export function SummaryWriting({
  onSubmit,
  isEvaluating,
  feedback,
  error,
  onRetry,
}: SummaryWritingProps) {
  const [summary, setSummary] = useState('');
  const wordCount = countWords(summary);
  const isEmpty = summary.trim() === '';

  const handleSubmit = () => {
    onSubmit(summary);
  };

  return (
    <Card data-testid="summary-writing">
      <CardHeader>
        <h2 data-testid="summary-title" className="text-xl font-bold">
          要約を書く
        </h2>
        <p className="text-sm text-muted-foreground">
          読んだ文章を英語で要約してください（2〜4文程度）
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            data-testid="summary-textarea"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="英語で要約を書いてください..."
            rows={4}
            disabled={!!feedback}
            className="resize-none"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span data-testid="summary-word-count">{wordCount} 語</span>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={onRetry} />}

        {!feedback && (
          <Button
            data-testid="submit-summary-button"
            onClick={handleSubmit}
            disabled={isEmpty || isEvaluating}
            className="w-full min-h-11"
          >
            {isEvaluating ? '評価中...' : '評価する'}
          </Button>
        )}

        {feedback && <FeedbackDisplay feedback={feedback} />}
      </CardContent>
    </Card>
  );
}

/**
 * Displays AI evaluation feedback
 */
function FeedbackDisplay({ feedback }: { feedback: SummaryFeedback }) {
  return (
    <div data-testid="summary-feedback" className="space-y-4">
      <div className="rounded-lg bg-muted/50 p-4 text-center">
        <p data-testid="feedback-score" className="text-2xl font-bold">
          {feedback.score}点
        </p>
      </div>

      <div data-testid="feedback-overall" className="space-y-1">
        <h4 className="text-sm font-medium">総合評価</h4>
        <p className="text-sm text-muted-foreground">{feedback.overallFeedbackJa}</p>
      </div>

      <div data-testid="feedback-grammar" className="space-y-1">
        <h4 className="text-sm font-medium">文法</h4>
        <p className="text-sm text-muted-foreground">{feedback.grammarFeedbackJa}</p>
      </div>

      <div data-testid="feedback-vocabulary" className="space-y-1">
        <h4 className="text-sm font-medium">語彙</h4>
        <p className="text-sm text-muted-foreground">{feedback.vocabularyFeedbackJa}</p>
      </div>

      <div data-testid="feedback-captured" className="space-y-1">
        <h4 className="text-sm font-medium text-green-700">捉えたポイント</h4>
        <ul className="text-sm text-muted-foreground list-disc pl-4">
          {feedback.keyPointsCaptured.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>

      {feedback.keyPointsMissed.length > 0 && (
        <div data-testid="feedback-missed" className="space-y-1">
          <h4 className="text-sm font-medium text-red-700">見逃したポイント</h4>
          <ul className="text-sm text-muted-foreground list-disc pl-4">
            {feedback.keyPointsMissed.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      <div data-testid="feedback-model-summary" className="space-y-1">
        <h4 className="text-sm font-medium">模範要約</h4>
        <p className="text-sm italic text-muted-foreground">{feedback.modelSummary}</p>
      </div>
    </div>
  );
}
