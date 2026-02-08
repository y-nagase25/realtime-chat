import { useState, useCallback } from 'react';
import type { VocabularyEntry } from '@/lib/types/reading';
import { apiPost } from '@/lib/api-client';
import { useLocalStorage, SAVED_VOCABULARY_STORAGE_KEY } from './use-local-storage';
import type { SavedVocabulary } from '@/lib/types/local-storage';
import type { ApiResponse } from '@/lib/types/api';
import { RateLimitError } from '@/lib/errors';
import { useToast } from '@/lib/hooks/use-toast';
import { EXCEEDED_USAGE_LIMIT_MSG } from '@/lib/constants';

type VocabPopupState = {
  word: string;
  entry: VocabularyEntry | null;
  isLoading: boolean;
  position: { x: number; y: number };
  error: string | null;
  context: string;
};

type UseVocabPopupReturn = {
  vocabPopup: VocabPopupState | null;
  isSaved: boolean;
  handleWordClick: (word: string, context: string) => Promise<void>;
  handleRetry: () => void;
  handleSave: () => void;
  handleClose: () => void;
};

/**
 * Custom hook for managing vocabulary popup state and interactions
 *
 * Handles:
 * - Fetching word definitions from API
 * - Managing popup position and visibility
 * - Saving vocabulary to history
 * - Error handling and retry logic
 */
export function useVocabPopup(): UseVocabPopupReturn {
  const [vocabPopup, setVocabPopup] = useState<VocabPopupState | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { add: addVocabularyHistory } = useLocalStorage<SavedVocabulary>(
    SAVED_VOCABULARY_STORAGE_KEY
  );
  const { showToast: showExceededUsageLimitToast } = useToast(EXCEEDED_USAGE_LIMIT_MSG, 'warning');

  const handleWordClick = useCallback(
    async (word: string, context: string) => {
      setIsSaved(false);
      const wordElement = document.querySelector(`[data-testid="word-${word.toLowerCase()}"]`);
      const rect = wordElement?.getBoundingClientRect();
      const position = rect ? { x: rect.left, y: rect.bottom } : { x: 100, y: 100 };

      setVocabPopup({
        word,
        entry: null,
        isLoading: true,
        position,
        error: null,
        context,
      });

      try {
        const data = await apiPost<ApiResponse<VocabularyEntry>>('/api/reading/vocabulary', {
          word,
          context,
        });

        if (data.success) {
          setVocabPopup((prev) => (prev ? { ...prev, entry: data.data, isLoading: false } : null));
        } else {
          setVocabPopup((prev) =>
            prev
              ? { ...prev, isLoading: false, error: data.error || '単語の検索に失敗しました' }
              : null
          );
        }
      } catch (err) {
        if (err instanceof RateLimitError) {
          showExceededUsageLimitToast();
        }

        setVocabPopup((prev) =>
          prev ? { ...prev, isLoading: false, error: '単語の検索に失敗しました' } : null
        );
      }
    },
    [showExceededUsageLimitToast]
  );

  const handleRetry = useCallback(() => {
    if (vocabPopup) {
      handleWordClick(vocabPopup.word, vocabPopup.context);
    }
  }, [vocabPopup, handleWordClick]);

  const handleSave = useCallback(() => {
    if (vocabPopup?.entry) {
      addVocabularyHistory(vocabPopup.entry);
      setIsSaved(true);
    }
  }, [vocabPopup, addVocabularyHistory]);

  const handleClose = useCallback(() => {
    setVocabPopup(null);
  }, []);

  return {
    vocabPopup,
    isSaved,
    handleWordClick,
    handleRetry,
    handleSave,
    handleClose,
  };
}
