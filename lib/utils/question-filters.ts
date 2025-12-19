import type { Question } from '@/lib/types/db';

/**
 * Filter questions by search term (case-insensitive substring match on question text)
 */
export function filterBySearch(questions: Question[], searchTerm: string): Question[] {
  if (!searchTerm.trim()) return questions;

  const normalized = searchTerm.toLowerCase();
  return questions.filter((q) => q.question.toLowerCase().includes(normalized));
}

/**
 * Filter questions by difficulty level
 */
export function filterByDifficulty(questions: Question[], level: number | null): Question[] {
  if (level === null) return questions;
  return questions.filter((q) => q.level === level);
}

/**
 * Apply both search and difficulty filters to questions
 */
export function applyFilters(
  questions: Question[],
  searchTerm: string,
  level: number | null
): Question[] {
  let filtered = questions;
  filtered = filterByDifficulty(filtered, level);
  filtered = filterBySearch(filtered, searchTerm);
  return filtered;
}
