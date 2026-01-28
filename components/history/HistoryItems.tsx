'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { LocalStorageType, ReadingSession, SpeakingAttempt } from '@/lib/types/local-storage';
import { ReadingSessionHistory } from './ReadingSessionHistory';
import { SpeakingAttemptHistory } from './SpeakingAttemptHistory';

interface HistoryItemsProps<T extends LocalStorageType> {
  history: T[];
  remove: (id: string) => void;
  variant: 'reading' | 'speaking';
}

export function HistoryItems<T extends LocalStorageType>({
  history,
  remove,
  variant,
}: HistoryItemsProps<T>) {
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
  }, []);

  // Render skeleton during SSR to match initial client render
  if (didMount) {
    return (
      <>
        {variant === 'reading' && (
          <ReadingSessionHistory readingSession={history as ReadingSession[]} remove={remove} />
        )}
        {variant === 'speaking' && (
          <SpeakingAttemptHistory speakingAttempts={history as SpeakingAttempt[]} remove={remove} />
        )}
      </>
    );
  } else {
    return <LoadingSkeleton />;
  }
}

function LoadingSkeleton() {
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
