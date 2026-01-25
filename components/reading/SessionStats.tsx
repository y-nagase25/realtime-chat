'use client';

import { useState, useEffect } from 'react';
import {
  getSessionStats,
  type SessionStats as SessionStatsData,
} from '@/lib/storage/reading-history';

export function SessionStats() {
  const [stats, setStats] = useState<SessionStatsData | null>(null);

  useEffect(() => {
    setStats(getSessionStats());
  }, []);

  if (!stats || stats.sessionCount === 0) {
    return null;
  }

  return (
    <div
      data-testid="session-stats"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-muted/50 px-4 py-2 text-sm"
    >
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">セッション数:</span>
        <span className="font-medium">{stats.sessionCount}回</span>
      </div>

      {stats.lastWpm !== null && (
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">前回の速度:</span>
          <span className="font-medium">{stats.lastWpm} WPM</span>
          {stats.wpmChange !== null && stats.wpmChange !== 0 && (
            <span
              data-testid="wpm-change"
              className={stats.wpmChange > 0 ? 'text-green-600' : 'text-red-600'}
            >
              ({stats.wpmChange > 0 ? '+' : ''}
              {stats.wpmChange})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
