import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSummaryEvaluation } from '@/lib/hooks/use-summary-evaluation';
import * as apiClient from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiPost: vi.fn(),
}));

describe('useSummaryEvaluation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state with empty values', () => {
      const { result } = renderHook(() => useSummaryEvaluation());

      expect(result.current.text).toBe('');
      expect(result.current.feedback).toBeNull();
      expect(result.current.isEvaluating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setText', () => {
    it('should update text state', () => {
      const { result } = renderHook(() => useSummaryEvaluation());

      act(() => {
        result.current.setText('Test summary');
      });

      expect(result.current.text).toBe('Test summary');
    });
  });

  describe('submitSummary', () => {
    it('should set isEvaluating to true during submission', async () => {
      vi.mocked(apiClient.apiPost).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, data: mockFeedback }), 100);
          })
      );

      const { result } = renderHook(() => useSummaryEvaluation());

      act(() => {
        result.current.setText('My summary');
      });

      act(() => {
        result.current.submitSummary('Test passage');
      });

      expect(result.current.isEvaluating).toBe(true);

      await waitFor(() => {
        expect(result.current.isEvaluating).toBe(false);
      });
    });

    it('should set feedback on successful response', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: mockFeedback,
      });

      const { result } = renderHook(() => useSummaryEvaluation());

      act(() => {
        result.current.setText('My summary');
      });

      await act(async () => {
        await result.current.submitSummary('Test passage');
      });

      expect(result.current.feedback).toEqual(mockFeedback);
      expect(result.current.error).toBeNull();
      expect(result.current.isEvaluating).toBe(false);
    });

    it('should set error on failed response', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: false,
        error: '要約の評価に失敗しました',
      });

      const { result } = renderHook(() => useSummaryEvaluation());

      act(() => {
        result.current.setText('My summary');
      });

      await act(async () => {
        await result.current.submitSummary('Test passage');
      });

      expect(result.current.feedback).toBeNull();
      expect(result.current.error).toBe('要約の評価に失敗しました');
      expect(result.current.isEvaluating).toBe(false);
    });

    it('should set default error message when response has no error', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useSummaryEvaluation());

      act(() => {
        result.current.setText('My summary');
      });

      await act(async () => {
        await result.current.submitSummary('Test passage');
      });

      expect(result.current.error).toBe('要約の評価に失敗しました');
    });

    it('should handle network errors', async () => {
      vi.mocked(apiClient.apiPost).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSummaryEvaluation());

      act(() => {
        result.current.setText('My summary');
      });

      await act(async () => {
        await result.current.submitSummary('Test passage');
      });

      expect(result.current.error).toBe('要約の評価に失敗しました');
      expect(result.current.isEvaluating).toBe(false);
    });

    it('should clear previous error on new submission', async () => {
      vi.mocked(apiClient.apiPost)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true, data: mockFeedback });

      const { result } = renderHook(() => useSummaryEvaluation());

      act(() => {
        result.current.setText('My summary');
      });

      // First submission fails
      await act(async () => {
        await result.current.submitSummary('Test passage');
      });

      expect(result.current.error).toBe('要約の評価に失敗しました');

      // Second submission succeeds
      await act(async () => {
        await result.current.submitSummary('Test passage');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.feedback).toEqual(mockFeedback);
    });

    it('should call API with trimmed summary text', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: mockFeedback,
      });

      const { result } = renderHook(() => useSummaryEvaluation());

      act(() => {
        result.current.setText('  My summary with spaces  ');
      });

      await act(async () => {
        await result.current.submitSummary('Test passage');
      });

      expect(apiClient.apiPost).toHaveBeenCalledWith('/api/reading/evaluate-summary', {
        passage: 'Test passage',
        userSummary: 'My summary with spaces',
      });
    });
  });
});

const mockFeedback = {
  score: 8,
  strengths: ['Good summary structure', 'Key points covered'],
  improvements: ['Could include more details'],
  modelSummary: 'The passage discusses...',
};
