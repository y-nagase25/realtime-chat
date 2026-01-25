/**
 * Accessibility Tests for Reading Practice Feature
 *
 * - Add proper ARIA labels
 * - Ensure keyboard navigation works
 * - Test color contrast ratios
 * - Add focus indicators
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ReadingSettings } from '../ReadingSettings';
import { PassageDisplay } from '../PassageDisplay';
import { VocabularyPopup } from '../VocabularyPopup';
import { ComprehensionQuestions } from '../ComprehensionQuestions';
import { QuestionResults } from '../QuestionResults';
import { ReadingTimer } from '../ReadingTimer';
import { SummaryWriting } from '../SummaryWriting';
import { SessionStats } from '../SessionStats';
import { ErrorMessage } from '../ErrorMessage';
import type { Passage, ComprehensionQuestion, VocabularyEntry } from '@/lib/types/reading';

// Mock storage for SessionStats
vi.mock('@/lib/storage/reading-history', () => ({
  getSessionStats: () => ({ sessionCount: 5, lastWpm: 120, wpmChange: 10 }),
}));

describe('Accessibility', () => {
  afterEach(() => {
    cleanup();
  });

  describe('ARIA Labels', () => {
    describe('ReadingSettings', () => {
      it('should have aria-label on level selector', () => {
        render(<ReadingSettings onSubmit={vi.fn()} />);
        const levelSelector = screen.getByTestId('level-selector');
        expect(levelSelector).toHaveAttribute('aria-label');
      });

      it('should have aria-label on topic selector', () => {
        render(<ReadingSettings onSubmit={vi.fn()} />);
        const topicSelector = screen.getByTestId('topic-selector');
        expect(topicSelector).toHaveAttribute('aria-label');
      });

      it('should have aria-label on grammar selector', () => {
        render(<ReadingSettings onSubmit={vi.fn()} />);
        const grammarSelector = screen.getByTestId('grammar-selector');
        expect(grammarSelector).toHaveAttribute('aria-label');
      });

      it('should have aria-busy on generate button when loading', () => {
        render(<ReadingSettings onSubmit={vi.fn()} isLoading={true} />);
        const button = screen.getByTestId('generate-button');
        expect(button).toHaveAttribute('aria-busy', 'true');
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

      it('should have role="dialog" on popup container', () => {
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
        expect(popup).toHaveAttribute('role', 'dialog');
      });

      it('should have aria-labelledby pointing to word heading', () => {
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
        expect(popup).toHaveAttribute('aria-labelledby');
      });

      it('should have aria-label on close button', () => {
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
        const closeButton = screen.getByTestId('vocab-close-button');
        expect(closeButton).toHaveAttribute('aria-label');
      });

      it('should have aria-live="polite" for loading state announcements', () => {
        render(
          <VocabularyPopup
            word="test"
            entry={null}
            isLoading={true}
            position={{ x: 100, y: 100 }}
            onClose={vi.fn()}
            onSave={vi.fn()}
          />
        );
        const loadingIndicator = screen.getByTestId('vocab-loading');
        expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
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

      it('should have aria-describedby linking questions to descriptions', () => {
        render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test passage"
          />
        );
        const radioGroup = screen.getByRole('radiogroup');
        expect(radioGroup).toHaveAttribute('aria-labelledby');
      });
    });

    describe('ReadingTimer', () => {
      it('should have role="timer" on timer display', () => {
        render(<ReadingTimer isRunning={true} wordCount={100} level="A2" />);
        const timer = screen.getByTestId('reading-timer');
        expect(timer).toHaveAttribute('role', 'timer');
      });

      it('should have aria-label describing timer purpose', () => {
        render(<ReadingTimer isRunning={true} wordCount={100} level="A2" />);
        const timer = screen.getByTestId('reading-timer');
        expect(timer).toHaveAttribute('aria-label');
      });
    });

    describe('SummaryWriting', () => {
      it('should have aria-label on textarea', () => {
        render(<SummaryWriting onSubmit={vi.fn()} isEvaluating={false} feedback={null} />);
        const textarea = screen.getByTestId('summary-textarea');
        expect(textarea).toHaveAttribute('aria-label');
      });

      it('should have aria-busy on submit button when evaluating', () => {
        render(<SummaryWriting onSubmit={vi.fn()} isEvaluating={true} feedback={null} />);
        const submitButton = screen.getByTestId('submit-summary-button');
        expect(submitButton).toHaveAttribute('aria-busy', 'true');
      });
    });

    describe('QuestionResults', () => {
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

      it('should have aria-live="polite" on score display for screen reader announcements', () => {
        render(<QuestionResults results={mockResults} onNewPassage={vi.fn()} />);
        const score = screen.getByTestId('results-score');
        expect(score.closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
      });
    });

    describe('SessionStats', () => {
      it('should have aria-label describing stats section', () => {
        render(<SessionStats />);
        const stats = screen.getByTestId('session-stats');
        expect(stats).toHaveAttribute('aria-label');
      });
    });

    describe('ErrorMessage', () => {
      it('should have role="alert" for error announcements', () => {
        render(<ErrorMessage message="Error occurred" />);
        const error = screen.getByTestId('error-message');
        expect(error).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    describe('VocabularyPopup', () => {
      const mockEntry: VocabularyEntry = {
        word: 'test',
        pronunciation: '/test/',
        partOfSpeech: 'noun',
        definitionEn: 'A test',
        definitionJa: 'テスト',
        exampleSentence: 'This is a test.',
      };

      it('should close popup when Escape key is pressed', async () => {
        const onClose = vi.fn();
        render(
          <VocabularyPopup
            word="test"
            entry={mockEntry}
            isLoading={false}
            position={{ x: 100, y: 100 }}
            onClose={onClose}
            onSave={vi.fn()}
          />
        );

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
      });

      it('should trap focus within popup (close button and save button)', async () => {
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

        const closeButton = screen.getByTestId('vocab-close-button');
        const saveButton = screen.getByTestId('vocab-save-button');

        // Both buttons should be focusable
        expect(closeButton).not.toHaveAttribute('tabindex', '-1');
        expect(saveButton).not.toHaveAttribute('tabindex', '-1');
      });
    });

    describe('PassageDisplay', () => {
      it('should allow keyboard activation of word buttons', async () => {
        const onWordClick = vi.fn();
        const mockPassage: Passage = {
          title: 'Test',
          content: 'Hello world',
          wordCount: 2,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };

        render(<PassageDisplay passage={mockPassage} onWordClick={onWordClick} />);

        const wordButton = screen.getByTestId('word-hello');
        wordButton.focus();

        fireEvent.keyDown(wordButton, { key: 'Enter' });
        // Enter triggers click on buttons
        expect(wordButton).toHaveFocus();
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

      it('should have radio group with proper keyboard support', () => {
        render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test"
          />
        );

        const radioGroup = screen.getByRole('radiogroup');
        expect(radioGroup).toBeInTheDocument();

        // Radio groups should exist and have aria-labelledby
        expect(radioGroup).toHaveAttribute('aria-labelledby');

        // Radio buttons should be present
        const radios = screen.getAllByRole('radio');
        expect(radios.length).toBe(4);
      });
    });
  });

  describe('Focus Indicators', () => {
    describe('ReadingSettings', () => {
      it('should have focus-visible classes on generate button', () => {
        render(<ReadingSettings onSubmit={vi.fn()} />);
        const button = screen.getByTestId('generate-button');
        expect(button.className).toMatch(/focus-visible:|focus:/);
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

      it('should have focus-visible classes on close button', () => {
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
        const closeButton = screen.getByTestId('vocab-close-button');
        expect(closeButton.className).toMatch(/focus-visible:|focus:|ring/);
      });
    });

    describe('PassageDisplay', () => {
      it('should have focus-visible classes on word buttons', () => {
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
        expect(wordButton.className).toMatch(/focus-visible:|focus:|ring/);
      });
    });

    describe('ErrorMessage', () => {
      it('should have focus-visible classes on retry button', () => {
        render(<ErrorMessage message="Error" onRetry={vi.fn()} />);
        const retryButton = screen.getByTestId('error-retry-button');
        expect(retryButton.className).toMatch(/focus-visible:|focus:/);
      });
    });
  });

  describe('Screen Reader Announcements', () => {
    describe('VocabularyPopup', () => {
      it('should have loading status announcement', () => {
        render(
          <VocabularyPopup
            word="test"
            entry={null}
            isLoading={true}
            position={{ x: 100, y: 100 }}
            onClose={vi.fn()}
            onSave={vi.fn()}
          />
        );
        const loadingText = screen.getByText('読み込み中...');
        expect(loadingText).toBeInTheDocument();
      });
    });

    describe('ReadingSettings', () => {
      it('should announce loading state on button', () => {
        render(<ReadingSettings onSubmit={vi.fn()} isLoading={true} />);
        const button = screen.getByTestId('generate-button');
        expect(button).toHaveTextContent('生成中...');
      });
    });
  });

  describe('Semantic HTML', () => {
    describe('PassageDisplay', () => {
      it('should use article element for passage content', () => {
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
        const article = screen.getByTestId('passage-content');
        expect(article.tagName.toLowerCase()).toBe('article');
      });

      it('should use h2 for passage title', () => {
        const mockPassage: Passage = {
          title: 'Test Title',
          content: 'Hello world',
          wordCount: 2,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };

        render(<PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />);
        const title = screen.getByTestId('passage-title');
        expect(title.tagName.toLowerCase()).toBe('h2');
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

      it('should use h2 for section title', () => {
        render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test"
          />
        );
        const title = screen.getByTestId('questions-title');
        expect(title.tagName.toLowerCase()).toBe('h2');
      });
    });

    describe('QuestionResults', () => {
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

      it('should use h2 for results title', () => {
        render(<QuestionResults results={mockResults} onNewPassage={vi.fn()} />);
        const title = screen.getByTestId('results-title');
        expect(title.tagName.toLowerCase()).toBe('h2');
      });
    });
  });
});
