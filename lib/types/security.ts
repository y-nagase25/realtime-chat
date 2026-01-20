/**
 * Security-related type definitions for CSRF protection and rate limiting
 */

/**
 * Rate limit entry stored in memory
 */
export type RateLimitEntry = {
  /** Number of requests made in the current window */
  count: number;
  /** Unix timestamp (ms) when the window resets */
  resetAt: number;
};

/**
 * Rate limit configuration for an endpoint
 */
export type RateLimitConfig = {
  /** API endpoint path pattern */
  endpoint: string;
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
};

/**
 * Result of a rate limit check
 */
export type RateLimitResult = {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the window resets */
  resetAt: number;
  /** Seconds until the client can retry (only set when not allowed) */
  retryAfter?: number;
};

/**
 * Result of CSRF token validation
 */
export type CsrfValidationResult = {
  /** Whether the token is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
};
