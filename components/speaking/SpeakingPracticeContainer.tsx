/**
 * Speaking Practice Container Component
 * Manages shared question navigation state for Questions and SpeakingPractice components
 */

'use client';

import type { Question } from '@/lib/types/db';
import { useQuestionNavigation } from '@/lib/hooks/use-question-navigation';
import { Questions } from '@/components/Questions';
import { SpeakingPractice } from './SpeakingPractice';
import { AttemptHistory } from './AttemptHistory';

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
      {/* Left Column: Questions and Speaking Practice (60% on desktop) */}
      <div className="space-y-6 lg:col-span-6">
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

      {/* Right Column: Attempt History (40% on desktop) */}
      <div className="lg:col-span-4">
        <AttemptHistory />
      </div>
    </div>
  );
}
