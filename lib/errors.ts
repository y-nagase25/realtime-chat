/**
 * Custom error classes for API error handling
 */

/**
 * Base API error class
 */
export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `API Error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * CSRF validation error
 * Thrown when CSRF token is invalid or missing
 */
export class CsrfError extends Error {
  constructor(message?: string) {
    super(message ?? 'CSRF token validation failed');
    this.name = 'CsrfError';
  }
}

/**
 * Rate limit error
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends Error {
  public readonly retryAfter: number;

  constructor(retryAfter: number, message?: string) {
    super(message ?? `Rate limit exceeded. Retry after ${retryAfter} seconds.`);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
