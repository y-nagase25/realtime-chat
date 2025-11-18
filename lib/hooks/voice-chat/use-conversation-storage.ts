'use client';

import { useState, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

const STORAGE_KEY = 'voice_chat_conversation';

export function useConversationStorage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Check if localStorage is available
  const isStorageAvailable = useCallback((): boolean => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Load messages from local storage
  const loadMessages = useCallback(() => {
    if (!isStorageAvailable()) {
      setStorageAvailable(false);
      console.warn('Local storage is not available. Conversation history will not persist.');
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed);
      }
    } catch (error) {
      console.error('Failed to load messages from local storage:', error);
      setStorageAvailable(false);
      // Fallback to in-memory storage - messages array is already initialized
    }
  }, [isStorageAvailable]);

  // Add a new message
  const addMessage = useCallback(
    (speaker: 'user' | 'assistant', text: string) => {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        speaker,
        text,
        timestamp: Date.now(),
      };

      setMessages((prev) => {
        const updated = [...prev, newMessage];

        // Try to save to local storage
        if (storageAvailable) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (error) {
            console.error('Failed to save message to local storage:', error);
            setStorageAvailable(false);
            // Continue with in-memory storage
          }
        }

        return updated;
      });
    },
    [storageAvailable]
  );

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);

    if (storageAvailable) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear messages from local storage:', error);
        // Still clear in-memory messages even if storage fails
      }
    }
  }, [storageAvailable]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    addMessage,
    clearMessages,
    loadMessages,
    storageAvailable,
  };
}
