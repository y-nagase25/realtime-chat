import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SummaryWriting } from './SummaryWriting';

const defaultProps = {
  onSubmit: vi.fn(),
  isEvaluating: false,
  feedback: null,
};

describe('SummaryWriting - Error Handling', () => {
  afterEach(() => {
    cleanup();
  });

  it('should display error message in Japanese when error is provided', () => {
    render(<SummaryWriting {...defaultProps} error="要約の評価に失敗しました" />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('要約の評価に失敗しました')).toBeInTheDocument();
  });

  it('should display retry button when error and onRetry are provided', () => {
    const onRetry = vi.fn();
    render(<SummaryWriting {...defaultProps} error="要約の評価に失敗しました" onRetry={onRetry} />);

    expect(screen.getByTestId('error-retry-button')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<SummaryWriting {...defaultProps} error="要約の評価に失敗しました" onRetry={onRetry} />);

    fireEvent.click(screen.getByTestId('error-retry-button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should still show submit button when there is an error (to allow re-submission)', () => {
    render(<SummaryWriting {...defaultProps} error="要約の評価に失敗しました" />);

    expect(screen.getByTestId('submit-summary-button')).toBeInTheDocument();
  });
});
