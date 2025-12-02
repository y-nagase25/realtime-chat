/**
 * Type definitions for usage statistics feature
 */

/**
 * Raw database record from usage_tracking table
 */
export interface UsageTrackingRecord {
  id: string;
  user_id: string | null;
  api_type: 'transcription' | 'speaking-scoring';
  input_tokens: number | null;
  output_tokens: number | null;
  cached_tokens: number | null;
  duration_seconds: number | null;
  cost: number | null;
  created_at: string; // ISO 8601 timestamp
}

/**
 * API response from GET /api/usage/daily
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
}

/**
 * API error response
 */
export interface UsageStatsError {
  error: string;
}

/**
 * Component state for displaying usage stats
 */
export interface UsageDisplayState {
  transcriptionSeconds: number | null;
  speakingTokens: number | null;
  isLoading: boolean;
  hasError: boolean;
}
