import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVocabPopup } from '@/lib/hooks/use-vocab-popup';
import * as apiClient from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiPost: vi.fn(),
}));

vi.mock('@/lib/hooks/use-local-storage', () => ({
  useLocalStorage: () => ({
    items: [],
    add: vi.fn(),
    remove: vi.fn(),
  }),
  SAVED_VOCABULARY_STORAGE_KEY: 'saved-vocabulary',
}));

describe('useVocabPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document.querySelector
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state with null popup', () => {
      const { result } = renderHook(() => useVocabPopup());

      expect(result.current.vocabPopup).toBeNull();
      expect(result.current.isSaved).toBe(false);
    });
  });

  describe('handleWordClick', () => {
    it('should set loading state immediately', async () => {
      vi.mocked(apiClient.apiPost).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, data: mockEntry }), 100);
          })
      );

      const { result } = renderHook(() => useVocabPopup());

      act(() => {
        result.current.handleWordClick('test', 'This is a test sentence');
      });

      expect(result.current.vocabPopup).not.toBeNull();
      expect(result.current.vocabPopup?.word).toBe('test');
      expect(result.current.vocabPopup?.isLoading).toBe(true);
      expect(result.current.vocabPopup?.context).toBe('This is a test sentence');

      await waitFor(() => {
        expect(result.current.vocabPopup?.isLoading).toBe(false);
      });
    });

    it('should set entry on successful response', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('test', 'context');
      });

      expect(result.current.vocabPopup?.entry).toEqual(mockEntry);
      expect(result.current.vocabPopup?.isLoading).toBe(false);
      expect(result.current.vocabPopup?.error).toBeNull();
    });

    it('should set error on failed response', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: false,
        error: 'Word not found',
      });

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('unknown', 'context');
      });

      expect(result.current.vocabPopup?.entry).toBeNull();
      expect(result.current.vocabPopup?.isLoading).toBe(false);
      expect(result.current.vocabPopup?.error).toBe('Word not found');
    });

    it('should set default error message when response has no error', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('word', 'context');
      });

      expect(result.current.vocabPopup?.error).toBe('単語の検索に失敗しました');
    });

    it('should handle network errors', async () => {
      vi.mocked(apiClient.apiPost).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('word', 'context');
      });

      expect(result.current.vocabPopup?.error).toBe('単語の検索に失敗しました');
      expect(result.current.vocabPopup?.isLoading).toBe(false);
    });

    it('should use fallback position when element not found', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('word', 'context');
      });

      expect(result.current.vocabPopup?.position).toEqual({ x: 100, y: 100 });
    });

    it('should use element position when element found', async () => {
      const mockRect = { left: 200, bottom: 300 };
      vi.spyOn(document, 'querySelector').mockReturnValue({
        getBoundingClientRect: () => mockRect,
      } as Element);

      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('word', 'context');
      });

      expect(result.current.vocabPopup?.position).toEqual({ x: 200, y: 300 });
    });

    it('should reset isSaved when clicking a new word', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      const { result } = renderHook(() => useVocabPopup());

      // Click first word and save
      await act(async () => {
        await result.current.handleWordClick('first', 'context');
      });

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaved).toBe(true);

      // Click second word
      await act(async () => {
        await result.current.handleWordClick('second', 'context');
      });

      expect(result.current.isSaved).toBe(false);
    });
  });

  describe('handleRetry', () => {
    it('should re-fetch the current word', async () => {
      vi.mocked(apiClient.apiPost)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true, data: mockEntry });

      const { result } = renderHook(() => useVocabPopup());

      // First click fails
      await act(async () => {
        await result.current.handleWordClick('word', 'context sentence');
      });

      expect(result.current.vocabPopup?.error).toBe('単語の検索に失敗しました');

      // Retry succeeds
      await act(async () => {
        result.current.handleRetry();
      });

      await waitFor(() => {
        expect(result.current.vocabPopup?.entry).toEqual(mockEntry);
      });
    });

    it('should do nothing if no popup is open', () => {
      const { result } = renderHook(() => useVocabPopup());

      act(() => {
        result.current.handleRetry();
      });

      expect(apiClient.apiPost).not.toHaveBeenCalled();
    });
  });

  describe('handleSave', () => {
    it('should set isSaved to true when entry exists', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('word', 'context');
      });

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaved).toBe(true);
    });

    it('should not set isSaved when entry is null', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: false,
        error: 'Not found',
      });

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('word', 'context');
      });

      act(() => {
        result.current.handleSave();
      });

      expect(result.current.isSaved).toBe(false);
    });
  });

  describe('handleClose', () => {
    it('should set vocabPopup to null', async () => {
      vi.mocked(apiClient.apiPost).mockResolvedValue({
        success: true,
        data: mockEntry,
      });

      const { result } = renderHook(() => useVocabPopup());

      await act(async () => {
        await result.current.handleWordClick('word', 'context');
      });

      expect(result.current.vocabPopup).not.toBeNull();

      act(() => {
        result.current.handleClose();
      });

      expect(result.current.vocabPopup).toBeNull();
    });
  });
});

const mockEntry = {
  word: 'test',
  pronunciation: '/test/',
  partOfSpeech: 'noun',
  definitionEn: 'A procedure for testing',
  definitionJa: 'テスト',
  exampleSentence: 'This is a test.',
};
