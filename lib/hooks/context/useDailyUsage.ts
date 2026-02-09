'use client';

import { createContext, useContext } from 'react';
import type { DailyUsageAggregatesClient } from '@/lib/types/usage-stats';

export type DailyUsageContextType = {
  usageAmount: DailyUsageAggregatesClient;
  fetchUsageAmount: () => void;
};

export const DailyUsageContext = createContext<DailyUsageContextType | null>(null);

export const useDailyUsage = () => {
  const context = useContext(DailyUsageContext);
  if (!context) {
    throw new Error('useDailyUsage must be used within a DailyUsageProvider');
  }
  return context;
};
