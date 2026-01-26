'use client';

import { useCallback, useEffect, useState } from 'react';

export const SPEAKING_ATTEMPTS_STORAGE_KEY = 'speaking-attempts';
export const READING_HISTORY_STORAGE_KEY = 'reading-practice-history';
export const MAX_HISTORY_SIZE = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Custom hook for local storage
 * @param key Storage key
 * @returns
 * @example
 * const { history, add, remove } = useLocalStorage<SpeakingAttempt>(SPEAKING_ATTEMPTS_STORAGE_KEY);
 */
export function useLocalStorage<T>(key: string) {
  const [history, setHistory] = useState<T[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setHistory(JSON.parse(raw) as T[]);
      }
    } catch {
      // ignore
    }
  }, [key]);

  const add = useCallback(
    (value: Omit<T, 'id' | 'timestamp'>) => {
      const newValue = {
        ...value,
        id: generateId(),
        timestamp: Date.now(),
      } as T;

      // Use functional update to ensure we have the latest state
      setHistory((prev) => {
        const updated = [newValue, ...prev].slice(0, MAX_HISTORY_SIZE);
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
      });

      return newValue;
    },
    [key]
  );

  const remove = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((value) => value.id !== id);
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
      });
    },
    [key]
  );

  return { history, add, remove };
}
