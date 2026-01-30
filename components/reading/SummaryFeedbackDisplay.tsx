/**
 * SummaryFeedbackDisplay Component
 * Renders inline feedback for a summary question evaluation.
 */

'use client';

import type { SummaryFeedback } from '@/lib/types/reading';

type SummaryFeedbackDisplayProps = {
  feedback: SummaryFeedback;
};

export function SummaryFeedbackDisplay({ feedback }: SummaryFeedbackDisplayProps) {
  return (
    <div className="mt-4 space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">スコア:</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${
            feedback.score >= 70
              ? 'bg-green-100 text-green-800'
              : feedback.score >= 40
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {feedback.score}/100
        </span>
      </div>

      {feedback.keyPointsCaptured.length > 0 && (
        <div>
          <p className="text-sm font-medium text-green-700">捉えたポイント:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {feedback.keyPointsCaptured.map((point) => (
              <li key={point} className="text-sm text-green-600">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.keyPointsMissed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-red-700">不足しているポイント:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {feedback.keyPointsMissed.map((point) => (
              <li key={point} className="text-sm text-red-600">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.grammarFeedbackJa && (
        <div>
          <p className="text-sm font-medium">文法:</p>
          <p className="text-sm text-muted-foreground">{feedback.grammarFeedbackJa}</p>
        </div>
      )}

      {feedback.vocabularyFeedbackJa && (
        <div>
          <p className="text-sm font-medium">語彙:</p>
          <p className="text-sm text-muted-foreground">{feedback.vocabularyFeedbackJa}</p>
        </div>
      )}

      {feedback.overallFeedbackJa && (
        <div>
          <p className="text-sm font-medium">総合評価:</p>
          <p className="text-sm text-muted-foreground">{feedback.overallFeedbackJa}</p>
        </div>
      )}

      {feedback.modelSummary && (
        <div>
          <p className="text-sm font-medium">模範解答:</p>
          <p className="text-sm italic text-muted-foreground">{feedback.modelSummary}</p>
        </div>
      )}
    </div>
  );
}
