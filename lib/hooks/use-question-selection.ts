import { useState, useCallback } from 'react';
import type { Question } from '@/lib/types/db';

export interface UseQuestionSelectionReturn {
  selectedQuestion: Question | null;
  selectedIndex: number | null;
  selectQuestion: (question: Question, index: number) => void;
  hasSelection: boolean;
}

/**
 * Hook for managing question selection state
 * Initializes with the first question by default
 */
export function useQuestionSelection(questions: Question[]): UseQuestionSelectionReturn {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    questions.length > 0 ? 0 : null
  );

  const selectQuestion = useCallback((_question: Question, index: number) => {
    setSelectedIndex(index);
  }, []);

  return {
    selectedQuestion: selectedIndex !== null ? questions[selectedIndex] : null,
    selectedIndex,
    selectQuestion,
    hasSelection: selectedIndex !== null,
  };
}
