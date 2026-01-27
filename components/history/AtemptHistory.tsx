'use client';

import type { SpeakingAttempt } from '@/lib/types/speaking';
import { Attempt } from '@/components/history/Attempt';
import { SPEAKING_LABELS } from '@/lib/constants/speaking-labels';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { SPEAKING_ATTEMPTS_STORAGE_KEY, useLocalStorage } from '@/lib/hooks/use-local-storage';

export function AttemptHistory() {
  const { history: speakingAttempts, remove: removeSpeakingAttempt } =
    useLocalStorage<SpeakingAttempt>(SPEAKING_ATTEMPTS_STORAGE_KEY);
  const [didMount, setDidMount] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  useEffect(() => {
    setDidMount(true);
  }, []);

  // Render skeleton during SSR to match initial client render
  if (didMount) {
    return (
      <>
        <h2>
          {SPEAKING_LABELS.history} ({speakingAttempts.length})
        </h2>
        <div className="mt-4 space-y-4">
          {speakingAttempts.map((attempt, idx) => (
            <Attempt
              key={attempt.id}
              attempt={attempt}
              removeAttempt={(id) => removeSpeakingAttempt(id)}
              isExpanded={expandedIndex === idx}
              onShow={() => setExpandedIndex(idx)}
            />
          ))}
        </div>
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
