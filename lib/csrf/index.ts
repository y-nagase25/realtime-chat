import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { CsrfValidationResult } from '@/lib/types/security';

/** Cookie name for CSRF token */
export const CSRF_COOKIE_NAME = 'csrf_token';

/** Header name for CSRF token */
export const CSRF_HEADER_NAME = 'x-csrf-token';

/** Token expiry time in seconds (24 hours) */
const TOKEN_MAX_AGE = 60 * 60 * 24;

/**
 * Generate a cryptographically secure CSRF token
 * @returns A random UUID token
 */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate CSRF token using Double Submit Cookie pattern
 * Compares the token from cookie with the token from header
 *
 * @param cookieToken - Token from the cookie
 * @param headerToken - Token from the X-CSRF-Token header
 * @returns Validation result with valid flag and optional error message
 */
export function validateCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): CsrfValidationResult {
  if (!cookieToken) {
    return {
      valid: false,
      error: 'CSRF cookie not found',
    };
  }

  if (!headerToken) {
    return {
      valid: false,
      error: 'CSRF header not found',
    };
  }

  if (cookieToken !== headerToken) {
    return {
      valid: false,
      error: 'CSRF token mismatch',
    };
  }

  return { valid: true };
}

/**
 * Get cookie options for setting the CSRF token
 * Uses SameSite=Strict and Secure in production
 *
 * @returns Cookie options for ResponseCookie
 */
export function getCsrfCookieOptions(): Omit<ResponseCookie, 'name' | 'value'> {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: false, // Must be readable by JavaScript for Double Submit Cookie pattern
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  };
}
