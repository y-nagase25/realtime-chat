/**
 * Tests for reading session utility functions
 * Following TDD: Write tests FIRST, then implement
 */

import { describe, it, expect } from 'vitest';
import { calculateWpm, buildSessionData } from '@/lib/utils/reading-session';
import type { Passage, MultipleChoiceQuestion, TrueFalseQuestion } from '@/lib/types/reading';
import type { QuestionResult } from '@/components/reading/QuestionResults';

describe('calculateWpm', () => {
  it('calculates WPM correctly for typical reading speed', () => {
    // 300 words in 120 seconds = 150 WPM
    expect(calculateWpm(300, 120)).toBe(150);
  });

  it('returns 0 when readingTimeSeconds is 0', () => {
    expect(calculateWpm(300, 0)).toBe(0);
  });

  it('returns 0 when readingTimeSeconds is negative', () => {
    expect(calculateWpm(300, -10)).toBe(0);
  });

  it('rounds WPM to the nearest integer', () => {
    // 200 words in 90 seconds = 133.33... WPM, should round to 133
    expect(calculateWpm(200, 90)).toBe(133);
  });

  it('handles very fast reading (high WPM)', () => {
    // 500 words in 60 seconds = 500 WPM
    expect(calculateWpm(500, 60)).toBe(500);
  });

  it('handles very slow reading (low WPM)', () => {
    // 50 words in 300 seconds = 10 WPM
    expect(calculateWpm(50, 300)).toBe(10);
  });

  it('returns 0 when wordCount is 0', () => {
    expect(calculateWpm(0, 120)).toBe(0);
  });
});

describe('buildSessionData', () => {
  const mockPassage: Passage = {
    title: 'Test Passage Title',
    content: 'This is a test passage content for reading practice.',
    level: 'B1',
    topic: 'daily-life',
    wordCount: 250,
    estimatedReadingTimeMinutes: 2,
    questions: [],
  };

  const mockMultipleChoiceQuestion: MultipleChoiceQuestion = {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is the main topic?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    explanation: 'The answer is A because...',
    explanationJa: '答えはAです。なぜなら...',
  };

  const mockTrueFalseQuestion: TrueFalseQuestion = {
    id: 'q2',
    type: 'true-false',
    question: 'Is this statement true?',
    correctAnswer: true,
    explanation: 'This is true because...',
    explanationJa: 'これは正しいです。なぜなら...',
  };

  it('builds session data with all correct answers', () => {
    const results: QuestionResult[] = [
      { question: mockMultipleChoiceQuestion, userAnswer: 0, isCorrect: true },
      { question: mockTrueFalseQuestion, userAnswer: true, isCorrect: true },
    ];

    const sessionData = buildSessionData(mockPassage, 120, results, ['vocabulary', 'words']);

    expect(sessionData).toEqual({
      level: 'B1',
      topic: 'daily-life',
      passageTitle: 'Test Passage Title',
      wordCount: 250,
      readingTimeSeconds: 120,
      wordsPerMinute: 125, // 250 words / 2 minutes
      questionsTotal: 2,
      questionsCorrect: 2,
      scorePercentage: 100,
      savedWords: ['vocabulary', 'words'],
    });
  });

  it('builds session data with mixed correct/incorrect answers', () => {
    const results: QuestionResult[] = [
      { question: mockMultipleChoiceQuestion, userAnswer: 0, isCorrect: true },
      { question: mockTrueFalseQuestion, userAnswer: false, isCorrect: false },
    ];

    const sessionData = buildSessionData(mockPassage, 180, results, []);

    expect(sessionData.questionsTotal).toBe(2);
    expect(sessionData.questionsCorrect).toBe(1);
    expect(sessionData.scorePercentage).toBe(50);
  });

  it('builds session data with all incorrect answers', () => {
    const results: QuestionResult[] = [
      { question: mockMultipleChoiceQuestion, userAnswer: 1, isCorrect: false },
      { question: mockTrueFalseQuestion, userAnswer: false, isCorrect: false },
    ];

    const sessionData = buildSessionData(mockPassage, 120, results, []);

    expect(sessionData.questionsCorrect).toBe(0);
    expect(sessionData.scorePercentage).toBe(0);
  });

  it('handles empty results array', () => {
    const sessionData = buildSessionData(mockPassage, 120, [], []);

    expect(sessionData.questionsTotal).toBe(0);
    expect(sessionData.questionsCorrect).toBe(0);
    expect(sessionData.scorePercentage).toBe(0);
  });

  it('removes duplicate saved words', () => {
    const results: QuestionResult[] = [
      { question: mockMultipleChoiceQuestion, userAnswer: 0, isCorrect: true },
    ];

    const sessionData = buildSessionData(mockPassage, 120, results, [
      'apple',
      'banana',
      'apple', // duplicate
      'cherry',
      'banana', // duplicate
    ]);

    expect(sessionData.savedWords).toEqual(['apple', 'banana', 'cherry']);
  });

  it('calculates WPM correctly based on passage word count and reading time', () => {
    const results: QuestionResult[] = [];

    // 250 words in 150 seconds = 100 WPM
    const sessionData = buildSessionData(mockPassage, 150, results, []);

    expect(sessionData.wordsPerMinute).toBe(100);
  });

  it('handles zero reading time gracefully', () => {
    const results: QuestionResult[] = [];

    const sessionData = buildSessionData(mockPassage, 0, results, []);

    expect(sessionData.wordsPerMinute).toBe(0);
    expect(sessionData.readingTimeSeconds).toBe(0);
  });

  it('rounds score percentage to integer', () => {
    const results: QuestionResult[] = [
      { question: mockMultipleChoiceQuestion, userAnswer: 0, isCorrect: true },
      { question: mockTrueFalseQuestion, userAnswer: false, isCorrect: false },
      {
        question: { ...mockMultipleChoiceQuestion, id: 'q3' },
        userAnswer: 0,
        isCorrect: true,
      },
    ];

    // 2 out of 3 = 66.67% -> should round to 67%
    const sessionData = buildSessionData(mockPassage, 120, results, []);

    expect(sessionData.scorePercentage).toBe(67);
  });

  it('preserves passage metadata correctly', () => {
    const passageWithGrammar: Passage = {
      ...mockPassage,
      level: 'C1',
      topic: 'science',
      title: 'Advanced Science Topic',
      wordCount: 500,
      grammarFocus: 'passive-voice',
    };

    const sessionData = buildSessionData(passageWithGrammar, 300, [], []);

    expect(sessionData.level).toBe('C1');
    expect(sessionData.topic).toBe('science');
    expect(sessionData.passageTitle).toBe('Advanced Science Topic');
    expect(sessionData.wordCount).toBe(500);
  });
});
