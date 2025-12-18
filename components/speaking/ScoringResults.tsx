/**
 * ScoringResults Component
 * Displays score, feedback, and transcript
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, AlertTriangleIcon } from 'lucide-react';
import type { ScoringResult } from '@/lib/types/speaking';
import { getScoreBadgeClass } from '@/lib/utils/scoring';
import { SPEAKING_LABELS } from '@/lib/constants/speaking-labels';

interface ScoringResultsProps {
  result: ScoringResult;
  transcript: string;
}

export function ScoringResults({ result, transcript }: ScoringResultsProps) {
  return (
    <div className="space-y-4">
      {/* Transcript Reference */}
      <Card>
        <CardHeader>
          <CardTitle>{SPEAKING_LABELS.result}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm leading-relaxed">{transcript}</p>
          </div>
        </CardContent>
        <CardContent>
          <div
            className={`inline-flex items-center rounded-full border-2 px-3 py-2 font-bold ${getScoreBadgeClass(result.score)}`}
          >
            {result.score}/10
          </div>
        </CardContent>
      </Card>

      {/* Good Points */}
      {result.goodPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckIcon className="h-5 w-5 text-green-600" />
              {SPEAKING_LABELS.goodPoints}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.goodPoints.map((point, index) => (
                <li key={index} className="flex gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Areas for Improvement */}
      {result.areasForImprovement.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-600" />
              {SPEAKING_LABELS.areasForImprovement}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.areasForImprovement.map((area, index) => (
                <li key={index} className="flex gap-2">
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
