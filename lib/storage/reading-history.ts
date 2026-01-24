import type { ReadingSession } from '@/lib/types/reading';

export const HISTORY_STORAGE_KEY = 'reading-practice-history';
export const MAX_HISTORY_SIZE = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function readStorage(): ReadingSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReadingSession[];
  } catch {
    return [];
  }
}

function writeStorage(sessions: ReadingSession[]): void {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessions));
}

export function saveSession(
  session: Omit<ReadingSession, 'id' | 'timestamp'>,
): ReadingSession {
  const existing = readStorage();

  const newSession: ReadingSession = {
    ...session,
    id: generateId(),
    timestamp: Date.now(),
  };

  const updated = [newSession, ...existing].slice(0, MAX_HISTORY_SIZE);
  writeStorage(updated);

  return newSession;
}

export function getSessionHistory(): ReadingSession[] {
  return readStorage();
}
