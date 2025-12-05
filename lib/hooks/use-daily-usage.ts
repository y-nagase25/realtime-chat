/**
 * Custom hook for fetching and managing daily usage statistics
 */

import { useEffect, useState } from 'react';
import type { UsageDisplayState, DailyUsageStats } from '@/lib/types/usage-stats';
import { useCallback } from 'react';

/**
 * Hook for fetching daily usage statistics from the API
 *
 * @param {number} [refreshInterval] - Optional interval in milliseconds for auto-refresh (e.g., 60000 for 60 seconds)
 * @returns {UsageDisplayState} Current state with usage data, loading, and error flags
 *
 * @example
 * const { transcriptionSeconds, speakingTokens, isLoading, hasError } = useDailyUsage(60000);
 */
export function useDailyUsage(refreshInterval?: number): UsageDisplayState {
  const [state, setState] = useState<UsageDisplayState>({
    transcriptionSeconds: null,
    speakingTokens: null,
    isLoading: true,
    hasError: false,
    refetch: () => {},
  });

  const fetchUsage = useCallback(async () => {
    try {
      const response = await fetch('/api/usage/daily');

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: DailyUsageStats = await response.json();

      setState({
        transcriptionSeconds: data.transcription.totalSeconds,
        speakingTokens: data.speakingScoring.totalTokens,
        isLoading: false,
        hasError: false,
        refetch: fetchUsage,
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setState({
        transcriptionSeconds: null,
        speakingTokens: null,
        isLoading: false,
        hasError: true,
        refetch: fetchUsage,
      });
    }
  }, []);

  useEffect(() => {
    // Fetch data on mount
    fetchUsage();

    // Set up auto-refresh interval if provided
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchUsage, refreshInterval);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchUsage]);

  return {
    ...state,
    refetch: fetchUsage,
  };
}
