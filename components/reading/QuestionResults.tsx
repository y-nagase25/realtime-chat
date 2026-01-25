/**
 * QuestionResults Component
 * Displays comprehension question results with score,
 * correct/incorrect indicators, and explanations in Japanese.
 */

'use client';

import type { ComprehensionQuestion } from '@/lib/types/reading';
import type { UserAnswer } from '@/components/reading/ComprehensionQuestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Result for a single question
 */
export type QuestionResult = {
  question: ComprehensionQuestion;
  userAnswer: UserAnswer;
  isCorrect: boolean;
};

/**
 * Props for the QuestionResults component
 */
export type QuestionResultsProps = {
  /** Array of question results */
  results: QuestionResult[];
  /** Callback when user wants to generate a new passage */
  onNewPassage: () => void;
};

/**
 * QuestionResults - Displays score and explanations for answered questions
 */
export function QuestionResults({ results, onNewPassage }: QuestionResultsProps) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <Card data-testid="question-results">
      <CardHeader>
        <h2 data-testid="results-title" className="text-xl font-bold">
          結果
        </h2>
      </CardHeader>

      <CardContent className="space-y-6">
        <ScoreCard correctCount={correctCount} totalCount={totalCount} percentage={percentage} />

        <div data-testid="results-explanations" className="space-y-4">
          <h3 className="font-semibold text-lg">解説</h3>

          {results.map((result, index) => (
            <ResultItem key={result.question.id} result={result} index={index} />
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            data-testid="new-passage-button"
            onClick={onNewPassage}
            className="flex-1 min-h-11"
          >
            完了
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Score display card showing correct count and percentage
 */
function ScoreCard({
  correctCount,
  totalCount,
  percentage,
}: {
  correctCount: number;
  totalCount: number;
  percentage: number;
}) {
  return (
    <div aria-live="polite" className="rounded-lg bg-muted/50 p-6 text-center">
      <p data-testid="results-score" className="text-2xl font-bold">
        {correctCount} / {totalCount} 正解
      </p>
      <p data-testid="results-percentage" className="text-3xl font-bold mt-2">
        {percentage}%
      </p>
    </div>
  );
}

/**
 * Individual question result with correct/incorrect indicator and explanation
 */
function ResultItem({ result, index }: { result: QuestionResult; index: number }) {
  const { question, userAnswer, isCorrect } = result;

  return (
    <div
      data-testid={`result-${question.id}`}
      className={`rounded-md border p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-muted-foreground">Q{index + 1}.</span>
        <span className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
          {isCorrect ? '✓ 正解' : '✗ 不正解'}
        </span>
      </div>

      {!isCorrect && (
        <p className="text-sm mb-1">
          <span className="text-muted-foreground">あなたの答え: </span>
          <span className="font-medium">{formatUserAnswer(question, userAnswer)}</span>
        </p>
      )}

      <p className="text-sm mb-2">
        <span className="text-muted-foreground">正解: </span>
        <span className="font-medium">{formatCorrectAnswer(question)}</span>
      </p>

      <p className="text-sm text-muted-foreground">解説: {question.explanationJa}</p>
    </div>
  );
}

/**
 * Format user's answer for display based on question type
 */
function formatUserAnswer(question: ComprehensionQuestion, answer: UserAnswer): string {
  switch (question.type) {
    case 'multiple-choice':
      return question.options[answer as number] ?? String(answer);
    case 'true-false':
      return answer === true ? 'True' : 'False';
    case 'fill-in-blank':
      return String(answer);
    case 'summary':
      return String(answer);
  }
}

/**
 * Format correct answer for display based on question type
 */
function formatCorrectAnswer(question: ComprehensionQuestion): string {
  switch (question.type) {
    case 'multiple-choice':
      return question.options[question.correctAnswer];
    case 'true-false':
      return question.correctAnswer ? 'True' : 'False';
    case 'fill-in-blank':
      return question.correctAnswer;
    case 'summary':
      return '';
  }
}
