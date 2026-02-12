'use client';

import { useCallback, useEffect, useState } from 'react';
import { DailyUsageContext } from '@/lib/hooks/context/useDailyUsage';
import { fetchUsageAggregates } from '@/lib/rate-limit/action';
import type { DailyUsageAggregatesClient } from '@/lib/types/usage-stats';

export const DailyUsageProvider = ({ children }: { children: React.ReactNode }) => {
  const [usageAmount, setUsageAmount] = useState<DailyUsageAggregatesClient>({
    total_tokens: 0,
    audio_duration_seconds: 0,
  });

  const fetchUsageAmount = useCallback(async () => {
    const result = await fetchUsageAggregates();

    setUsageAmount({
      total_tokens: result.total_tokens,
      audio_duration_seconds: result.audio_duration_seconds,
    });
  }, []);

  useEffect(() => {
    fetchUsageAmount();
  }, [fetchUsageAmount]);

  return (
    <DailyUsageContext.Provider value={{ usageAmount, fetchUsageAmount }}>
      {children}
    </DailyUsageContext.Provider>
  );
};
