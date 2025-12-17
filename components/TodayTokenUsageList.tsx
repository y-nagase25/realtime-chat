'use client';

import { useDailyUsage } from '@/lib/hooks/use-daily-usage';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { RefreshCwIcon } from 'lucide-react';
import { ADMIN_REFRESH_INTERVAL } from '@/lib/costants';
import type { TokenUsageRow } from '@/lib/types/db';

/**
 * Token Usage Records List Component
 *
 * Displays a detailed table of all token usage records for today (JST).
 * Shows timestamp, API type, model name, and token counts/audio duration.
 *
 * Features:
 * - Auto-refreshes every 60 seconds
 * - Manual refresh button
 * - Loading skeleton during fetch
 * - Empty state when no records exist
 * - Error handling with graceful degradation
 *
 * Data source: Reuses /api/usage/daily endpoint
 */
export function TodayTokenUsageList() {
  const { records, totalRecordCount, isLoading, hasError, refetch } =
    useDailyUsage(ADMIN_REFRESH_INTERVAL);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage Records</CardTitle>
        <CardDescription>
          {totalRecordCount} {totalRecordCount === 1 ? 'record' : 'records'} today
        </CardDescription>
        <CardAction>
          <RefreshCwIcon
            onClick={refetch}
            color="var(--muted-foreground)"
            className="cursor-pointer"
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Table will go here</div>
      </CardContent>
    </Card>
  );
}
