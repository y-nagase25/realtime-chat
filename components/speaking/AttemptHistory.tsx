/**
 * AttemptHistory Component
 * Displays past attempts with session statistics
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttemptHistory } from '@/lib/hooks/use-attempt-history';
import { calculateSessionStats, getScoreBadgeClass } from '@/lib/utils/scoring';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon, InfoIcon } from 'lucide-react';

export function AttemptHistory() {
  const { getAttemptHistory } = useAttemptHistory();
  const attempts = getAttemptHistory();

  const stats = calculateSessionStats(attempts);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (attempts.length === 0) {
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

  return (
    <div className="space-y-4">
      {/* <SessionStatistics stats={stats} /> */}

      {/* Attempts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Past Attempts ({stats.totalAttempts})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attempts.map((attempt) => {
              const isExpanded = expandedId === attempt.id;
              const date = new Date(attempt.created_at);

              return (
                <div key={attempt.id} className="rounded-lg border">
                  {/* Attempt Summary */}
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto"
                    onClick={() => setExpandedId(isExpanded ? null : attempt.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold ${getScoreBadgeClass(attempt.score)}`}
                      >
                        {attempt.score}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">Q.{attempt.question_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="space-y-3 border-t p-4">
                      {/* Transcript */}
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Transcript
                        </div>
                        <div className="rounded-lg bg-muted p-3 text-sm">{attempt.transcript}</div>
                      </div>

                      {/* Good Points */}
                      {attempt.good_points.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                            Good Points
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

                      {/* Areas for Improvement */}
                      {attempt.areas_for_improvement.length > 0 && (
                        <div>
                          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                            Areas for Improvement
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
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
