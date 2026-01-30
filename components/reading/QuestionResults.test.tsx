/**
 * Unit tests for QuestionResults component
 * Tests the save history functionality with new props
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { QuestionResults, type QuestionResult } from '@/components/reading/QuestionResults';
import type { Passage, ComprehensionQuestion } from '@/lib/types/reading';

// Mock useLocalStorage hook
vi.mock('@/lib/hooks/use-local-storage', () => ({
  useLocalStorage: vi.fn(() => ({
    history: [],
    add: vi.fn(),
    remove: vi.fn(),
  })),
  READING_HISTORY_STORAGE_KEY: 'reading-practice-history',
}));

// Create mock question data
const mockMultipleChoiceQuestion: ComprehensionQuestion = {
  id: 'q1',
  type: 'multiple-choice',
  question: 'What is the main topic?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: 0,
  explanation: 'Option A is correct because...',
  explanationJa: 'Aが正解です。',
};

const mockTrueFalseQuestion: ComprehensionQuestion = {
  id: 'q2',
  type: 'true-false',
  question: 'The sky is blue.',
  correctAnswer: true,
  explanation: 'The sky appears blue...',
  explanationJa: '空は青いです。',
};

const mockPassage: Passage = {
  title: 'Test Passage',
  content: 'This is a test passage content.',
  level: 'A1',
  topic: 'daily-life',
  wordCount: 100,
  estimatedReadingTimeMinutes: 2,
  questions: [mockMultipleChoiceQuestion, mockTrueFalseQuestion],
};

const mockResults: QuestionResult[] = [
  {
    question: mockMultipleChoiceQuestion,
    userAnswer: 0,
    isCorrect: true,
  },
  {
    question: mockTrueFalseQuestion,
    userAnswer: false,
    isCorrect: false,
  },
];

describe('QuestionResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('basic rendering', () => {
    it('renders results title', () => {
      render(
        <QuestionResults results={mockResults} passage={mockPassage} onSaveHistory={vi.fn()} />
      );

      expect(screen.getByTestId('results-title')).toHaveTextContent('結果');
    });

    it('renders score correctly', () => {
      render(
        <QuestionResults results={mockResults} passage={mockPassage} onSaveHistory={vi.fn()} />
      );

      expect(screen.getByTestId('results-score')).toHaveTextContent('1 / 2 正解');
    });

    it('renders percentage correctly', () => {
      render(
        <QuestionResults results={mockResults} passage={mockPassage} onSaveHistory={vi.fn()} />
      );

      expect(screen.getByTestId('results-percentage')).toHaveTextContent('50%');
    });

    it('renders complete button', () => {
      render(
        <QuestionResults results={mockResults} passage={mockPassage} onSaveHistory={vi.fn()} />
      );

      expect(screen.getByTestId('new-passage-button')).toHaveTextContent('完了');
    });
  });

  describe('result display', () => {
    it('renders correct answer indicator for correct answers', () => {
      render(
        <QuestionResults results={mockResults} passage={mockPassage} onSaveHistory={vi.fn()} />
      );

      const correctResult = screen.getByTestId('result-q1');
      expect(correctResult).toHaveTextContent('正解');
    });

    it('renders incorrect answer indicator for wrong answers', () => {
      render(
        <QuestionResults results={mockResults} passage={mockPassage} onSaveHistory={vi.fn()} />
      );

      const incorrectResult = screen.getByTestId('result-q2');
      expect(incorrectResult).toHaveTextContent('不正解');
    });

    it('shows user answer for incorrect questions', () => {
      render(
        <QuestionResults results={mockResults} passage={mockPassage} onSaveHistory={vi.fn()} />
      );

      const incorrectResult = screen.getByTestId('result-q2');
      expect(incorrectResult).toHaveTextContent('あなたの答え');
    });
  });

  describe('onSaveHistory callback', () => {
    it('calls onSaveHistory when complete button is clicked', () => {
      const onSaveHistory = vi.fn();

      render(
        <QuestionResults
          results={mockResults}
          passage={mockPassage}
          onSaveHistory={onSaveHistory}
        />
      );

      const completeButton = screen.getByTestId('new-passage-button');
      fireEvent.click(completeButton);

      expect(onSaveHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('props validation', () => {
    it('renders with all correct answers', () => {
      const allCorrectResults: QuestionResult[] = [
        { ...mockResults[0], isCorrect: true },
        { ...mockResults[1], isCorrect: true, userAnswer: true },
      ];

      render(
        <QuestionResults
          results={allCorrectResults}
          passage={mockPassage}
          onSaveHistory={vi.fn()}
        />
      );

      expect(screen.getByTestId('results-percentage')).toHaveTextContent('100%');
    });

    it('renders with all incorrect answers', () => {
      const allIncorrectResults: QuestionResult[] = [
        { ...mockResults[0], isCorrect: false, userAnswer: 1 },
        { ...mockResults[1], isCorrect: false },
      ];

      render(
        <QuestionResults
          results={allIncorrectResults}
          passage={mockPassage}
          onSaveHistory={vi.fn()}
        />
      );

      expect(screen.getByTestId('results-percentage')).toHaveTextContent('0%');
    });
  });

  describe('edge cases', () => {
    it('renders with empty results array', () => {
      render(<QuestionResults results={[]} passage={mockPassage} onSaveHistory={vi.fn()} />);

      expect(screen.getByTestId('results-score')).toHaveTextContent('0 / 0 正解');
      expect(screen.getByTestId('results-percentage')).toHaveTextContent('0%');
    });
  });
});
