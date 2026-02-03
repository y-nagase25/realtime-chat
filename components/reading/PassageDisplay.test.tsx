import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassageDisplay } from './PassageDisplay';
import type { ComprehensionQuestion, Passage } from '@/lib/types/reading';
import { useVocabPopup } from '@/lib/hooks/use-vocab-popup';

// Mock the hook
vi.mock('@/lib/hooks/use-vocab-popup', () => ({
  useVocabPopup: vi.fn(),
}));
const mockUseVocabPopup = vi.mocked(useVocabPopup);

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

  // describe('answer submission', () => {});
});
