import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { ReadingTimer } from './ReadingTimer';

describe('ReadingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should render initial time as 0:00', () => {
    render(<ReadingTimer isRunning={false} wordCount={100} level="A2" />);
    expect(screen.getByTestId('timer-display')).toHaveTextContent('0:00');
  });

  it('should start timer when isRunning is true', () => {
    render(<ReadingTimer isRunning={true} wordCount={100} level="A2" />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('timer-display')).toHaveTextContent('0:01');

    act(() => {
      vi.advanceTimersByTime(59000);
    });

    expect(screen.getByTestId('timer-display')).toHaveTextContent('1:00');
  });

  it('should not start timer when isRunning is false', () => {
    render(<ReadingTimer isRunning={false} wordCount={100} level="A2" />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId('timer-display')).toHaveTextContent('0:00');
  });

  it('should display correct target WPM for level A2', () => {
    render(<ReadingTimer isRunning={true} wordCount={100} level="A2" />);

    // A2 target is typically 80-100 or similar, checking if it renders the target section
    expect(screen.getByTestId('target-wpm')).toBeInTheDocument();
    // Assuming the component renders "目標: 80-120 WPM" or similar based on constants
    expect(screen.getByTestId('target-wpm')).toHaveTextContent(/80.*120/);
  });

  it('should display correct target WPM for level B1', () => {
    render(<ReadingTimer isRunning={true} wordCount={100} level="B1" />);
    expect(screen.getByTestId('target-wpm')).toHaveTextContent(/120.*180/);
  });
});
