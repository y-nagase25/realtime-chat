/**
 * AttemptHistory Component
 * Displays past attempts with session statistics
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttemptHistory } from '@/lib/hooks/use-attempt-history';
import { Attempt } from './Attempt';
import { InfoIcon, TrashIcon } from 'lucide-react';

export function AttemptHistory() {
  const { attempts, clearHistory } = useAttemptHistory();

  if (attempts.length === 0) {
    return <EmptyAttemptHistory />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Past Attempts ({attempts.length})</CardTitle>
          <TrashIcon color="var(--destructive)" size={20} onClick={() => clearHistory()} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {attempts.map((attempt) => (
            <Attempt key={attempt.id} attempt={attempt} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyAttemptHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attempt History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <InfoIcon className="mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No attempts yet. Record your first response to get started!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
