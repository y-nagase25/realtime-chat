'use client';

import { Attempt } from '@/components/history/Attempt';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import type { SpeakingAttempt } from '@/lib/types/local-storage';

export function AttemptHistory({
  history,
  remove,
}: {
  history: SpeakingAttempt[];
  remove: (id: string) => void;
}) {
  const [didMount, setDidMount] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  useEffect(() => {
    setDidMount(true);
  }, []);

  // Render skeleton during SSR to match initial client render
  if (didMount) {
    return (
      <div className="mt-4 space-y-4">
        {history.map((attempt, idx) => (
          <Attempt
            key={attempt.id}
            attempt={attempt}
            removeAttempt={(id) => remove(id)}
            isExpanded={expandedIndex === idx}
            onShow={() => setExpandedIndex(idx)}
          />
        ))}
      </div>
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
