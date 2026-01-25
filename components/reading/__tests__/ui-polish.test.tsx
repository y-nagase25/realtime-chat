/**
 * UI Polish Tests for Reading Practice Feature
 *
 * - Consistent spacing and typography
 * - Smooth transitions between steps
 * - Proper Japanese font rendering
 * - Match existing app design system
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ReadingSettings } from '../ReadingSettings';
import { PassageDisplay } from '../PassageDisplay';
import { VocabularyPopup } from '../VocabularyPopup';
import { ComprehensionQuestions } from '../ComprehensionQuestions';
import { QuestionResults } from '../QuestionResults';
import { SummaryWriting } from '../SummaryWriting';
import { SessionStats } from '../SessionStats';
import { PassageSkeleton } from '../PassageSkeleton';
import type { Passage, ComprehensionQuestion, VocabularyEntry } from '@/lib/types/reading';

// Mock storage for SessionStats
vi.mock('@/lib/storage/reading-history', () => ({
  getSessionStats: () => ({ sessionCount: 5, lastWpm: 120, wpmChange: 10 }),
}));

describe('UI Polish', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Consistent Spacing', () => {
    describe('ReadingSettings', () => {
      it('should have consistent vertical spacing using space-y-6', () => {
        const { container } = render(<ReadingSettings onSubmit={vi.fn()} />);
        const formContainer = container.firstChild as HTMLElement;
        expect(formContainer.className).toMatch(/space-y-6/);
      });

      it('should have consistent label spacing with space-y-2', () => {
        const { container } = render(<ReadingSettings onSubmit={vi.fn()} />);
        const labelContainers = container.querySelectorAll('.space-y-2');
        expect(labelContainers.length).toBeGreaterThan(0);
      });
    });

    describe('ComprehensionQuestions', () => {
      const mockQuestions: ComprehensionQuestion[] = [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Test?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Test',
          explanationJa: '解説',
        },
      ];

      it('should have consistent spacing between questions using space-y-6', () => {
        const { container } = render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test"
          />
        );
        const cardContent = container.querySelector('.space-y-6');
        expect(cardContent).toBeInTheDocument();
      });
    });

    describe('SummaryWriting', () => {
      it('should have consistent vertical spacing using space-y-4', () => {
        const { container } = render(
          <SummaryWriting onSubmit={vi.fn()} isEvaluating={false} feedback={null} />
        );
        const cardContent = container.querySelector('.space-y-4');
        expect(cardContent).toBeInTheDocument();
      });
    });
  });

  describe('Smooth Transitions', () => {
    describe('VocabularyPopup', () => {
      const mockEntry: VocabularyEntry = {
        word: 'test',
        pronunciation: '/test/',
        partOfSpeech: 'noun',
        definitionEn: 'A test',
        definitionJa: 'テスト',
        exampleSentence: 'This is a test.',
      };

      it('should have animation classes for smooth appearance', () => {
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
        expect(popup.className).toMatch(/animate-in|fade-in|zoom-in/);
      });
    });

    describe('PassageDisplay', () => {
      it('should have transition classes on word buttons', () => {
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
        expect(wordButton.className).toMatch(/transition/);
      });
    });

    describe('PassageSkeleton', () => {
      it('should have animate-pulse on skeleton elements', () => {
        const { container } = render(<PassageSkeleton />);
        const skeletons = container.querySelectorAll('[class*="animate-"]');
        expect(skeletons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Typography', () => {
    describe('PassageDisplay', () => {
      it('should use readable font size for passage content', () => {
        const mockPassage: Passage = {
          title: 'Test Title',
          content: 'Test content',
          wordCount: 2,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };
        render(<PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />);
        const content = screen.getByTestId('passage-content');
        expect(content.className).toMatch(/text-lg|text-base/);
      });

      it('should have proper line height for readability', () => {
        const mockPassage: Passage = {
          title: 'Test Title',
          content: 'Test content',
          wordCount: 2,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };
        render(<PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />);
        const content = screen.getByTestId('passage-content');
        expect(content.className).toMatch(/leading-relaxed|leading-loose/);
      });

      it('should use proper font size for title', () => {
        const mockPassage: Passage = {
          title: 'Test Title',
          content: 'Test content',
          wordCount: 2,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };
        render(<PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />);
        const title = screen.getByTestId('passage-title');
        expect(title.className).toMatch(/text-2xl|text-xl/);
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
            explanation: 'Test',
            explanationJa: '解説',
          },
          userAnswer: 0,
          isCorrect: true,
        },
      ];

      it('should use proper font size for score display', () => {
        render(<QuestionResults results={mockResults} onNewPassage={vi.fn()} />);
        const score = screen.getByTestId('results-score');
        expect(score.className).toMatch(/text-2xl|text-xl/);
      });

      it('should use larger font for percentage', () => {
        render(<QuestionResults results={mockResults} onNewPassage={vi.fn()} />);
        const percentage = screen.getByTestId('results-percentage');
        expect(percentage.className).toMatch(/text-3xl|text-2xl/);
      });
    });

    describe('SummaryWriting', () => {
      it('should have proper title typography', () => {
        render(<SummaryWriting onSubmit={vi.fn()} isEvaluating={false} feedback={null} />);
        const title = screen.getByTestId('summary-title');
        expect(title.className).toMatch(/text-xl|font-bold/);
      });
    });

    describe('ComprehensionQuestions', () => {
      const mockQuestions: ComprehensionQuestion[] = [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Test?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Test',
          explanationJa: '解説',
        },
      ];

      it('should have proper title typography', () => {
        render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test"
          />
        );
        const title = screen.getByTestId('questions-title');
        expect(title.className).toMatch(/text-xl|font-bold/);
      });
    });
  });

  describe('Design System Consistency', () => {
    describe('Card Usage', () => {
      it('should use Card component for PassageDisplay', () => {
        const mockPassage: Passage = {
          title: 'Test',
          content: 'Test content',
          wordCount: 2,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };
        const { container } = render(
          <PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />
        );
        // Cards render with specific data-slot attributes or structure
        expect(container.querySelector('[data-testid="passage-display"]')).toBeInTheDocument();
      });

      it('should use Card component for ComprehensionQuestions', () => {
        const mockQuestions: ComprehensionQuestion[] = [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Test?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Test',
            explanationJa: '解説',
          },
        ];
        const { container } = render(
          <ComprehensionQuestions
            questions={mockQuestions}
            onSubmit={vi.fn()}
            isSubmitting={false}
            passageContent="Test"
          />
        );
        expect(
          container.querySelector('[data-testid="comprehension-questions"]')
        ).toBeInTheDocument();
      });

      it('should use Card component for QuestionResults', () => {
        const mockResults = [
          {
            question: {
              id: 'q1',
              type: 'multiple-choice' as const,
              question: 'Test?',
              options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
              correctAnswer: 0 as const,
              explanation: 'Test',
              explanationJa: '解説',
            },
            userAnswer: 0,
            isCorrect: true,
          },
        ];
        const { container } = render(
          <QuestionResults results={mockResults} onNewPassage={vi.fn()} />
        );
        expect(container.querySelector('[data-testid="question-results"]')).toBeInTheDocument();
      });

      it('should use Card component for SummaryWriting', () => {
        const { container } = render(
          <SummaryWriting onSubmit={vi.fn()} isEvaluating={false} feedback={null} />
        );
        expect(container.querySelector('[data-testid="summary-writing"]')).toBeInTheDocument();
      });
    });

    describe('Muted Text Colors', () => {
      it('should use text-muted-foreground for secondary text in PassageDisplay', () => {
        const mockPassage: Passage = {
          title: 'Test',
          content: 'Test content',
          wordCount: 2,
          level: 'A1',
          topic: 'daily-life',
          estimatedReadingTimeMinutes: 1,
          questions: [],
        };
        const { container } = render(
          <PassageDisplay passage={mockPassage} onWordClick={vi.fn()} />
        );
        const mutedElements = container.querySelectorAll('.text-muted-foreground');
        expect(mutedElements.length).toBeGreaterThan(0);
      });

      it('should use text-muted-foreground for secondary text in SummaryWriting', () => {
        const { container } = render(
          <SummaryWriting onSubmit={vi.fn()} isEvaluating={false} feedback={null} />
        );
        const mutedElements = container.querySelectorAll('.text-muted-foreground');
        expect(mutedElements.length).toBeGreaterThan(0);
      });
    });

    describe('Button Styles', () => {
      it('should use full-width buttons for primary actions', () => {
        render(<ReadingSettings onSubmit={vi.fn()} />);
        const button = screen.getByTestId('generate-button');
        expect(button.className).toMatch(/w-full/);
      });

      it('should use full-width submit button in ComprehensionQuestions', () => {
        const mockQuestions: ComprehensionQuestion[] = [
          {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Test?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Test',
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
        const button = screen.getByTestId('submit-answers-button');
        expect(button.className).toMatch(/w-full/);
      });

      it('should use full-width submit button in SummaryWriting', () => {
        render(<SummaryWriting onSubmit={vi.fn()} isEvaluating={false} feedback={null} />);
        const button = screen.getByTestId('submit-summary-button');
        expect(button.className).toMatch(/w-full/);
      });
    });
  });

  describe('Loading States', () => {
    describe('ReadingSettings', () => {
      it('should show loading text on button when loading', () => {
        render(<ReadingSettings onSubmit={vi.fn()} isLoading={true} />);
        const button = screen.getByTestId('generate-button');
        expect(button).toHaveTextContent('生成中...');
      });
    });

    describe('SummaryWriting', () => {
      it('should show loading text on button when evaluating', () => {
        render(<SummaryWriting onSubmit={vi.fn()} isEvaluating={true} feedback={null} />);
        const button = screen.getByTestId('submit-summary-button');
        expect(button).toHaveTextContent('評価中...');
      });
    });

    describe('VocabularyPopup', () => {
      it('should show loading spinner with proper styling', () => {
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
        const loadingContainer = screen.getByTestId('vocab-loading');
        expect(loadingContainer.className).toMatch(/flex|items-center|justify-center/);
      });
    });
  });

  describe('Feedback Colors', () => {
    describe('QuestionResults', () => {
      it('should use green styling for correct answers', () => {
        const mockResults = [
          {
            question: {
              id: 'q1',
              type: 'multiple-choice' as const,
              question: 'Test?',
              options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
              correctAnswer: 0 as const,
              explanation: 'Test',
              explanationJa: '解説',
            },
            userAnswer: 0,
            isCorrect: true,
          },
        ];
        render(<QuestionResults results={mockResults} onNewPassage={vi.fn()} />);
        const resultItem = screen.getByTestId('result-q1');
        expect(resultItem.className).toMatch(/green/);
      });

      it('should use red styling for incorrect answers', () => {
        const mockResults = [
          {
            question: {
              id: 'q1',
              type: 'multiple-choice' as const,
              question: 'Test?',
              options: ['A', 'B', 'C', 'D'] as [string, string, string, string],
              correctAnswer: 0 as const,
              explanation: 'Test',
              explanationJa: '解説',
            },
            userAnswer: 1,
            isCorrect: false,
          },
        ];
        render(<QuestionResults results={mockResults} onNewPassage={vi.fn()} />);
        const resultItem = screen.getByTestId('result-q1');
        expect(resultItem.className).toMatch(/red/);
      });
    });

    describe('SessionStats', () => {
      it('should use green for positive WPM change', () => {
        render(<SessionStats />);
        const wpmChange = screen.getByTestId('wpm-change');
        expect(wpmChange.className).toMatch(/green/);
      });
    });
  });
});
