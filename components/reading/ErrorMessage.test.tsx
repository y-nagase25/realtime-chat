import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the error message text', () => {
    render(<ErrorMessage message="文章の生成に失敗しました" />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('文章の生成に失敗しました')).toBeInTheDocument();
  });

  it('should render a retry button when onRetry is provided', () => {
    render(<ErrorMessage message="エラー" onRetry={() => {}} />);

    expect(screen.getByTestId('error-retry-button')).toBeInTheDocument();
    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  it('should not render a retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="エラー" />);

    expect(screen.queryByTestId('error-retry-button')).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="エラー" onRetry={onRetry} />);

    fireEvent.click(screen.getByTestId('error-retry-button'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have destructive styling', () => {
    render(<ErrorMessage message="エラー" />);

    const container = screen.getByTestId('error-message');
    expect(container).toHaveClass('text-destructive');
  });
});
