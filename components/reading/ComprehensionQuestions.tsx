/**
 * ComprehensionQuestions Component
 * Renders comprehension questions (multiple-choice, true/false, fill-in-blank)
 * and tracks user answers for submission.
 */

'use client';

import { useState } from 'react';
import type {
  ComprehensionQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillInBlankQuestion,
  SummaryQuestion,
} from '@/lib/types/reading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SummaryQuestionInput } from '@/components/reading/SummaryQuestionInput';

/**
 * User answer type - supports all question types
 */
export type UserAnswer = string | number | boolean;

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

  const handleSubmit = () => {
    onSubmit(answers);
  };

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
            <p className="font-medium">
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
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="w-full"
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

/**
 * Multiple choice question input with radio buttons
 */
function MultipleChoiceInput({
  question,
  value,
  onChange,
}: {
  question: MultipleChoiceQuestion;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  return (
    <RadioGroup
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(val) => onChange(Number(val))}
      className="space-y-2"
    >
      {question.options.map((option, index) => (
        <div
          key={option}
          data-testid={`option-${question.id}-${index}`}
          className="flex items-center gap-2"
        >
          <RadioGroupItem value={String(index)} id={`${question.id}-${index}`} />
          <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

/**
 * True/False question input with radio buttons
 */
function TrueFalseInput({
  question,
  value,
  onChange,
}: {
  question: TrueFalseQuestion;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <RadioGroup
      value={value !== undefined ? String(value) : undefined}
      onValueChange={(val) => onChange(val === 'true')}
      className="space-y-2"
    >
      <div data-testid={`option-${question.id}-true`} className="flex items-center gap-2">
        <RadioGroupItem value="true" id={`${question.id}-true`} />
        <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
          True
        </Label>
      </div>
      <div data-testid={`option-${question.id}-false`} className="flex items-center gap-2">
        <RadioGroupItem value="false" id={`${question.id}-false`} />
        <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
          False
        </Label>
      </div>
    </RadioGroup>
  );
}

/**
 * Fill-in-the-blank question input with text field
 */
function FillInBlankInput({
  question,
  value,
  onChange,
}: {
  question: FillInBlankQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Input
      data-testid={`input-${question.id}`}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="回答を入力..."
      className="max-w-sm"
    />
  );
}
