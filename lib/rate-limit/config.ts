import type { RateLimitConfig } from '@/lib/types/security';

/** Default time window: 1 minute in milliseconds */
const ONE_MINUTE_MS = 60 * 1000;

/**
 * Rate limit configuration for each protected endpoint
 */
export const RATE_LIMIT_CONFIGS: RateLimitConfig[] = [
  {
    endpoint: '/api/realtime/session',
    limit: 10,
    windowMs: ONE_MINUTE_MS,
  },
  {
    endpoint: '/api/transcribe',
    limit: 20,
    windowMs: ONE_MINUTE_MS,
  },
  {
    endpoint: '/api/text',
    limit: 30,
    windowMs: ONE_MINUTE_MS,
  },
  {
    endpoint: '/api/speaking/score',
    limit: 30,
    windowMs: ONE_MINUTE_MS,
  },
  // Reading Practice API endpoints
  {
    endpoint: '/api/reading/generate',
    limit: 10,
    windowMs: ONE_MINUTE_MS,
  },
  {
    endpoint: '/api/reading/questions',
    limit: 20,
    windowMs: ONE_MINUTE_MS,
  },
  {
    endpoint: '/api/reading/vocabulary',
    limit: 60,
    windowMs: ONE_MINUTE_MS,
  },
  {
    endpoint: '/api/reading/evaluate-summary',
    limit: 10,
    windowMs: ONE_MINUTE_MS,
  },
];

/**
 * Default rate limit for endpoints not in the config
 */
export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  endpoint: '*',
  limit: 60,
  windowMs: ONE_MINUTE_MS,
};

/**
 * Get rate limit config for a specific endpoint
 * @param endpoint - The API endpoint path
 * @returns The rate limit config for the endpoint
 */
export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  const config = RATE_LIMIT_CONFIGS.find((c) => endpoint.startsWith(c.endpoint));
  return config ?? DEFAULT_RATE_LIMIT;
}
