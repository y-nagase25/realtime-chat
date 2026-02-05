import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassageDisplay } from './PassageDisplay';
import type { ComprehensionQuestion, Passage, QuestionResult } from '@/lib/types/reading';
import { useVocabPopup } from '@/lib/hooks/use-vocab-popup';

// Mock the hook
vi.mock('@/lib/hooks/use-vocab-popup');
const mockUseVocabPopup = vi.mocked(useVocabPopup);

// Mock ComprehensionQuestions to capture onSubmit prop
type OnSubmitFn = (answers: Record<string, string | number | boolean>) => void;
let capturedOnSubmit: OnSubmitFn | null = null;
vi.mock('./ComprehensionQuestions', () => ({
  ComprehensionQuestions: ({ onSubmit }: { onSubmit: OnSubmitFn }) => {
    capturedOnSubmit = onSubmit;
    return <div data-testid="mocked-comprehension-questions">Mocked Questions</div>;
  },
}));

describe('PassageDisplay', () => {
  const mockPassage: Passage = {
    title: 'Test Passage',
    content: 'This is a test passage.',
    wordCount: 5,
    estimatedReadingTimeMinutes: 1,
    level: 'A1',
    topic: 'daily-life',
    questions: [],
  };

  const mockQuestions: ComprehensionQuestion[] = [
    {
      id: '1',
      type: 'multiple-choice',
      question: 'What is the capital of France?',
      options: ['Paris', 'London', 'Berlin', 'Madrid'],
      correctAnswer: 0,
      explanation: 'Paris is the capital of France.',
      explanationJa: 'パリはフランスの首都です。',
    },
    {
      id: '2',
      type: 'true-false',
      question: 'The capital of France is Paris.',
      correctAnswer: true,
      explanation: 'The capital of France is Paris.',
      explanationJa: 'フランスの首都はパリです。',
    },
    {
      id: '3',
      type: 'fill-in-blank',
      question: 'The capital of France is ____.',
      correctAnswer: 'Paris',
      acceptableAnswers: ['Paris', 'paris', 'PARIS'],
      explanation: 'The capital of France is Paris.',
      explanationJa: 'フランスの首都はパリです。',
    },
  ];

  const mockHandleSubmitAnswers = vi.fn();
  const mockHandleWordClick = vi.fn();

  const renderComponent = () => {
    render(
      <PassageDisplay
        passage={mockPassage}
        questions={mockQuestions}
        handleSubmitAnswers={mockHandleSubmitAnswers}
      />
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseVocabPopup.mockReturnValue({
      vocabPopup: null,
      isSaved: false,
      handleWordClick: mockHandleWordClick,
      handleRetry: vi.fn(),
      handleSave: vi.fn(),
      handleClose: vi.fn(),
    });
    mockHandleWordClick.mockClear();
  });

  describe('default rendering', () => {
    it('renders correctly', () => {
      renderComponent();

      const heading = screen.getByTestId('passage-title');
      expect(heading).toHaveTextContent('Test Passage');

      const metadata = screen.getByTestId('passage-metadata');
      expect(metadata).toHaveTextContent('A1');
      expect(metadata).toHaveTextContent('5 words');
      expect(metadata).toHaveTextContent('約1分');
    });
  });

  describe('word interaction', () => {
    it('calls handleWordClick when a word is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByText('test'));

      expect(mockHandleWordClick).toHaveBeenCalledTimes(1);
      // "This is a test passage." is the context
      expect(mockHandleWordClick).toHaveBeenCalledWith(
        'test',
        expect.stringContaining('This is a test passage')
      );
    });
  });

  describe('answer submission', () => {
    it('processes answers and calls handleSubmitAnswers with results', async () => {
      renderComponent();

      // Verify that onSubmit was captured
      expect(capturedOnSubmit).toBeTruthy();

      // Simulate submitting answers
      const mockAnswers = {
        '1': 0, // Multiple choice - option 0
        '2': true, // True/false - true
        '3': 'Paris', // Fill-in-blank - "Paris"
      };

      // Call onSubmit directly (this is what ComprehensionQuestions would do)
      if (capturedOnSubmit) {
        capturedOnSubmit(mockAnswers);
      }

      // Verify handleSubmitAnswers was called with correct results
      expect(mockHandleSubmitAnswers).toHaveBeenCalledTimes(1);
      const results = mockHandleSubmitAnswers.mock.calls[0][0];

      // Should have 3 results (all non-summary questions)
      expect(results).toHaveLength(3);

      // Verify each result has the correct structure
      expect(results[0]).toEqual({
        question: mockQuestions[0],
        userAnswer: 0,
        isCorrect: true,
      });

      expect(results[1]).toEqual({
        question: mockQuestions[1],
        userAnswer: true,
        isCorrect: true,
      });

      expect(results[2]).toEqual({
        question: mockQuestions[2],
        userAnswer: 'Paris',
        isCorrect: true,
      });
    });

    it('filters out summary questions from results', () => {
      // Add a summary question to the questions array
      const questionsWithSummary: ComprehensionQuestion[] = [
        ...mockQuestions,
        {
          id: '4',
          type: 'summary',
          question: 'Summarize the passage',
          questionJa: 'この文章を要約してください',
          explanation: 'Summary explanation',
          explanationJa: '要約の説明',
        },
      ];

      render(
        <PassageDisplay
          passage={mockPassage}
          questions={questionsWithSummary}
          handleSubmitAnswers={mockHandleSubmitAnswers}
        />
      );

      // Verify that onSubmit was captured
      expect(capturedOnSubmit).toBeTruthy();

      // Simulate submitting answers (including a summary question answer that should be filtered)
      const mockAnswers = {
        '1': 0, // Multiple choice - option 0
        '2': true, // True/false - true
        '3': 'Paris', // Fill-in-blank - "Paris"
        '4': 'This is a summary', // Summary - should be filtered out
      };

      // Call onSubmit directly
      if (capturedOnSubmit) {
        capturedOnSubmit(mockAnswers);
      }

      // Verify that only 3 results are returned (summary question filtered out)
      expect(mockHandleSubmitAnswers).toHaveBeenCalledTimes(1);
      const results = mockHandleSubmitAnswers.mock.calls[0][0];
      expect(results).toHaveLength(3);

      // Verify no summary question in results
      expect(results.every((r: QuestionResult) => r.question.type !== 'summary')).toBe(true);
    });
  });
});
