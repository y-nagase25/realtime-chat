/**
 * Speaking Practice Container Component
 * Manages question selection state for QuestionsList and SpeakingPractice components
 */

'use client';

import type { Question } from '@/lib/types/db';
import { useQuestionSelection } from '@/lib/hooks/use-question-selection';
import { QuestionsList } from '@/components/QuestionsList';
import { SpeakingPractice } from './SpeakingPractice';

interface SpeakingPracticeContainerProps {
  questions: Question[];
}

export function SpeakingPracticeContainer({ questions }: SpeakingPracticeContainerProps) {
  const { selectedQuestion, selectQuestion } = useQuestionSelection(questions);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
      {/* Left Column */}
      <div className="space-y-6 lg:col-span-6">
        {/* Questions List with Search and Filter */}
        <QuestionsList
          questions={questions}
          onQuestionSelect={selectQuestion}
          selectedQuestionId={selectedQuestion?.id}
        />
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4">
        {/* Speaking Practice Component with Selected Question */}
        {selectedQuestion && <SpeakingPractice question={selectedQuestion} />}
      </div>
    </div>
  );
}
