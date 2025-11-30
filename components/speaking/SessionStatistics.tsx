import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionStats } from '@/lib/types/speaking';

export function SessionStatistics({ stats }: { stats: SessionStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Session Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            <div className="text-xs text-muted-foreground">Total Attempts</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Average Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.bestScore}</div>
            <div className="text-xs text-muted-foreground">Best Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.latestScore ?? '-'}</div>
            <div className="text-xs text-muted-foreground">Latest Score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
