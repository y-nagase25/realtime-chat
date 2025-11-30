/**
 * Generic local storage hook with JSON serialization
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = (value: T | ((val: T) => T)) => void;

// Custom event for local storage changes within the same window
const LOCAL_STORAGE_EVENT = 'local-storage-change';

interface LocalStorageEventDetail {
  key: string;
  newValue: string | null;
}

/**
 * Hook for managing local storage with automatic JSON serialization
 * @param key Storage key
 * @param initialValue Initial value if key doesn't exist
 * @returns [value, setValue, clearValue]
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== 'undefined') {
          const stringifiedValue = JSON.stringify(valueToStore);
          window.localStorage.setItem(key, stringifiedValue);

          // Dispatch custom event for same-window synchronization
          window.dispatchEvent(
            new CustomEvent<LocalStorageEventDetail>(LOCAL_STORAGE_EVENT, {
              detail: { key, newValue: stringifiedValue },
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Clear value from local storage
  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValue);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);

        // Dispatch custom event for same-window synchronization
        window.dispatchEvent(
          new CustomEvent<LocalStorageEventDetail>(LOCAL_STORAGE_EVENT, {
            detail: { key, newValue: null },
          })
        );
      }
    } catch (error) {
      console.error(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs/windows AND same window
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Handle changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    // Handle changes from the same window
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<LocalStorageEventDetail>;
      if (customEvent.detail.key === key) {
        if (customEvent.detail.newValue !== null) {
          try {
            setStoredValue(JSON.parse(customEvent.detail.newValue) as T);
          } catch (error) {
            console.error(`Error parsing custom event for key "${key}":`, error);
          }
        } else {
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(LOCAL_STORAGE_EVENT, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(LOCAL_STORAGE_EVENT, handleCustomEvent);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}
