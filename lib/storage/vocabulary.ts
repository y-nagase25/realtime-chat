import type { StoredVocabularyEntry, VocabularyEntry } from '@/lib/types/reading';

export const VOCABULARY_STORAGE_KEY = 'reading-practice-vocabulary';

function readStorage(): StoredVocabularyEntry[] {
  try {
    const raw = localStorage.getItem(VOCABULARY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredVocabularyEntry[];
  } catch {
    return [];
  }
}

function writeStorage(entries: StoredVocabularyEntry[]): void {
  localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(entries));
}

export function saveWord(entry: VocabularyEntry, context?: string): StoredVocabularyEntry {
  const existing = readStorage();
  const isDuplicate = existing.some((e) => e.word === entry.word);

  const storedEntry: StoredVocabularyEntry = {
    ...entry,
    savedAt: Date.now(),
    context,
  };

  if (!isDuplicate) {
    writeStorage([storedEntry, ...existing]);
  }

  return storedEntry;
}

export function getAllWords(): StoredVocabularyEntry[] {
  return readStorage();
}

export function removeWord(word: string): void {
  const existing = readStorage();
  const filtered = existing.filter((e) => e.word !== word);
  writeStorage(filtered);
}
