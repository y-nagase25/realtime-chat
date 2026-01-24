import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSession,
  getSessionHistory,
  getSessionStats,
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_SIZE,
} from './reading-history';
import type { ReadingSession } from '@/lib/types/reading';

const mockSessionInput: Omit<ReadingSession, 'id' | 'timestamp'> = {
  level: 'B1',
  topic: 'daily-life',
  passageTitle: 'A Day at the Park',
  wordCount: 200,
  readingTimeSeconds: 120,
  wordsPerMinute: 100,
  questionsTotal: 5,
  questionsCorrect: 4,
  scorePercentage: 80,
  savedWords: ['ephemeral', 'ubiquitous'],
};

const mockSessionInput2: Omit<ReadingSession, 'id' | 'timestamp'> = {
  level: 'A2',
  topic: 'travel',
  passageTitle: 'Visiting Tokyo',
  wordCount: 150,
  readingTimeSeconds: 90,
  wordsPerMinute: 100,
  questionsTotal: 3,
  questionsCorrect: 3,
  scorePercentage: 100,
  savedWords: [],
};

describe('reading history storage', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
    });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-01T10:00:00Z'));
  });

  describe('saveSession', () => {
    it('should save a session with generated id and timestamp', () => {
      const result = saveSession(mockSessionInput);

      expect(result.id).toBeDefined();
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.timestamp).toBe(new Date('2025-06-01T10:00:00Z').getTime());
      expect(result.level).toBe('B1');
      expect(result.topic).toBe('daily-life');
      expect(result.passageTitle).toBe('A Day at the Park');
      expect(result.wordCount).toBe(200);
      expect(result.readingTimeSeconds).toBe(120);
      expect(result.wordsPerMinute).toBe(100);
      expect(result.questionsTotal).toBe(5);
      expect(result.questionsCorrect).toBe(4);
      expect(result.scorePercentage).toBe(80);
      expect(result.savedWords).toEqual(['ephemeral', 'ubiquitous']);
    });

    it('should persist session to localStorage', () => {
      saveSession(mockSessionInput);

      const stored = JSON.parse(mockStorage[HISTORY_STORAGE_KEY]);
      expect(stored).toHaveLength(1);
      expect(stored[0].passageTitle).toBe('A Day at the Park');
    });

    it('should prepend new sessions (most recent first)', () => {
      vi.setSystemTime(new Date('2025-06-01T10:00:00Z'));
      saveSession(mockSessionInput);

      vi.setSystemTime(new Date('2025-06-01T11:00:00Z'));
      saveSession(mockSessionInput2);

      const stored = JSON.parse(mockStorage[HISTORY_STORAGE_KEY]);
      expect(stored[0].passageTitle).toBe('Visiting Tokyo');
      expect(stored[1].passageTitle).toBe('A Day at the Park');
    });

    it('should generate unique ids for each session', () => {
      const result1 = saveSession(mockSessionInput);
      const result2 = saveSession(mockSessionInput2);

      expect(result1.id).not.toBe(result2.id);
    });

    it('should limit history to MAX_HISTORY_SIZE sessions', () => {
      // Fill storage with MAX_HISTORY_SIZE sessions
      const existingSessions: ReadingSession[] = Array.from(
        { length: MAX_HISTORY_SIZE },
        (_, i) => ({
          id: `session-${i}`,
          timestamp: Date.now() - (i + 1) * 60000,
          ...mockSessionInput,
        }),
      );
      mockStorage[HISTORY_STORAGE_KEY] = JSON.stringify(existingSessions);

      // Save one more - should evict the oldest
      saveSession(mockSessionInput2);

      const stored = JSON.parse(mockStorage[HISTORY_STORAGE_KEY]);
      expect(stored).toHaveLength(MAX_HISTORY_SIZE);
      expect(stored[0].passageTitle).toBe('Visiting Tokyo');
    });

    it('should drop the oldest session when limit exceeded', () => {
      const existingSessions: ReadingSession[] = Array.from(
        { length: MAX_HISTORY_SIZE },
        (_, i) => ({
          id: `session-${i}`,
          timestamp: Date.now() - (i + 1) * 60000,
          ...mockSessionInput,
          passageTitle: `Session ${i}`,
        }),
      );
      mockStorage[HISTORY_STORAGE_KEY] = JSON.stringify(existingSessions);

      saveSession(mockSessionInput2);

      const stored = JSON.parse(mockStorage[HISTORY_STORAGE_KEY]) as ReadingSession[];
      // The last item should be session-48 (index MAX-2), not session-49 (the oldest)
      const lastItem = stored[stored.length - 1];
      expect(lastItem.id).toBe(`session-${MAX_HISTORY_SIZE - 2}`);
    });
  });

  describe('getSessionHistory', () => {
    it('should return empty array when no history exists', () => {
      const result = getSessionHistory();
      expect(result).toEqual([]);
    });

    it('should return all saved sessions', () => {
      saveSession(mockSessionInput);
      saveSession(mockSessionInput2);

      const result = getSessionHistory();
      expect(result).toHaveLength(2);
    });

    it('should return sessions in order (most recent first)', () => {
      vi.setSystemTime(new Date('2025-06-01T10:00:00Z'));
      saveSession(mockSessionInput);

      vi.setSystemTime(new Date('2025-06-01T11:00:00Z'));
      saveSession(mockSessionInput2);

      const result = getSessionHistory();
      expect(result[0].passageTitle).toBe('Visiting Tokyo');
      expect(result[1].passageTitle).toBe('A Day at the Park');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      mockStorage[HISTORY_STORAGE_KEY] = '{invalid json!!!';

      const result = getSessionHistory();
      expect(result).toEqual([]);
    });
  });

  describe('getSessionStats', () => {
    it('should return zero count and null wpm values when no sessions exist', () => {
      const stats = getSessionStats();

      expect(stats.sessionCount).toBe(0);
      expect(stats.lastWpm).toBeNull();
      expect(stats.previousWpm).toBeNull();
      expect(stats.wpmChange).toBeNull();
    });

    it('should return session count', () => {
      saveSession(mockSessionInput);
      saveSession(mockSessionInput2);

      const stats = getSessionStats();

      expect(stats.sessionCount).toBe(2);
    });

    it('should return lastWpm from the most recent session', () => {
      saveSession({ ...mockSessionInput, wordsPerMinute: 80 });
      saveSession({ ...mockSessionInput2, wordsPerMinute: 120 });

      const stats = getSessionStats();

      expect(stats.lastWpm).toBe(120);
    });

    it('should return null wpmChange when only one session exists', () => {
      saveSession({ ...mockSessionInput, wordsPerMinute: 100 });

      const stats = getSessionStats();

      expect(stats.lastWpm).toBe(100);
      expect(stats.previousWpm).toBeNull();
      expect(stats.wpmChange).toBeNull();
    });

    it('should calculate positive wpmChange when speed improved', () => {
      // First session (older, will be at index 1)
      saveSession({ ...mockSessionInput, wordsPerMinute: 80 });
      // Second session (newer, will be at index 0)
      saveSession({ ...mockSessionInput2, wordsPerMinute: 100 });

      const stats = getSessionStats();

      expect(stats.lastWpm).toBe(100);
      expect(stats.previousWpm).toBe(80);
      expect(stats.wpmChange).toBe(20);
    });

    it('should calculate negative wpmChange when speed decreased', () => {
      saveSession({ ...mockSessionInput, wordsPerMinute: 120 });
      saveSession({ ...mockSessionInput2, wordsPerMinute: 90 });

      const stats = getSessionStats();

      expect(stats.lastWpm).toBe(90);
      expect(stats.previousWpm).toBe(120);
      expect(stats.wpmChange).toBe(-30);
    });

    it('should return zero wpmChange when speed unchanged', () => {
      saveSession({ ...mockSessionInput, wordsPerMinute: 100 });
      saveSession({ ...mockSessionInput2, wordsPerMinute: 100 });

      const stats = getSessionStats();

      expect(stats.wpmChange).toBe(0);
    });
  });
});
