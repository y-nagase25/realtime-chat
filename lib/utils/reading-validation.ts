/**
 * Validation utilities for Reading Practice API
 */

import type {
  ReadingLevel,
  ReadingTopicId,
  GrammarPatternId,
  GeneratePassageRequest,
  VocabularyLookupRequest,
  EvaluateSummaryRequest,
} from '@/lib/types/reading';
import { READING_LEVEL_OPTIONS, READING_TOPICS, GRAMMAR_PATTERNS } from '@/lib/constants/reading';
import type { ValidationResult } from '@/lib/types/validation';

// Maximum input lengths to prevent DoS and excessive API costs
const MAX_PASSAGE_LENGTH = 10000;
const MAX_SUMMARY_LENGTH = 2000;
const MAX_WORD_LENGTH = 100;

/**
 * Check if a value is a valid ReadingLevel
 */
export function isValidReadingLevel(level: unknown): level is ReadingLevel {
  return typeof level === 'string' && READING_LEVEL_OPTIONS.includes(level as ReadingLevel);
}

/**
 * Check if a value is a valid ReadingTopicId
 */
export function isValidReadingTopic(topic: unknown): topic is ReadingTopicId {
  return (
    typeof topic === 'string' && READING_TOPICS.some((t) => t.id === (topic as ReadingTopicId))
  );
}

/**
 * Check if a value is a valid GrammarPatternId
 */
export function isValidGrammarPattern(pattern: unknown): pattern is GrammarPatternId {
  return (
    typeof pattern === 'string' &&
    GRAMMAR_PATTERNS.some((p) => p.id === (pattern as GrammarPatternId))
  );
}

/**
 * Validate GeneratePassageRequest
 */
export function validateGeneratePassageRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const { level, topic, grammarFocus } = body as Partial<GeneratePassageRequest>;

  if (!level) {
    return { valid: false, error: 'level is required' };
  }

  if (!isValidReadingLevel(level)) {
    return { valid: false, error: `Invalid level: ${level}. Must be one of: A1, A2, B1, B2, C1` };
  }

  if (!topic) {
    return { valid: false, error: 'topic is required' };
  }

  if (!isValidReadingTopic(topic)) {
    return {
      valid: false,
      error: `Invalid topic: ${topic}. Must be one of: daily-life, business, travel, news, science, culture`,
    };
  }

  if (grammarFocus !== undefined && !isValidGrammarPattern(grammarFocus)) {
    return {
      valid: false,
      error: `Invalid grammarFocus: ${grammarFocus}`,
    };
  }

  return { valid: true };
}

/**
 * Validate VocabularyLookupRequest
 */
export function validateVocabularyLookupRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const { word } = body as Partial<VocabularyLookupRequest>;

  if (!word || typeof word !== 'string' || word.trim().length === 0) {
    return { valid: false, error: 'word is required and must be a non-empty string' };
  }

  if (word.length > MAX_WORD_LENGTH) {
    return { valid: false, error: `word exceeds maximum length of ${MAX_WORD_LENGTH} characters` };
  }

  return { valid: true };
}

/**
 * Validate EvaluateSummaryRequest
 */
export function validateEvaluateSummaryRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const { passage, userSummary } = body as Partial<EvaluateSummaryRequest>;

  if (!passage || typeof passage !== 'string' || passage.trim().length === 0) {
    return { valid: false, error: 'passage is required and must be a non-empty string' };
  }

  if (passage.length > MAX_PASSAGE_LENGTH) {
    return {
      valid: false,
      error: `passage exceeds maximum length of ${MAX_PASSAGE_LENGTH} characters`,
    };
  }

  if (!userSummary || typeof userSummary !== 'string' || userSummary.trim().length === 0) {
    return { valid: false, error: 'userSummary is required and must be a non-empty string' };
  }

  if (userSummary.length > MAX_SUMMARY_LENGTH) {
    return {
      valid: false,
      error: `userSummary exceeds maximum length of ${MAX_SUMMARY_LENGTH} characters`,
    };
  }

  return { valid: true };
}
