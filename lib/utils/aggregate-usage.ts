/**
 * Utility functions for aggregating usage tracking data
 */

import type { UsageTrackingRecord } from '@/lib/types/usage-stats';

/**
 * Calculate total transcription seconds from usage tracking records
 *
 * @param {UsageTrackingRecord[]} records - Array of usage tracking records with transcription data
 * @returns {number} Total duration in seconds, handles null/undefined values
 *
 * @example
 * const records = [
 *   { duration_seconds: 120, ... },
 *   { duration_seconds: 45, ... },
 *   { duration_seconds: null, ... },
 * ];
 * aggregateTranscriptionSeconds(records); // Returns 165
 */
export function aggregateTranscriptionSeconds(records: UsageTrackingRecord[]): number {
  return records.reduce((sum, record) => {
    return sum + (record.audio_duration_seconds ?? 0);
  }, 0);
}

/**
 * Calculate total speaking-scoring tokens from usage tracking records
 *
 * Sums total_tokens for each record, handling null/undefined values
 *
 * @param {UsageTrackingRecord[]} records - Array of usage tracking records with token data
 * @returns {number} Total token count
 *
 * @example
 * const records = [
 *   { total_tokens: 100, ... },
 *   { total_tokens: 200, ... },
 *   { total_tokens: null, ... },
 * ];
 * aggregateSpeakingTokens(records); // Returns 300 (100+200+0)
 */
export function aggregateSpeakingTokens(records: UsageTrackingRecord[]): number {
  return records.reduce((sum, record) => {
    const totalTokens = record.total_tokens ?? 0;
    return sum + totalTokens;
  }, 0);
}
