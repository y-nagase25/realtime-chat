import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@/lib/types/db';

export interface UseQuestionNavigationReturn {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  handlePrevious: () => void;
  handleNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function useQuestionNavigation(questions: Question[]): UseQuestionNavigationReturn {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => {
      if (prev < questions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [questions.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevious, handleNext]);

  return {
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    totalQuestions: questions.length,
    handlePrevious,
    handleNext,
    canGoPrevious: currentQuestionIndex > 0,
    canGoNext: currentQuestionIndex < questions.length - 1,
  };
}
