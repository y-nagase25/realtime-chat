/**
 * Speaking Practice Container Component
 * Manages shared question navigation state for Questions and SpeakingPractice components
 */

'use client';

import type { Question } from '@/lib/types/db';
import { useQuestionNavigation } from '@/lib/hooks/use-question-navigation';
import { Questions } from '@/components/Questions';
import { SpeakingPractice } from './SpeakingPractice';

interface SpeakingPracticeContainerProps {
  questions: Question[];
}

export function SpeakingPracticeContainer({ questions }: SpeakingPracticeContainerProps) {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    handlePrevious,
    handleNext,
    canGoPrevious,
    canGoNext,
  } = useQuestionNavigation(questions);

  return (
    <div className="space-y-6">
      {/* Question Display with Navigation */}
      <Questions
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />

      {/* Speaking Practice Component with Current Question */}
      <SpeakingPractice question={currentQuestion} />
    </div>
  );
}
