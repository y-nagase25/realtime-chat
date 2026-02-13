import { describe, it, expect, vi } from 'vitest';
import {
  generateCsrfToken,
  validateCsrfToken,
  getCsrfCookieOptions,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from './index';

describe('CSRF Logic', () => {
  describe('generateCsrfToken', () => {
    it('should generate a valid UUID v4', () => {
      const token = generateCsrfToken();
      // UUID v4 pattern
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(token).toMatch(uuidPattern);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('validateCsrfToken', () => {
    it('should return invalid if cookie token is missing', () => {
      const result = validateCsrfToken(undefined, 'some-header-token');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSRF cookie not found');
    });

    it('should return invalid if header token is missing', () => {
      const result = validateCsrfToken('some-cookie-token', undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSRF header not found');
    });

    it('should return invalid if tokens do not match', () => {
      const result = validateCsrfToken('cookie-token', 'different-header-token');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSRF token mismatch');
    });

    it('should return valid if tokens match', () => {
      const token = 'matching-token';
      const result = validateCsrfToken(token, token);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('getCsrfCookieOptions', () => {
    it('should return correct default options', () => {
      const options = getCsrfCookieOptions();

      expect(options).toEqual(
        expect.objectContaining({
          httpOnly: false, // Required for Double Submit Cookie
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60 * 24, // 24 hours
        })
      );
    });

    it('should set secure flag based on NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test production
      process.env.NODE_ENV = 'production';
      expect(getCsrfCookieOptions().secure).toBe(true);

      // Test development
      process.env.NODE_ENV = 'development';
      expect(getCsrfCookieOptions().secure).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });
});
