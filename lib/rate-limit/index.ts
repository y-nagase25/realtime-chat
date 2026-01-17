import type { RateLimitResult } from '@/lib/types/security';
import { getRateLimitConfig } from './config';
import { getEntry, setEntry, cleanupExpiredEntries as cleanupStore } from './store';

/**
 * Check if a request is allowed based on rate limits
 *
 * @param ip - Client IP address
 * @param endpoint - API endpoint path
 * @returns Rate limit check result
 */
export function checkRateLimit(ip: string, endpoint: string): RateLimitResult {
  const config = getRateLimitConfig(endpoint);
  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  let entry = getEntry(key);

  // If no entry exists or window has expired, create a new one
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    setEntry(key, entry);

    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: entry.resetAt,
    };
  }

  // Increment the count
  entry.count += 1;
  setEntry(key, entry);

  // Check if limit exceeded
  if (entry.count > config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  return {
    allowed: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Clean up expired entries from the store
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): void {
  cleanupStore();
}

// Re-export config utilities
export { getRateLimitConfig, RATE_LIMIT_CONFIGS, DEFAULT_RATE_LIMIT } from './config';
