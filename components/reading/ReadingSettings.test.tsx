import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReadingSettings } from './ReadingSettings';
import { READING_LEVELS, READING_TOPICS } from '@/lib/constants/reading';
import { apiPost } from '@/lib/api-client';
import { RateLimitError } from '@/lib/errors';
import type { Passage } from '@/lib/types/reading';

// Mock apiPost
vi.mock('@/lib/api-client', () => ({
  apiPost: vi.fn(),
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('@/lib/hooks/use-toast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock PassageSkeleton to easily verify its presence
vi.mock('./PassageSkeleton', () => ({
  PassageSkeleton: () => <div data-testid="passage-skeleton">Skeleton Loading...</div>,
}));

// Mock ErrorMessage component (optional, but good for isolation)
vi.mock('./ErrorMessage', () => ({
  ErrorMessage: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div data-testid="error-message">
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  ),
}));

describe('ReadingSettings', () => {
  const mockHandleStartReading = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(<ReadingSettings handleStartReading={mockHandleStartReading} />);
  };

  describe('default rendering', () => {
    it('renders with default values', () => {
      renderComponent();

      // Level: A2
      expect(screen.getByRole('combobox', { name: /難易度/ })).toHaveTextContent(
        READING_LEVELS.A2.labelJa
      );
      // Topic: Daily Life
      const defaultTopic = READING_TOPICS.find((t) => t.id === 'daily-life');
      expect(screen.getByRole('combobox', { name: /トピック/ })).toHaveTextContent(
        defaultTopic?.labelJa || ''
      );
      // Grammar: None
      expect(screen.getByRole('combobox', { name: /文法/ })).toHaveTextContent('選択なし');
    });
  });

  describe('passage generation (API calls)', () => {
    it('calls apiPost with correct parameters and transitions on success', async () => {
      const user = userEvent.setup();
      renderComponent();

      const mockPassage: Passage = {
        title: 'Test Passage',
        content: 'Test content',
        level: 'A2',
        topic: 'daily-life',
        wordCount: 100,
        estimatedReadingTimeMinutes: 2,
        questions: [],
      };

      (apiPost as any).mockResolvedValue({ success: true, data: mockPassage });

      // Click generate button
      await user.click(screen.getByRole('button', { name: '文章を生成' }));

      // Check loading state implied by disabled button or waitFor final state
      await waitFor(() => {
        expect(apiPost).toHaveBeenCalledWith('/api/reading/generate', {
          level: 'A2',
          topic: 'daily-life',
          grammarFocus: undefined,
        });
      });

      expect(mockHandleStartReading).toHaveBeenCalledWith(mockPassage);
    });

    it('shows loading skeleton while generating', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Create a promise that doesn't resolve immediately to simulate loading
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (apiPost as any).mockReturnValue(promise);

      await user.click(screen.getByRole('button', { name: '文章を生成' }));

      // Should show skeleton
      expect(screen.getByTestId('passage-skeleton')).toBeInTheDocument();
      // Should hide form
      expect(screen.queryByRole('button', { name: '文章を生成' })).not.toBeInTheDocument();

      // Resolve to clean up
      if (resolvePromise!) resolvePromise({ success: true, data: {} });
    });

    it('displays error message when API call fails with logic error', async () => {
      const user = userEvent.setup();
      renderComponent();

      (apiPost as any).mockResolvedValue({ success: false, error: 'Generation failed' });

      await user.click(screen.getByRole('button', { name: '文章を生成' }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(/失敗/i);
      });

      // Verify not moved to reading phase
      expect(mockHandleStartReading).not.toHaveBeenCalled();
    });

    it('displays default error message when API throws generic error', async () => {
      const user = userEvent.setup();
      renderComponent();

      (apiPost as any).mockRejectedValue(new Error('Network error'));

      await user.click(screen.getByRole('button', { name: '文章を生成' }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('文章の生成に失敗しました');
      });
    });

    it('handles RateLimitError specifically', async () => {
      const user = userEvent.setup();
      renderComponent();

      (apiPost as any).mockRejectedValue(new RateLimitError(60, 'Too many requests'));

      await user.click(screen.getByRole('button', { name: '文章を生成' }));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalled();
      });
    });

    it('allows retrying after error', async () => {
      const user = userEvent.setup();
      renderComponent();

      // First attempt fails
      (apiPost as any).mockRejectedValueOnce(new Error('Fail 1'));

      await user.click(screen.getByRole('button', { name: '文章を生成' }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Retry attempt succeeds
      const mockPassage = { title: 'Success' } as Passage;
      (apiPost as any).mockResolvedValue({ success: true, data: mockPassage });

      // Click retry button in ErrorMessage component
      await user.click(screen.getByRole('button', { name: 'Retry' }));

      await waitFor(() => {
        expect(mockHandleStartReading).toHaveBeenCalledWith(mockPassage);
      });
    });
  });
});
