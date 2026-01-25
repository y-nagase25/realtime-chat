/**
 * ReadingTimer Component
 * Displays elapsed reading time in mm:ss format,
 * and shows target WPM benchmark for the current level.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReadingLevel } from '@/lib/types/reading';
import { getTargetWpmRange } from '@/lib/constants/reading';

/**
 * Props for the ReadingTimer component
 */
export type ReadingTimerProps = {
  /** Whether the timer is actively running */
  isRunning: boolean;
  /** Word count of the passage being read */
  wordCount: number;
  /** Reading level for target WPM display */
  level: ReadingLevel;
};

/**
 * Format seconds into mm:ss display string
 */
function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * ReadingTimer - Displays reading time and WPM metrics
 */
export function ReadingTimer({ isRunning, wordCount: _wordCount, level }: ReadingTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const targetWpm = getTargetWpmRange(level);

  return (
    <div
      data-testid="reading-timer"
      className="flex flex-wrap items-center justify-between gap-2 text-sm"
      role="timer"
      aria-label="読書時間"
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">読書時間:</span>
        <span data-testid="timer-display" className="font-mono font-medium">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      <div data-testid="target-wpm" className="text-muted-foreground">
        目標: {targetWpm.min}-{targetWpm.max} WPM
      </div>
    </div>
  );
}
