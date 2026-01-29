import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import ReadingPage from './page';

vi.mock('@/lib/api-client', () => ({
  apiPost: vi.fn(),
}));

vi.mock('@/components/reading/SessionStats', () => ({
  SessionStats: () => <div data-testid="session-stats" />,
}));

import { apiPost } from '@/lib/api-client';
const mockApiPost = vi.mocked(apiPost);

describe('ReadingPage - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Passage Generation Errors', () => {
    it('should display ErrorMessage component when passage generation fails', async () => {
      mockApiPost.mockRejectedValueOnce(new Error('文章の生成に失敗しました'));

      render(<ReadingPage />);

      fireEvent.click(screen.getByTestId('generate-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      expect(screen.getByText('文章の生成に失敗しました')).toBeInTheDocument();
    });

    it('should display retry button for passage generation errors', async () => {
      mockApiPost.mockRejectedValueOnce(new Error('文章の生成に失敗しました'));

      render(<ReadingPage />);

      fireEvent.click(screen.getByTestId('generate-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-retry-button')).toBeInTheDocument();
      });
    });

    it('should retry passage generation when retry button is clicked', async () => {
      mockApiPost
        .mockRejectedValueOnce(new Error('文章の生成に失敗しました'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            title: 'Test',
            content: 'Test content',
            wordCount: 10,
            level: 'A1',
            topic: 'daily-life',
            questions: [],
          },
        });

      render(<ReadingPage />);

      fireEvent.click(screen.getByTestId('generate-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-retry-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('error-retry-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });

    it('should display error message in Japanese', async () => {
      mockApiPost.mockRejectedValueOnce(new Error('ネットワークエラーが発生しました'));

      render(<ReadingPage />);

      fireEvent.click(screen.getByTestId('generate-button'));

      await waitFor(() => {
        expect(screen.getByText('ネットワークエラーが発生しました')).toBeInTheDocument();
      });
    });
  });
});
