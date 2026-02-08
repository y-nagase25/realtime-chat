import { render, screen } from '@testing-library/react';
import { SummaryQuestionInput } from './SummaryQuestionInput';
import { mockSummaryQuestion } from '@/__test__/data/input';
import { useSummaryEvaluation } from '@/lib/hooks/use-summary-evaluation';
import type { SummaryFeedback } from '@/lib/types/reading';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/hooks/use-summary-evaluation');
const mockUseSummaryEvaluation = vi.mocked(useSummaryEvaluation);

describe('SummaryQuestionInput', () => {
  const setupMock = (overrides: Partial<ReturnType<typeof useSummaryEvaluation>> = {}) => {
    const defaults = {
      text: '',
      setText: vi.fn(),
      feedback: null,
      isEvaluating: false,
      error: null,
      submitSummary: vi.fn(),
    };
    mockUseSummaryEvaluation.mockReturnValue({ ...defaults, ...overrides });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMock();
  });

  const renderComponent = () => {
    render(
      <SummaryQuestionInput
        question={mockSummaryQuestion}
        passageContent="This is a test passage."
      />
    );
  };

  const mockSummaryFeedback: SummaryFeedback = {
    keyPointsCaptured: ['Point 1'],
    keyPointsMissed: ['Point 2'],
    grammarFeedbackJa: 'Good grammar',
    vocabularyFeedbackJa: 'Good vocab',
    overallFeedbackJa: 'Good overall',
    modelSummary: 'Model summary',
    score: 4,
  };

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByTestId('summary-question-input')).toBeInTheDocument();
  });

  it('button text is "送信" when not evaluating', () => {
    renderComponent();
    expect(screen.getByTestId('summary-submit-button')).toHaveTextContent('送信');
  });

  it('button text is "評価中..." when isEvaluating is true', () => {
    setupMock({
      text: 'some text',
      isEvaluating: true,
    });
    renderComponent();
    expect(screen.getByTestId('summary-submit-button')).toHaveTextContent('評価中...');
  });

  it('button text is "再送信" when feedback is present', () => {
    setupMock({
      text: 'some text',
      feedback: mockSummaryFeedback,
    });
    renderComponent();
    expect(screen.getByTestId('summary-submit-button')).toHaveTextContent('再送信');
  });

  it('submitSummary is called when button is clicked', async () => {
    const mockSubmitSummary = vi.fn();
    setupMock({
      text: 'some text',
      submitSummary: mockSubmitSummary,
    });
    renderComponent();
    const submitButton = screen.getByTestId('summary-submit-button');
    const user = userEvent.setup();

    await user.click(submitButton);
    expect(mockSubmitSummary).toHaveBeenCalled();
  });

  it('textarea onChange is called when text is changed', async () => {
    const mockSetText = vi.fn();
    setupMock({
      text: 'some text',
      setText: mockSetText,
    });
    renderComponent();
    const textarea = screen.getByTestId('summary-question-textarea');

    const user = userEvent.setup();
    await user.type(textarea, 'a');
    expect(mockSetText).toHaveBeenCalled();
  });

  it('renders error message when error is present', () => {
    setupMock({
      error: 'Test error message',
    });
    renderComponent();
    expect(screen.getByTestId('summary-error')).toHaveTextContent('Test error message');
  });
});
