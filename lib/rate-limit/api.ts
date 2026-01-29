import 'server-only';
import type { RateLimitResult } from '@/lib/types/security';
import { getUsageLimit } from '@/lib/loaders';
import { TOTAL_TOKEN_LIMIT_PER_DAY, WHISPER_SECONDS_LIMIT_PER_DAY } from '@/lib/constants';

/**
 * Check OpenAI usage limit
 * @returns {RateLimitResult}
 */
export async function checkOpenAIUsage(): Promise<RateLimitResult> {
  const result = await getUsageLimit();
  if (!result || result.error || !result.data) {
    return getRateLimitResult(false);
  }

  const data = result.data;
  if (
    data.total_tokens <= TOTAL_TOKEN_LIMIT_PER_DAY &&
    data.audio_duration_seconds <= WHISPER_SECONDS_LIMIT_PER_DAY
  ) {
    return getRateLimitResult(true);
  }

  return getRateLimitResult(false);
}

function getRateLimitResult(isAllowed: boolean): RateLimitResult {
  return {
    allowed: isAllowed,
    limit: 0,
    remaining: 0,
    resetAt: 0,
  };
}
