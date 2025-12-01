/**
 * AttemptHistory Component
 * Displays past attempts with session statistics
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAttemptHistory } from '@/lib/hooks/use-attempt-history';
import { Attempt } from './Attempt';
import { InfoIcon, TrashIcon } from 'lucide-react';

export function AttemptHistory() {
  const { attempts, clearHistory } = useAttemptHistory();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render empty state during SSR to match initial client render
  if (!isClient) {
    return <LoadingAttemptHistory />;
  }

  if (attempts.length === 0) {
    return <EmptyAttemptHistory />;
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">Past Attempts ({attempts.length})</CardTitle>
        <TrashIcon
          size={20}
          onClick={() => clearHistory()}
          className="cursor-pointer"
          color="var(--destructive)"
        />
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

function LoadingAttemptHistory() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="mb-2 h-6 w-48" />
      </CardContent>
    </Card>
  );
}
