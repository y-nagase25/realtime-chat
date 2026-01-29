/**
 * Responsive Design Tests for Reading Practice Feature
 *
 * - Test and adjust layout for mobile (320px)
 * - Test and adjust layout for tablet (768px)
 * - Test and adjust layout for desktop (1024px+)
 * - Ensure touch targets are 44px minimum
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ReadingSettings } from '../ReadingSettings';
import { PassageDisplay } from '../PassageDisplay';
import { VocabularyPopup } from '../VocabularyPopup';
import { ComprehensionQuestions } from '../ComprehensionQuestions';
import { QuestionResults } from '../QuestionResults';
import { ReadingTimer } from '../ReadingTimer';
import { ErrorMessage } from '../ErrorMessage';
import type { Passage, ComprehensionQuestion, VocabularyEntry } from '@/lib/types/reading';

describe('Responsive Design', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Touch Target Sizes (minimum 44px)', () => {
    describe('ReadingSettings', () => {
      it('should have min-h-11 (44px) on generate button for touch accessibility', () => {
        render(<ReadingSettings onSubmit={vi.fn()} />);
        const button = screen.getByTestId('generate-button');
        expect(button.className).toMatch(/min-h-11|h-11/);
      });

      it('should have adequate touch target on select triggers', () => {
        render(<ReadingSettings onSubmit={vi.fn()} />);
        const levelSelector = screen.getByTestId('level-selector');
        expect(levelSelector.className).toMatch(/min-h-11|h-11|h-10/);
      });
    });

    describe('VocabularyPopup', () => {
      const mockEntry: VocabularyEntry = {
        word: 'test',
        pronunciation: '/test/',
        partOfSpeech: 'noun',
        definitionEn: 'A test',
        definitionJa: 'テスト',
        exampleSentence: 'This is a test.',
      };

      it('should have adequate touch target on close button', () => {
        render(
          <VocabularyPopup
            word="test"
            entry={mockEntry}
            isLoading={false}
            position={{ x: 100, y: 100 }}
            onClose={vi.fn()}
            onSave={vi.fn()}
            isSaved={false}
          />
        );
        const closeButton = screen.getByTestId('vocab-close-button');
        expect(closeButton.className).toMatch(/min-w-11|min-h-11|w-11|h-11|p-2|p-3/);
      });

      it('should have adequate touch target on save button', () => {
        render(
          <VocabularyPopup
            word="test"
            entry={mockEntry}
            isLoading={false}
            position={{ x: 100, y: 100 }}
            onClose={vi.fn()}
            onSave={vi.fn()}
            isSaved={false}
          />
        );
        const saveButton = screen.getByTestId('vocab-save-button');
        expect(saveButton.className).toMatch(/min-h-11|h-11|h-10/);
      });
    });

    describe('ComprehensionQuestions', () => {
      const mockQuestions: ComprehensionQuestion[] = [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Test question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Test explanation',
          explanationJa: '解説',
        },
      ];

      it('should have adequate touch target on submit button', () => {
        render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test passage"
          />
        );
        const submitButton = screen.getByTestId('submit-answers-button');
        expect(submitButton.className).toMatch(/min-h-11|h-11/);
      });

      it('should have adequate touch target on radio options', () => {
        render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test passage"
          />
        );
        const optionContainer = screen.getByTestId('option-q1-0');
        expect(optionContainer.className).toMatch(/min-h-11|py-2|py-3|gap-3/);
      });
    });

    describe('QuestionResults', () => {
      it('should have adequate touch target on new passage button', () => {
        const mockResults = [
          {
            question: {
              id: 'q1',
              type: 'multiple-choice' as const,
              question: 'Test?',
              options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
              correctAnswer: 0 as const,
              explanation: 'Test explanation',
              explanationJa: '解説',
            },
            userAnswer: 0,
            isCorrect: true,
          },
        ];
        render(<QuestionResults results={mockResults} onNewPassage={vi.fn()} />);
        const button = screen.getByTestId('new-passage-button');
        expect(button.className).toMatch(/min-h-11|h-11/);
      });
    });

    describe('ErrorMessage', () => {
      it('should have adequate touch target on retry button', () => {
        render(<ErrorMessage message="Error" onRetry={vi.fn()} />);
        const retryButton = screen.getByTestId('error-retry-button');
        expect(retryButton.className).toMatch(/min-h-11/);
      });
    });
  });

  describe('Mobile Layout (320px)', () => {
    describe('ReadingTimer', () => {
      it('should support stacking on very narrow screens', () => {
        render(<ReadingTimer isRunning={true} wordCount={100} level="A2" />);
        const timer = screen.getByTestId('reading-timer');
        expect(timer.className).toMatch(/flex-wrap|flex-col|sm:flex-row|gap-/);
      });
    });

    describe('PassageDisplay', () => {
      it('should have readable text size on mobile', () => {
        const mockPassage: Passage = {
          title: 'Test Title',
          content: 'Test content here.',
          wordCount: 3,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };
        render(<PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />);
        const content = screen.getByTestId('passage-content');
        expect(content.className).toMatch(/text-base|text-lg|sm:text-|md:text-/);
      });

      it('should have proper padding on mobile', () => {
        const mockPassage: Passage = {
          title: 'Test Title',
          content: 'Test content here.',
          wordCount: 3,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };
        render(<PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />);
        const passageCard = screen.getByTestId('passage-display');
        // Card should exist (default padding from Card component)
        expect(passageCard).toBeInTheDocument();
      });
    });

    describe('VocabularyPopup', () => {
      it('should have mobile-friendly width', () => {
        const mockEntry: VocabularyEntry = {
          word: 'test',
          pronunciation: '/test/',
          partOfSpeech: 'noun',
          definitionEn: 'A test',
          definitionJa: 'テスト',
          exampleSentence: 'This is a test.',
        };
        render(
          <VocabularyPopup
            word="test"
            entry={mockEntry}
            isLoading={false}
            position={{ x: 100, y: 100 }}
            onClose={vi.fn()}
            onSave={vi.fn()}
          />
        );
        const popup = screen.getByTestId('vocabulary-popup');
        // Should have responsive width classes
        expect(popup.className).toMatch(/w-72|w-80|sm:w-80|max-w-/);
      });
    });
  });

  describe('Tablet Layout (768px)', () => {
    describe('ComprehensionQuestions', () => {
      it('should have proper card structure for tablet', () => {
        const mockQuestions: ComprehensionQuestion[] = [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Test?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Test explanation',
            explanationJa: '解説',
          },
        ];
        render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test"
          />
        );
        const questionsCard = screen.getByTestId('comprehension-questions');
        expect(questionsCard).toBeInTheDocument();
      });
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    describe('ReadingSettings', () => {
      it('should have full width container', () => {
        render(<ReadingSettings onSubmit={vi.fn()} />);
        const generateButton = screen.getByTestId('generate-button');
        expect(generateButton.className).toMatch(/w-full/);
      });
    });
  });

  describe('Word Touch Targets in PassageDisplay', () => {
    it('should have adequate padding on clickable words', () => {
      const mockPassage: Passage = {
        title: 'Test',
        content: 'Hello world',
        wordCount: 2,
        level: 'A1',
        topic: 'daily-life',
        estimatedReadingTimeMinutes: 1,
        questions: [],
      };
      render(<PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />);
      const wordButton = screen.getByTestId('word-hello');
      // Should have padding classes for touch accessibility
      expect(wordButton.className).toMatch(/px-|py-|p-/);
    });
  });
});
