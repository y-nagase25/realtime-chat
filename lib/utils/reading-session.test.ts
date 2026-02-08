/**
 * Tests for reading session utility functions
 * Following TDD: Write tests FIRST, then implement
 */

import { describe, it, expect } from 'vitest';
import { buildSessionData } from '@/lib/utils/reading-session';
import type { Passage, MultipleChoiceQuestion, TrueFalseQuestion } from '@/lib/types/reading';
import type { QuestionResult } from '@/components/reading/QuestionResults';

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

    const sessionData = buildSessionData(mockPassage, results);

    expect(sessionData).toEqual({
      level: 'B1',
      topic: 'daily-life',
      passageTitle: 'Test Passage Title',
      wordCount: 250,
      questionsTotal: 2,
      questionsCorrect: 2,
      scorePercentage: 100,
    });
  });

  it('builds session data with mixed correct/incorrect answers', () => {
    const results: QuestionResult[] = [
      { question: mockMultipleChoiceQuestion, userAnswer: 0, isCorrect: true },
      { question: mockTrueFalseQuestion, userAnswer: false, isCorrect: false },
    ];

    const sessionData = buildSessionData(mockPassage, results);

    expect(sessionData.questionsTotal).toBe(2);
    expect(sessionData.questionsCorrect).toBe(1);
    expect(sessionData.scorePercentage).toBe(50);
  });

  it('builds session data with all incorrect answers', () => {
    const results: QuestionResult[] = [
      { question: mockMultipleChoiceQuestion, userAnswer: 1, isCorrect: false },
      { question: mockTrueFalseQuestion, userAnswer: false, isCorrect: false },
    ];

    const sessionData = buildSessionData(mockPassage, results);

    expect(sessionData.questionsCorrect).toBe(0);
    expect(sessionData.scorePercentage).toBe(0);
  });

  it('handles empty results array', () => {
    const sessionData = buildSessionData(mockPassage, []);

    expect(sessionData.questionsTotal).toBe(0);
    expect(sessionData.questionsCorrect).toBe(0);
    expect(sessionData.scorePercentage).toBe(0);
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
    const sessionData = buildSessionData(mockPassage, results);

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

    const sessionData = buildSessionData(passageWithGrammar, []);

    expect(sessionData.level).toBe('C1');
    expect(sessionData.topic).toBe('science');
    expect(sessionData.passageTitle).toBe('Advanced Science Topic');
    expect(sessionData.wordCount).toBe(500);
  });
});
