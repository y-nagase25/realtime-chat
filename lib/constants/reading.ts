/**
 * Constants and configuration for the Reading Practice feature
 */

import type {
  ReadingLevel,
  ReadingTopic,
  ReadingTopicId,
  GrammarPattern,
  GrammarPatternId,
} from '@/lib/types/reading';

/**
 * Reading level metadata including word count ranges and WPM targets
 */
export const READING_LEVELS: Record<
  ReadingLevel,
  {
    label: string;
    labelJa: string;
    wordCountMin: number;
    wordCountMax: number;
    targetWpmMin: number;
    targetWpmMax: number;
    description: string;
    descriptionJa: string;
  }
> = {
  A1: {
    label: 'A1 (Beginner)',
    labelJa: 'A1（初級）',
    wordCountMin: 150,
    wordCountMax: 200,
    targetWpmMin: 50,
    targetWpmMax: 80,
    description: 'Simple vocabulary and short sentences',
    descriptionJa: 'シンプルな語彙と短い文章',
  },
  A2: {
    label: 'A2 (Elementary)',
    labelJa: 'A2（初中級）',
    wordCountMin: 200,
    wordCountMax: 300,
    targetWpmMin: 80,
    targetWpmMax: 120,
    description: 'Basic vocabulary with common expressions',
    descriptionJa: '基本的な語彙と一般的な表現',
  },
  B1: {
    label: 'B1 (Intermediate)',
    labelJa: 'B1（中級）',
    wordCountMin: 250,
    wordCountMax: 350,
    targetWpmMin: 120,
    targetWpmMax: 180,
    description: 'Moderate vocabulary with varied sentence structures',
    descriptionJa: '適度な語彙と多様な文構造',
  },
  B2: {
    label: 'B2 (Upper Intermediate)',
    labelJa: 'B2（中上級）',
    wordCountMin: 300,
    wordCountMax: 450,
    targetWpmMin: 180,
    targetWpmMax: 250,
    description: 'Advanced vocabulary with complex sentences',
    descriptionJa: '高度な語彙と複雑な文章',
  },
  C1: {
    label: 'C1 (Advanced)',
    labelJa: 'C1（上級）',
    wordCountMin: 400,
    wordCountMax: 500,
    targetWpmMin: 250,
    targetWpmMax: 300,
    description: 'Sophisticated vocabulary with nuanced expressions',
    descriptionJa: '洗練された語彙と微妙なニュアンスの表現',
  },
};

/**
 * Available reading topics
 */
export const READING_TOPICS: ReadingTopic[] = [
  {
    id: 'daily-life',
    labelEn: 'Daily Life',
    labelJa: '日常生活',
  },
  {
    id: 'business',
    labelEn: 'Business',
    labelJa: 'ビジネス',
  },
  {
    id: 'travel',
    labelEn: 'Travel',
    labelJa: '旅行',
  },
  {
    id: 'news',
    labelEn: 'News & Current Events',
    labelJa: 'ニュース',
  },
  {
    id: 'science',
    labelEn: 'Science & Technology',
    labelJa: '科学技術',
  },
  {
    id: 'culture',
    labelEn: 'Culture & Entertainment',
    labelJa: '文化・エンタメ',
  },
];

/**
 * Get a topic by its ID
 */
export function getTopicById(id: ReadingTopicId): ReadingTopic | undefined {
  return READING_TOPICS.find((topic) => topic.id === id);
}

/**
 * Grammar patterns for focused practice
 */
export const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: 'articles',
    labelEn: 'Articles',
    labelJa: '冠詞',
    description: 'a/an/the usage patterns',
  },
  {
    id: 'prepositions',
    labelEn: 'Prepositions',
    labelJa: '前置詞',
    description: 'in/on/at/for/to usage',
  },
  {
    id: 'present-perfect',
    labelEn: 'Present Perfect vs Past Simple',
    labelJa: '現在完了形 vs 過去形',
    description: 'have done vs did usage',
  },
  {
    id: 'relative-clauses',
    labelEn: 'Relative Clauses',
    labelJa: '関係代名詞',
    description: 'who/which/that clauses',
  },
  {
    id: 'passive-voice',
    labelEn: 'Passive Voice',
    labelJa: '受動態',
    description: 'be + past participle constructions',
  },
  {
    id: 'conditionals',
    labelEn: 'Conditionals',
    labelJa: '条件文',
    description: 'if clauses and conditional sentences',
  },
];

/**
 * Get a grammar pattern by its ID
 */
export function getGrammarPatternById(id: GrammarPatternId): GrammarPattern | undefined {
  return GRAMMAR_PATTERNS.find((pattern) => pattern.id === id);
}

/**
 * All available reading levels as an array
 */
export const READING_LEVEL_OPTIONS: ReadingLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/**
 * Calculate estimated reading time in minutes based on word count and level
 */
export function calculateEstimatedReadingTime(wordCount: number, level: ReadingLevel): number {
  const levelConfig = READING_LEVELS[level];
  const averageWpm = (levelConfig.targetWpmMin + levelConfig.targetWpmMax) / 2;
  return Math.ceil(wordCount / averageWpm);
}

/**
 * Get the target word count range for a given level
 */
export function getWordCountRange(level: ReadingLevel): { min: number; max: number } {
  const levelConfig = READING_LEVELS[level];
  return {
    min: levelConfig.wordCountMin,
    max: levelConfig.wordCountMax,
  };
}

/**
 * Get the target WPM range for a given level
 */
export function getTargetWpmRange(level: ReadingLevel): { min: number; max: number } {
  const levelConfig = READING_LEVELS[level];
  return {
    min: levelConfig.targetWpmMin,
    max: levelConfig.targetWpmMax,
  };
}
