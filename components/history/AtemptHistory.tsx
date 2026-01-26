'use client';

import type { SpeakingAttempt } from '@/lib/types/speaking';
import { Attempt } from '@/components/history/Attempt';
import { SPEAKING_LABELS } from '@/lib/constants/speaking-labels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SPEAKING_ATTEMPTS_STORAGE_KEY, useLocalStorage } from '@/lib/hooks/use-local-storage';

export function AttemptHistory() {
  const { history: speakingAttempts, remove: removeSpeakingAttempt } =
    useLocalStorage<SpeakingAttempt>(SPEAKING_ATTEMPTS_STORAGE_KEY);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render empty state during SSR to match initial client render
  if (!isClient) {
    return <LoadingSkeleton />;
  }

  if (speakingAttempts.length === 0) {
    return <Empty />;
  }

  return (
    <>
      <h2>
        {SPEAKING_LABELS.history} ({speakingAttempts.length})
      </h2>
      <div className="mt-4 space-y-4">
        {speakingAttempts.map((attempt) => (
          <Attempt
            key={attempt.id}
            attempt={attempt}
            removeAttempt={(id) => removeSpeakingAttempt(id)}
          />
        ))}
      </div>
    </>
  );
}

function Empty() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{SPEAKING_LABELS.history}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <InfoIcon className="mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{SPEAKING_LABELS.noAttempts}</p>
        </div>
      </CardContent>
    </Card>
  );
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
