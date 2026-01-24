import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveWord, getAllWords, removeWord, VOCABULARY_STORAGE_KEY } from './vocabulary';
import type { VocabularyEntry } from '@/lib/types/reading';

const mockEntry: VocabularyEntry = {
  word: 'ephemeral',
  pronunciation: '/ɪˈfɛmərəl/',
  partOfSpeech: 'adjective',
  definitionEn: 'lasting for a very short time',
  definitionJa: '一時的な、はかない',
  exampleSentence: 'The beauty of cherry blossoms is ephemeral.',
};

const mockEntry2: VocabularyEntry = {
  word: 'ubiquitous',
  pronunciation: '/juːˈbɪkwɪtəs/',
  partOfSpeech: 'adjective',
  definitionEn: 'present, appearing, or found everywhere',
  definitionJa: '至る所にある、遍在する',
  exampleSentence: 'Smartphones have become ubiquitous in modern life.',
};

describe('vocabulary storage', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
    });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  describe('saveWord', () => {
    it('should save a word to localStorage', () => {
      const result = saveWord(mockEntry);

      expect(result).toEqual({
        ...mockEntry,
        savedAt: new Date('2025-01-01T00:00:00Z').getTime(),
        context: undefined,
      });

      const stored = JSON.parse(mockStorage[VOCABULARY_STORAGE_KEY]);
      expect(stored).toHaveLength(1);
      expect(stored[0].word).toBe('ephemeral');
    });

    it('should save a word with context', () => {
      const context = 'The ephemeral nature of fame.';
      const result = saveWord(mockEntry, context);

      expect(result.context).toBe(context);
    });

    it('should not add duplicate words', () => {
      saveWord(mockEntry);
      saveWord(mockEntry);

      const stored = JSON.parse(mockStorage[VOCABULARY_STORAGE_KEY]);
      expect(stored).toHaveLength(1);
    });

    it('should save multiple different words', () => {
      saveWord(mockEntry);
      saveWord(mockEntry2);

      const stored = JSON.parse(mockStorage[VOCABULARY_STORAGE_KEY]);
      expect(stored).toHaveLength(2);
    });

    it('should prepend new words (most recent first)', () => {
      vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
      saveWord(mockEntry);

      vi.setSystemTime(new Date('2025-01-01T01:00:00Z'));
      saveWord(mockEntry2);

      const stored = JSON.parse(mockStorage[VOCABULARY_STORAGE_KEY]);
      expect(stored[0].word).toBe('ubiquitous');
      expect(stored[1].word).toBe('ephemeral');
    });
  });

  describe('getAllWords', () => {
    it('should return empty array when no words saved', () => {
      const result = getAllWords();

      expect(result).toEqual([]);
    });

    it('should return all saved words', () => {
      saveWord(mockEntry);
      saveWord(mockEntry2);

      const result = getAllWords();

      expect(result).toHaveLength(2);
    });

    it('should return words sorted by savedAt (most recent first)', () => {
      vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
      saveWord(mockEntry);

      vi.setSystemTime(new Date('2025-01-01T01:00:00Z'));
      saveWord(mockEntry2);

      const result = getAllWords();

      expect(result[0].word).toBe('ubiquitous');
      expect(result[1].word).toBe('ephemeral');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      mockStorage[VOCABULARY_STORAGE_KEY] = 'not valid json';

      const result = getAllWords();

      expect(result).toEqual([]);
    });
  });

  describe('removeWord', () => {
    it('should remove a word by its word string', () => {
      saveWord(mockEntry);
      saveWord(mockEntry2);

      removeWord('ephemeral');

      const result = getAllWords();
      expect(result).toHaveLength(1);
      expect(result[0].word).toBe('ubiquitous');
    });

    it('should do nothing if word does not exist', () => {
      saveWord(mockEntry);

      removeWord('nonexistent');

      const result = getAllWords();
      expect(result).toHaveLength(1);
    });

    it('should handle empty storage gracefully', () => {
      expect(() => removeWord('anything')).not.toThrow();
    });
  });
});
