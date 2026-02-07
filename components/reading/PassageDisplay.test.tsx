import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassageDisplay } from './PassageDisplay';
import type { Passage } from '@/lib/types/reading';
import { useVocabPopup } from '@/lib/hooks/use-vocab-popup';
import { mockQuestions } from '@/__test__/data/input';

// Mock the hook
vi.mock('@/lib/hooks/use-vocab-popup');
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
});
