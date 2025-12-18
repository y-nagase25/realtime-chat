/**
 * Speaking Practice Container Component
 * Manages question selection state for QuestionsList and SpeakingPractice components
 */

'use client';

import type { Question } from '@/lib/types/db';
import { useQuestionSelection } from '@/lib/hooks/use-question-selection';
import { QuestionsList } from '@/components/QuestionsList';
import { SpeakingPractice } from './SpeakingPractice';
import { AttemptHistory } from './AttemptHistory';
import { memo } from 'react';

interface SpeakingPracticeContainerProps {
  questions: Question[];
}

const AttemptHistoryMemo = memo(() => <AttemptHistory />);

export function SpeakingPracticeContainer({ questions }: SpeakingPracticeContainerProps) {
  const { selectedQuestion, selectQuestion } = useQuestionSelection(questions);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
      {/* Left Column: Questions List and Speaking Practice (60% on desktop) */}
      <div className="space-y-6 lg:col-span-6">
        {/* Questions List with Search and Filter */}
        <QuestionsList
          questions={questions}
          onQuestionSelect={selectQuestion}
          selectedQuestionId={selectedQuestion?.id}
        />
        {/* Speaking Practice Component with Selected Question */}
        {selectedQuestion && <SpeakingPractice question={selectedQuestion} />}
      </div>

      {/* Right Column: Attempt History (40% on desktop) */}
      <div className="lg:col-span-4">
        <AttemptHistoryMemo />
      </div>
    </div>
  );
}
