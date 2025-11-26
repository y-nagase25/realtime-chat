'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useQuestionNavigation } from '@/lib/hooks/use-question-navigation';
import { QuestionBadge } from '@/components/QuestionBadge';
import type { Question } from '@/lib/types/db';

interface QuestionsProps {
  questions: Question[];
  // Optional: external state for controlled mode
  currentQuestionIndex?: number;
  totalQuestions?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

export function Questions({
  questions,
  currentQuestionIndex: externalIndex,
  totalQuestions: externalTotal,
  onPrevious: externalPrevious,
  onNext: externalNext,
  canGoPrevious: externalCanGoPrevious,
  canGoNext: externalCanGoNext,
}: QuestionsProps) {
  // Use internal navigation state if external props are not provided
  const internalNavigation = useQuestionNavigation(questions);

  // Determine which state to use (external or internal)
  const isControlled = externalIndex !== undefined;
  const currentQuestionIndex = isControlled
    ? externalIndex
    : internalNavigation.currentQuestionIndex;
  const totalQuestions = externalTotal ?? internalNavigation.totalQuestions;
  const handlePrevious = externalPrevious ?? internalNavigation.handlePrevious;
  const handleNext = externalNext ?? internalNavigation.handleNext;
  const canGoPrevious = externalCanGoPrevious ?? internalNavigation.canGoPrevious;
  const canGoNext = externalCanGoNext ?? internalNavigation.canGoNext;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Left Arrow */}
      <Button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        variant="outline"
        size="icon"
        className="shrink-0"
      >
        <IconChevronLeft className="h-6 w-6" />
      </Button>

      {/* Question Card */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Q{currentQuestionIndex + 1} / {totalQuestions}
            </CardTitle>
            <QuestionBadge level={currentQuestion.level} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <p className="leading-7">{currentQuestion.question}</p>
          </div>
        </CardContent>
      </Card>

      {/* Right Arrow */}
      <Button
        onClick={handleNext}
        disabled={!canGoNext}
        variant="outline"
        size="icon"
        className="shrink-0"
      >
        <IconChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
