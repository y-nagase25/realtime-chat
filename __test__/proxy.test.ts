import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { proxy } from '@/proxy';
import * as csrf from '@/lib/csrf';
import * as rateLimit from '@/lib/rate-limit';
import * as apiLimit from '@/lib/rate-limit/api';

// Mock dependencies
vi.mock('@/lib/csrf', () => ({
  validateCsrfToken: vi.fn(),
  CSRF_COOKIE_NAME: 'csrf_token',
  CSRF_HEADER_NAME: 'x-csrf-token',
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/rate-limit/api', () => ({
  checkOpenAIUsage: vi.fn(),
}));

// Helper to create a NextRequest
function createRequest(
  method: string,
  pathname: string,
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {}
) {
  const url = `http://localhost${pathname}`;
  const req = new NextRequest(url, {
    method,
    headers: new Headers(headers),
  });

  // Mock cookies
  Object.defineProperty(req, 'cookies', {
    value: {
      get: (name: string) => (cookies[name] ? { value: cookies[name] } : undefined),
    },
  });

  return req;
}

describe('Proxy Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks for happy path
    vi.mocked(apiLimit.checkOpenAIUsage).mockResolvedValue({ allowed: true });
    vi.mocked(rateLimit.checkRateLimit).mockReturnValue({
      allowed: true,
      limit: 100,
      remaining: 99,
      resetAt: Date.now() + 60000,
    });
    vi.mocked(csrf.validateCsrfToken).mockReturnValue({ valid: true });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers on success', async () => {
      const req = createRequest('POST', '/api/text');
      const res = await proxy(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('99');
      expect(res.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should return 429 when rate limit exceeded', async () => {
      vi.mocked(rateLimit.checkRateLimit).mockReturnValue({
        allowed: false,
        limit: 100,
        remaining: 0,
        resetAt: Date.now() + 60000,
        retryAfter: 60,
      });

      const req = createRequest('POST', '/api/text');
      const res = await proxy(req);

      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error).toBe('Too Many Requests');
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(res.headers.get('Retry-After')).toBe('60');
    });

    it('should return 429 when OpenAI usage limit exceeded', async () => {
      vi.mocked(apiLimit.checkOpenAIUsage).mockResolvedValue({ allowed: false });

      const req = createRequest('POST', '/api/text');
      const res = await proxy(req);

      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error).toBe('Usage Limit Exceeded');
    });
  });

  describe('CSRF Validation', () => {
    it('should return 403 on CSRF failure', async () => {
      vi.mocked(csrf.validateCsrfToken).mockReturnValue({
        valid: false,
        error: 'CSRF token mismatch',
      });

      const req = createRequest('POST', '/api/text');
      const res = await proxy(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toBe('Forbidden');
      expect(body.message).toContain('CSRF');
    });

    it('should include rate limit headers even on CSRF failure', async () => {
      vi.mocked(csrf.validateCsrfToken).mockReturnValue({
        valid: false,
        error: 'CSRF token mismatch',
      });

      const req = createRequest('POST', '/api/text');
      const res = await proxy(req);

      expect(res.status).toBe(403);
      // Validating Pattern 4 from E2E: Rate limit headers must exist on 403
      expect(res.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(res.headers.get('X-RateLimit-Reset')).toBeDefined();
    });

    it('should pass validation when tokens match', async () => {
      vi.mocked(csrf.validateCsrfToken).mockReturnValue({ valid: true });

      const req = createRequest(
        'POST',
        '/api/text',
        { 'x-csrf-token': 'valid-token' },
        { csrf_token: 'valid-token' }
      );

      const res = await proxy(req);

      expect(res.status).toBe(200);
      expect(csrf.validateCsrfToken).toHaveBeenCalledWith('valid-token', 'valid-token');
    });
  });

  describe('Endpoint Protection', () => {
    it('should bypass proxy for unprotected endpoints', async () => {
      const req = createRequest('POST', '/api/public');
      const res = await proxy(req);

      // NextResponse.next() returns a 200 with empty body in default mock/behavior,
      // but importantly it shouldn't trigger our rate limit/csrf logic.
      // We can verify mocks weren't called.
      expect(apiLimit.checkOpenAIUsage).not.toHaveBeenCalled();
      expect(rateLimit.checkRateLimit).not.toHaveBeenCalled();
    });

    it('should bypass proxy for non-POST methods', async () => {
      const req = createRequest('GET', '/api/text');
      const res = await proxy(req);

      expect(apiLimit.checkOpenAIUsage).not.toHaveBeenCalled();
    });
  });
});
