/**
 * ComprehensionQuestions Component
 * Renders comprehension questions (multiple-choice, true/false, fill-in-blank)
 * and tracks user answers for submission.
 */

'use client';

import { useState } from 'react';
import type { ComprehensionQuestion, SummaryQuestion, UserAnswer } from '@/lib/types/reading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MultipleChoiceInput } from '@/components/reading/input/MultipleChoiceInput';
import { TrueFalseInput } from '@/components/reading/input/TrueFalseInput';
import { FillInBlankInput } from '@/components/reading/input/FillInBlankInput';
import { SummaryQuestionInput } from '@/components/reading/input/SummaryQuestionInput';

/**
 * Props for the ComprehensionQuestions component
 */
export type ComprehensionQuestionsProps = {
  /** Array of comprehension questions to display */
  questions: ComprehensionQuestion[];
  /** Callback when answers are submitted */
  onSubmit: (answers: Record<string, UserAnswer>) => void;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Passage content for summary question evaluation */
  passageContent: string;
};

/**
 * ComprehensionQuestions - Displays and handles comprehension questions
 */
export function ComprehensionQuestions({
  questions,
  onSubmit,
  isSubmitting,
  passageContent,
}: ComprehensionQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});

  const regularQuestions = questions.filter((q) => q.type !== 'summary');
  const summaryQuestions = questions.filter((q): q is SummaryQuestion => q.type === 'summary');

  const handleAnswerChange = (questionId: string, value: UserAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const allAnswered = regularQuestions.every(
    (q) => answers[q.id] !== undefined && answers[q.id] !== ''
  );

  return (
    <Card data-testid="comprehension-questions">
      <CardHeader>
        <h2 data-testid="questions-title" className="text-xl font-bold">
          理解度チェック
        </h2>
        <p className="text-sm text-muted-foreground">Comprehension Questions</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {regularQuestions.map((question, index) => (
          <div key={question.id} data-testid={`question-${question.id}`} className="space-y-3">
            <p id={`question-label-${question.id}`} className="font-medium">
              <span className="text-muted-foreground">Q{index + 1}.</span> {question.question}
            </p>

            {question.type === 'multiple-choice' && (
              <MultipleChoiceInput
                question={question}
                value={answers[question.id] as number | undefined}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            )}

            {question.type === 'true-false' && (
              <TrueFalseInput
                question={question}
                value={answers[question.id] as boolean | undefined}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            )}

            {question.type === 'fill-in-blank' && (
              <FillInBlankInput
                question={question}
                value={(answers[question.id] as string) ?? ''}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            )}
          </div>
        ))}

        <div className="pt-4">
          <Button
            data-testid="submit-answers-button"
            data-submitting={isSubmitting ? 'true' : undefined}
            onClick={() => onSubmit(answers)}
            disabled={!allAnswered || isSubmitting}
            className="w-full min-h-11"
          >
            {isSubmitting ? '送信中...' : '答え合わせ'}
          </Button>
        </div>

        {summaryQuestions.length > 0 && (
          <>
            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">要約問題</h3>
            </div>
            {summaryQuestions.map((question) => (
              <SummaryQuestionInput
                key={question.id}
                question={question}
                passageContent={passageContent}
              />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
