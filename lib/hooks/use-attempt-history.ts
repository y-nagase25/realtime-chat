/**
 * Hook for managing speaking attempt history in local storage
 */

'use client';

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SpeakingAttempt } from '@/lib/types/speaking';
import { useLocalStorage } from './use-local-storage';
import { sanitizeLocalStorageData, validateSpeakingAttempt } from '@/lib/utils/validation';

const STORAGE_KEY = 'speaking_attempts';
const MAX_ATTEMPTS = 100; // Limit to prevent quota issues

export interface UseAttemptHistoryReturn {
  attempts: SpeakingAttempt[];
  addAttempt: (attempt: Omit<SpeakingAttempt, 'id' | 'created_at'>) => void;
  clearHistory: () => void;
  getQuestionAttempts: (questionId: number) => SpeakingAttempt[];
}

/**
 * Hook for managing speaking practice attempt history
 */
export function useAttemptHistory(): UseAttemptHistoryReturn {
  const [attempts, setAttempts, clearAttempts] = useLocalStorage<SpeakingAttempt[]>(
    STORAGE_KEY,
    []
  );

  // Sanitize attempts on load
  const sanitizedAttempts = sanitizeLocalStorageData(attempts);

  /**
   * Add a new attempt to history
   */
  const addAttempt = useCallback(
    (attempt: Omit<SpeakingAttempt, 'id' | 'created_at'>) => {
      const newAttempt: SpeakingAttempt = {
        ...attempt,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      };

      // Validate before adding
      try {
        validateSpeakingAttempt(newAttempt);
      } catch (error) {
        console.error('Invalid attempt:', error);
        return;
      }

      setAttempts((prev) => {
        const sanitized = sanitizeLocalStorageData(prev);
        const updated = [...sanitized, newAttempt];

        // Limit number of attempts
        if (updated.length > MAX_ATTEMPTS) {
          // Remove oldest attempts
          return updated.slice(updated.length - MAX_ATTEMPTS);
        }

        return updated;
      });
    },
    [setAttempts]
  );

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    clearAttempts();
  }, [clearAttempts]);

  /**
   * Get attempts for a specific question
   */
  const getQuestionAttempts = useCallback(
    (questionId: number): SpeakingAttempt[] => {
      return sanitizedAttempts
        .filter((attempt) => attempt.question_id === questionId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    [sanitizedAttempts]
  );

  return {
    attempts: sanitizedAttempts,
    addAttempt,
    clearHistory,
    getQuestionAttempts,
  };
}
