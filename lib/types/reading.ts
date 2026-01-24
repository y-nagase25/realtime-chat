/**
 * Type definitions for the Reading Practice feature
 */

/**
 * CEFR difficulty levels (A1 = beginner to C1 = advanced)
 */
export type ReadingLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/**
 * Available reading topics with Japanese labels
 */
export type ReadingTopicId = 'daily-life' | 'business' | 'travel' | 'news' | 'science' | 'culture';

export type ReadingTopic = {
  id: ReadingTopicId;
  labelEn: string;
  labelJa: string;
};

/**
 * Grammar patterns for focused practice
 */
export type GrammarPatternId =
  | 'articles'
  | 'prepositions'
  | 'present-perfect'
  | 'relative-clauses'
  | 'passive-voice'
  | 'conditionals';

export type GrammarPattern = {
  id: GrammarPatternId;
  labelEn: string;
  labelJa: string;
  description: string;
};

/**
 * Generated reading passage
 */
export type Passage = {
  title: string;
  content: string;
  level: ReadingLevel;
  topic: ReadingTopicId;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
  grammarFocus?: GrammarPatternId;
  questions: ComprehensionQuestion[];
};

/**
 * Types of comprehension questions
 */
export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'summary';

/**
 * Base question interface
 */
export type BaseQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  explanation: string;
  explanationJa: string;
};

/**
 * Multiple choice question (4 options)
 */
export type MultipleChoiceQuestion = BaseQuestion & {
  type: 'multiple-choice';
  options: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
};

/**
 * True/False question
 */
export type TrueFalseQuestion = BaseQuestion & {
  type: 'true-false';
  correctAnswer: boolean;
};

/**
 * Fill-in-the-blank question
 */
export type FillInBlankQuestion = BaseQuestion & {
  type: 'fill-in-blank';
  correctAnswer: string;
  acceptableAnswers: string[];
};

/**
 * Summary question (optional, free-form text evaluated by AI)
 */
export type SummaryQuestion = BaseQuestion & {
  type: 'summary';
  questionJa: string;
  minLength?: number;
};

/**
 * Union type for all question types
 */
export type ComprehensionQuestion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion
  | SummaryQuestion;

/**
 * Vocabulary entry with Japanese translation
 */
export type VocabularyEntry = {
  word: string;
  pronunciation?: string;
  partOfSpeech: string;
  definitionEn: string;
  definitionJa: string;
  exampleSentence: string;
};

/**
 * Vocabulary entry saved to local storage
 */
export type StoredVocabularyEntry = VocabularyEntry & {
  savedAt: number;
  context?: string;
};

/**
 * Reading session record for progress tracking
 */
export type ReadingSession = {
  id: string;
  timestamp: number;
  level: ReadingLevel;
  topic: ReadingTopicId;
  passageTitle: string;
  wordCount: number;
  readingTimeSeconds: number;
  wordsPerMinute: number;
  questionsTotal: number;
  questionsCorrect: number;
  scorePercentage: number;
  savedWords: string[];
};

/**
 * API Request/Response types
 */

// Passage Generation
export type GeneratePassageRequest = {
  level: ReadingLevel;
  topic: ReadingTopicId;
  grammarFocus?: GrammarPatternId;
};

export type GeneratePassageResponse = {
  success: true;
  data: Passage;
};

// Vocabulary Lookup
export type VocabularyLookupRequest = {
  word: string;
  context?: string;
};

export type VocabularyLookupResponse = {
  success: true;
  data: VocabularyEntry;
};

// Summary Evaluation
export type EvaluateSummaryRequest = {
  passage: string;
  userSummary: string;
};

export type SummaryFeedback = {
  keyPointsCaptured: string[];
  keyPointsMissed: string[];
  grammarFeedbackJa: string;
  vocabularyFeedbackJa: string;
  overallFeedbackJa: string;
  modelSummary: string;
  score: number;
};

export type EvaluateSummaryResponse = {
  success: true;
  data: SummaryFeedback;
};

// Error response
export type ApiErrorResponse = {
  success: false;
  error: string;
};
