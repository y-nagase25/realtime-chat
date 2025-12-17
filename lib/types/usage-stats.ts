/**
 * Type definitions for usage statistics feature
 */

import type { TokenUsageRow } from './db';

/**
 * Raw database record from usage_tracking table
 */
export interface UsageTrackingRecord {
  id: string;
  user_id: string | null;
  api_type: 'transcription' | 'speaking-scoring';
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  audio_duration_seconds: number | null;
  cost: number | null;
  created_at: string; // ISO 8601 timestamp
}

/**
 * API response from GET /api/usage/daily
 * Extended to include all token usage records for the day
 */
export interface DailyUsageStats {
  date: string; // YYYY-MM-DD format
  timezone: 'JST';
  transcription: {
    totalSeconds: number;
    recordCount: number;
  };
  speakingScoring: {
    totalTokens: number;
    recordCount: number;
  };
  records: TokenUsageRow[]; // All token usage records for today
  totalRecordCount: number; // Total count of all records
}

/**
 * API error response
 */
export interface UsageStatsError {
  error: string;
}

/**
 * Component state for displaying usage stats
 * Extended to include token usage records
 */
export interface UsageDisplayState {
  transcriptionSeconds: number | null;
  speakingTokens: number | null;
  records: TokenUsageRow[]; // All token usage records for today
  totalRecordCount: number; // Total count of all records
  isLoading: boolean;
  hasError: boolean;
  refetch: () => void;
}
