/**
 * Unit tests for ReadingTimer component
 * Tests the onTimeUpdate callback prop functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { ReadingTimer } from '@/components/reading/ReadingTimer';

describe('ReadingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe('basic rendering', () => {
    it('renders timer display with initial 0:00', () => {
      render(<ReadingTimer isRunning={false} wordCount={100} level="A1" />);

      expect(screen.getByTestId('timer-display')).toHaveTextContent('0:00');
    });

    it('renders target WPM based on level', () => {
      render(<ReadingTimer isRunning={false} wordCount={100} level="A1" />);

      expect(screen.getByTestId('target-wpm')).toBeInTheDocument();
    });
  });

  describe('timer functionality', () => {
    it('increments time when isRunning is true', () => {
      render(<ReadingTimer isRunning={true} wordCount={100} level="A1" />);

      expect(screen.getByTestId('timer-display')).toHaveTextContent('0:00');

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('timer-display')).toHaveTextContent('0:01');

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByTestId('timer-display')).toHaveTextContent('0:03');
    });

    it('does not increment time when isRunning is false', () => {
      render(<ReadingTimer isRunning={false} wordCount={100} level="A1" />);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByTestId('timer-display')).toHaveTextContent('0:00');
    });
  });

  describe('onTimeUpdate callback', () => {
    it('calls onTimeUpdate with current seconds when timer increments', () => {
      const onTimeUpdate = vi.fn();

      render(
        <ReadingTimer isRunning={true} wordCount={100} level="A1" onTimeUpdate={onTimeUpdate} />
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onTimeUpdate).toHaveBeenCalledWith(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onTimeUpdate).toHaveBeenCalledWith(2);
      expect(onTimeUpdate).toHaveBeenCalledTimes(2);
    });

    it('does not call onTimeUpdate when timer is not running', () => {
      const onTimeUpdate = vi.fn();

      render(
        <ReadingTimer isRunning={false} wordCount={100} level="A1" onTimeUpdate={onTimeUpdate} />
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onTimeUpdate).not.toHaveBeenCalled();
    });

    it('works correctly without onTimeUpdate prop (optional)', () => {
      // Should not throw when onTimeUpdate is not provided
      render(<ReadingTimer isRunning={true} wordCount={100} level="A1" />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('timer-display')).toHaveTextContent('0:01');
    });

    it('calls onTimeUpdate with accumulated time after multiple increments', () => {
      const onTimeUpdate = vi.fn();

      render(
        <ReadingTimer isRunning={true} wordCount={100} level="A1" onTimeUpdate={onTimeUpdate} />
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should have been called 5 times with 1, 2, 3, 4, 5
      expect(onTimeUpdate).toHaveBeenCalledTimes(5);
      expect(onTimeUpdate).toHaveBeenLastCalledWith(5);
    });
  });

  describe('time formatting', () => {
    it('formats time as mm:ss correctly for 65 seconds', () => {
      render(<ReadingTimer isRunning={true} wordCount={100} level="A1" />);

      act(() => {
        vi.advanceTimersByTime(65000);
      });

      expect(screen.getByTestId('timer-display')).toHaveTextContent('1:05');
    });

    it('formats time as mm:ss correctly for 125 seconds', () => {
      render(<ReadingTimer isRunning={true} wordCount={100} level="A1" />);

      act(() => {
        vi.advanceTimersByTime(125000);
      });

      expect(screen.getByTestId('timer-display')).toHaveTextContent('2:05');
    });
  });
});
