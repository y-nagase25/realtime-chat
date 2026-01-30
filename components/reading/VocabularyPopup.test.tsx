import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { VocabularyPopup } from './VocabularyPopup';
import type { VocabularyEntry } from '@/lib/types/reading';

const mockEntry: VocabularyEntry = {
  word: 'hello',
  pronunciation: '/həˈloʊ/',
  partOfSpeech: 'interjection',
  definitionEn: 'A greeting',
  definitionJa: 'こんにちは',
  exampleSentence: 'Hello, how are you?',
};

const defaultProps = {
  word: 'hello',
  entry: null,
  isLoading: false,
  position: { x: 100, y: 100 },
  onClose: vi.fn(),
  onSave: vi.fn(),
  isSaved: false,
};

describe('VocabularyPopup - Error Handling', () => {
  afterEach(() => {
    cleanup();
  });

  it('should display error message in Japanese when error is provided', () => {
    render(<VocabularyPopup {...defaultProps} error="単語の検索に失敗しました" />);

    expect(screen.getByTestId('vocab-error')).toBeInTheDocument();
    expect(screen.getByText('単語の検索に失敗しました')).toBeInTheDocument();
  });

  it('should display retry button when error and onRetry are provided', () => {
    const onRetry = vi.fn();
    render(
      <VocabularyPopup {...defaultProps} error="単語の検索に失敗しました" onRetry={onRetry} />
    );

    expect(screen.getByTestId('error-retry-button')).toBeInTheDocument();
    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(
      <VocabularyPopup {...defaultProps} error="単語の検索に失敗しました" onRetry={onRetry} />
    );

    fireEvent.click(screen.getByTestId('error-retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not display vocabulary entry when error is shown', () => {
    render(
      <VocabularyPopup {...defaultProps} entry={mockEntry} error="単語の検索に失敗しました" />
    );

    expect(screen.queryByTestId('vocab-definition-en')).not.toBeInTheDocument();
    expect(screen.getByTestId('vocab-error')).toBeInTheDocument();
  });

  it('should not display loading spinner when error is shown', () => {
    render(<VocabularyPopup {...defaultProps} isLoading={true} error="単語の検索に失敗しました" />);

    expect(screen.queryByTestId('vocab-loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('vocab-error')).toBeInTheDocument();
  });
});
