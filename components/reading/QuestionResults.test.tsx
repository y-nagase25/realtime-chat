import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionResults } from '@/components/reading/QuestionResults';
import type { ComprehensionQuestion, QuestionResult } from '@/lib/types/reading';

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

  const renderComponent = (
    results: QuestionResult[] = mockResults,
    handleReset: () => void = vi.fn()
  ) => {
    render(<QuestionResults results={results} handleReset={handleReset} />);
  };

  describe('basic rendering', () => {
    it('renders results title', () => {
      renderComponent();

      expect(screen.getByTestId('results-title')).toHaveTextContent('結果');
    });

    it('renders score correctly', () => {
      renderComponent();

      expect(screen.getByTestId('results-score')).toHaveTextContent('1 / 2 正解');
    });

    it('renders percentage correctly', () => {
      renderComponent();

      expect(screen.getByTestId('results-percentage')).toHaveTextContent('50%');
    });

    it('renders complete button', () => {
      renderComponent();

      expect(screen.getByTestId('new-passage-button')).toHaveTextContent('完了');
    });
  });

  describe('result display', () => {
    it('renders correct answer indicator for correct answers', () => {
      renderComponent();

      const correctResult = screen.getByTestId('result-q1');
      expect(correctResult).toHaveTextContent('正解');
    });

    it('renders incorrect answer indicator for wrong answers', () => {
      renderComponent();

      const incorrectResult = screen.getByTestId('result-q2');
      expect(incorrectResult).toHaveTextContent('不正解');
    });

    it('shows user answer for incorrect questions', () => {
      renderComponent();

      const incorrectResult = screen.getByTestId('result-q2');
      expect(incorrectResult).toHaveTextContent('あなたの答え');
    });
  });

  describe('handleReset callback', () => {
    it('calls handleReset when complete button is clicked', async () => {
      const handleReset = vi.fn();

      renderComponent(mockResults, handleReset);

      const user = userEvent.setup();
      await user.click(screen.getByTestId('new-passage-button'));

      expect(handleReset).toHaveBeenCalled();
    });
  });

  describe('props validation', () => {
    it('renders with all correct answers', () => {
      const allCorrectResults: QuestionResult[] = [
        { ...mockResults[0], isCorrect: true },
        { ...mockResults[1], isCorrect: true, userAnswer: true },
      ];

      renderComponent(allCorrectResults);

      expect(screen.getByTestId('results-percentage')).toHaveTextContent('100%');
    });

    it('renders with all incorrect answers', () => {
      const allIncorrectResults: QuestionResult[] = [
        { ...mockResults[0], isCorrect: false, userAnswer: 1 },
        { ...mockResults[1], isCorrect: false },
      ];

      renderComponent(allIncorrectResults);

      expect(screen.getByTestId('results-percentage')).toHaveTextContent('0%');
    });
  });

  describe('edge cases', () => {
    it('renders with empty results array', () => {
      renderComponent([]);

      expect(screen.getByTestId('results-score')).toHaveTextContent('0 / 0 正解');
      expect(screen.getByTestId('results-percentage')).toHaveTextContent('0%');
    });
  });
});
