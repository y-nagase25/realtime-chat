import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  afterEach(() => {
    cleanup();
  });

  const renderComponent = (messages: string = 'エラー', onRetry?: () => void) => {
    render(<ErrorMessage message={messages} onRetry={onRetry} />);
  };

  const onRetry = vi.fn();

  it('should render the error message text', () => {
    renderComponent('文章の生成に失敗しました');

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('文章の生成に失敗しました')).toBeInTheDocument();
  });

  it('should render a retry button when onRetry is provided', () => {
    renderComponent('エラー', onRetry);

    expect(screen.getByTestId('error-retry-button')).toBeInTheDocument();
    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  it('should not render a retry button when onRetry is not provided', () => {
    renderComponent('エラー');

    expect(screen.queryByTestId('error-retry-button')).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    renderComponent('エラー', onRetry);
    screen.debug();

    fireEvent.click(screen.getByTestId('error-retry-button'));

    expect(onRetry).toHaveBeenCalled();
  });
});
