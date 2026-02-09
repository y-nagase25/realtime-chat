'use server';

import { getUsageLimit } from '../loaders';
import type { DailyUsageAggregatesClient } from '../types/usage-stats';

/**
 * Fetch usage aggregates from database for client context
 */
export async function fetchUsageAggregates(): Promise<DailyUsageAggregatesClient> {
  const result = await getUsageLimit();

  // if result contains 0 row, today's usage is 0
  if (result.error && result.error.code === 'PGRST116') {
    return {
      total_tokens: 0,
      audio_duration_seconds: 0,
    };
  }

  if (result.error || !result.data) {
    console.error('Failed to fetch usage aggregates');
    return {
      total_tokens: 0,
      audio_duration_seconds: 0,
    };
  }

  return {
    total_tokens: result.data.total_tokens,
    audio_duration_seconds: result.data.audio_duration_seconds,
  };
}
