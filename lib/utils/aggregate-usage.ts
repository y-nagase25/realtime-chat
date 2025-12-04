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
 * Sums both input_tokens and output_tokens for each record, handling null/undefined values
 *
 * @param {UsageTrackingRecord[]} records - Array of usage tracking records with token data
 * @returns {number} Total token count (input + output tokens)
 *
 * @example
 * const records = [
 *   { input_tokens: 100, output_tokens: 50, ... },
 *   { input_tokens: 200, output_tokens: null, ... },
 *   { input_tokens: null, output_tokens: 75, ... },
 * ];
 * aggregateSpeakingTokens(records); // Returns 425 (100+50+200+0+0+75)
 */
export function aggregateSpeakingTokens(records: UsageTrackingRecord[]): number {
  return records.reduce((sum, record) => {
    const inputTokens = record.input_tokens ?? 0;
    const outputTokens = record.output_tokens ?? 0;
    return sum + inputTokens + outputTokens;
  }, 0);
}
