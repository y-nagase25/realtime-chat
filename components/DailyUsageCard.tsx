'use client';

/**
 * Daily Usage Statistics Card Component
 * Displays today's transcription and speaking-scoring usage
 */

import { useDailyUsage } from '@/lib/hooks/use-daily-usage';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatNumber } from '@/lib/utils/date-jst';
import { RefreshCwIcon } from 'lucide-react';

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

/**
 * DailyUsageCard - Main component displaying daily usage statistics
 *
 * Features:
 * - Displays transcription seconds and speaking-scoring tokens
 * - Auto-refreshes every 60 seconds
 * - Shows placeholder during loading/error states
 * - Graceful error handling (no error messages shown to user)
 */
export function DailyUsageCard() {
  // Fetch usage data with 60-second auto-refresh
  const { transcriptionSeconds, speakingTokens, isLoading, hasError, refetch } = useDailyUsage(
    60 * 1000
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Usage (Today)</CardTitle>
        <CardDescription>Your daily usage statistics</CardDescription>
        <CardAction>
          <RefreshCwIcon
            onClick={refetch}
            color="var(--muted-foreground)"
            className="cursor-pointer"
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <UsageStat
          label="Transcription"
          value={transcriptionSeconds}
          unit="sec"
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
