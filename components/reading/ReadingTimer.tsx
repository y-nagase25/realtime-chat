'use client';

import type { ReadingLevel } from '@/lib/types/reading';
import { getTargetWpmRange } from '@/lib/constants/reading';
import { useTimer } from '@/lib/hooks/use-timer';

export type ReadingTimerProps = {
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
export function ReadingTimer({ level }: ReadingTimerProps) {
  const elapsedSeconds = useTimer();
  const targetWpm = getTargetWpmRange(level);

  return (
    <div
      data-testid="reading-timer"
      className="flex flex-wrap items-center justify-between gap-2 text-sm"
      role="timer"
      aria-label="経過時間"
    >
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">経過時間:</span>
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
