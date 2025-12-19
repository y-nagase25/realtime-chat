'use client';

import type { SpeakingAttempt } from '@/lib/types/speaking';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { getScoreBadgeClass } from '@/lib/utils/scoring';
import { SPEAKING_LABELS } from '@/lib/constants/speaking-labels';

export function Attempt({ attempt }: { attempt: SpeakingAttempt }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div key={attempt.id} className="rounded-lg border">
      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold ${getScoreBadgeClass(attempt.score)}`}
          >
            {attempt.score}
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">Q.{attempt.questionText}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(attempt.created_at).toLocaleDateString()} at{' '}
              {new Date(attempt.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </Button>

      {isExpanded && (
        <div className="space-y-3 border-t p-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              {SPEAKING_LABELS.result}
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">{attempt.transcript}</div>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              {SPEAKING_LABELS.answer}
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">{attempt.modelAnswer}</div>
          </div>

          {attempt.good_points.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {SPEAKING_LABELS.goodPoints}
              </div>
              <ul className="space-y-1">
                {attempt.good_points.map((point, index) => (
                  <li key={index} className="text-sm">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {attempt.areas_for_improvement.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                {SPEAKING_LABELS.areasForImprovement}
              </div>
              <ul className="space-y-1">
                {attempt.areas_for_improvement.map((area, index) => (
                  <li key={index} className="text-sm">
                    • {area}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
