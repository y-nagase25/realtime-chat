'use client';

import { useDailyUsage } from '@/lib/hooks/use-daily-usage';
import { ADMIN_REFRESH_INTERVAL } from '@/lib/costants';
import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyUsageCard } from '@/components/DailyUsageCard';
import { TodayTokenUsageList } from '@/components/TodayTokenUsageList';

export default function ClientPage() {
  const {
    transcriptionSeconds,
    speakingTokens,
    records,
    totalRecordCount,
    isLoading,
    hasError,
    refetch,
  } = useDailyUsage(ADMIN_REFRESH_INTERVAL);

  return (
    <>
      <Button onClick={refetch}>
        <RefreshCwIcon className="size-4" />
        Refresh
      </Button>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="lg:col-span-3">
          <DailyUsageCard
            transcriptionSeconds={transcriptionSeconds}
            speakingTokens={speakingTokens}
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
        <div className="lg:col-span-7">
          <TodayTokenUsageList
            records={records}
            totalRecordCount={totalRecordCount}
            isLoading={isLoading}
            hasError={hasError}
          />
        </div>
      </div>
    </>
  );
}
