'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WHISPER_LIMIT_SECONDS_PER_DAY } from '@/lib/costants';
import { formatNumber } from '@/lib/utils/date-jst';

/**
 * Props for the UsageStat sub-component
 */
interface UsageStatProps {
  label: string;
  value: number | null;
  unit: string;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * UsageStat - Sub-component for displaying a single usage statistic
 */
function UsageStat({ label, value, unit, isLoading, hasError }: UsageStatProps) {
  // Show placeholder if loading, error, or no value
  const displayValue = isLoading || hasError || value === null ? '---' : formatNumber(value);

  // Only show unit if we have a valid value
  const showUnit = !isLoading && !hasError && value !== null;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="font-medium">
        {displayValue} {showUnit && unit}
      </span>
    </div>
  );
}

interface DailyUsageCardProps {
  transcriptionSeconds: number | null;
  speakingTokens: number | null;
  isLoading: boolean;
  hasError: boolean;
}

export function DailyUsageCard({
  transcriptionSeconds,
  speakingTokens,
  isLoading,
  hasError,
}: DailyUsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Usage (Today)</CardTitle>
        <CardDescription>
          Whisper API limit: {WHISPER_LIMIT_SECONDS_PER_DAY} seconds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <UsageStat
          label="Transcription"
          value={transcriptionSeconds}
          unit="seconds"
          isLoading={isLoading}
          hasError={hasError}
        />
        <UsageStat
          label="Speaking Score"
          value={speakingTokens}
          unit="tokens"
          isLoading={isLoading}
          hasError={hasError}
        />
      </CardContent>
    </Card>
  );
}
