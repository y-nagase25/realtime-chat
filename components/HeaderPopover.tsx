'use client';

import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, RefreshCw } from 'lucide-react';
import { TOTAL_TOKEN_LIMIT_PER_DAY, WHISPER_SECONDS_LIMIT_PER_DAY } from '@/lib/constants';
import { useDailyUsage } from '@/lib/hooks/context/useDailyUsage';

export function HeaderPopover() {
  const { usageAmount, fetchUsageAmount } = useDailyUsage();
  const usages = [
    {
      name: 'Chat Completions',
      current: usageAmount.total_tokens,
      limit: TOTAL_TOKEN_LIMIT_PER_DAY,
    },
    {
      name: 'Whisper',
      current: usageAmount.audio_duration_seconds,
      limit: WHISPER_SECONDS_LIMIT_PER_DAY,
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <BarChart />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">Today Usage</p>
          <Button variant="ghost" size="sm" onClick={() => fetchUsageAmount()}>
            <RefreshCw />
          </Button>
        </div>
        <FieldGroup>
          {usages.map((usage) => (
            <Field key={usage.name}>
              <FieldLabel htmlFor={`progress-${usage.name}`}>
                <span>{usage.name}</span>
                <span className="ml-auto">
                  {calculateProgress(usage.current, usage.limit).toFixed(2)}%
                </span>
              </FieldLabel>
              <Progress
                value={calculateProgress(usage.current, usage.limit)}
                id={`progress-${usage.name}`}
              />
            </Field>
          ))}
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}

function calculateProgress(current: number, limit: number): number {
  if (current > limit) return 100;
  return Math.round((current / limit) * 100 * 100) / 100;
}
