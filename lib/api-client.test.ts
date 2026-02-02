import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiPost, apiPostFormData, fetchCsrfToken } from './api-client';
import { ApiError, CsrfError, RateLimitError } from './errors';

// Mock dependencies
vi.mock('@/lib/csrf', () => ({
  CSRF_COOKIE_NAME: 'csrf_token',
  CSRF_HEADER_NAME: 'x-csrf-token',
}));

describe('api-client', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    // We need to ensure document.cookie is working as expected or mocked properly
    // in JSDOM environment.
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  describe('fetchCsrfToken', () => {
    it('should fetch CSRF token successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      await fetchCsrfToken();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/csrf',
        expect.objectContaining({
          method: 'GET',
          credentials: 'same-origin',
        })
      );
    });

    it('should throw ApiError on failure', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(fetchCsrfToken()).rejects.toThrow(ApiError);
    });
  });

  describe('apiPost', () => {
    it('should make a successful POST request with CSRF token from cookie', async () => {
      document.cookie = 'csrf_token=test-token';

      const mockResponse = { data: 'success' };
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await apiPost('/api/test', { key: 'value' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': 'test-token',
          },
          body: JSON.stringify({ key: 'value' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch CSRF token if missing in cookie', async () => {
      // Mock fetchCsrfToken call (first fetch)
      vi.mocked(global.fetch).mockImplementationOnce(async (url) => {
        if (url === '/api/csrf') {
          // Simulate setting cookie
          document.cookie = 'csrf_token=fetched-token';
          return { ok: true } as Response;
        }
        return { ok: false } as Response;
      });

      // Mock actual API call (second fetch)
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await apiPost('/api/test');

      // Should have called csrf endpoint first
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/csrf', expect.anything());
      // Then the actual endpoint with the new token
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-csrf-token': 'fetched-token',
          }),
        })
      );
    });

    it('should throw CsrfError if unable to obtain token', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: true } as Response);
      await expect(apiPost('/api/test')).rejects.toThrow(CsrfError);
    });

    it('should throw CsrfError on 403 response', async () => {
      document.cookie = 'csrf_token=token';
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as Response);

      await expect(apiPost('/api/test')).rejects.toThrow(CsrfError);
    });

    it('should throw RateLimitError on 429 response', async () => {
      document.cookie = 'csrf_token=token';
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '120' }),
      } as Response);

      await expect(apiPost('/api/test')).rejects.toThrow(RateLimitError);
    });

    it('should throw ApiError on generic failure', async () => {
      document.cookie = 'csrf_token=token';
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      } as Response);

      await expect(apiPost('/api/test')).rejects.toThrow(ApiError);
    });
  });

  describe('apiPostFormData', () => {
    it('should send FormData with correct headers', async () => {
      document.cookie = 'csrf_token=token';
      const formData = new FormData();
      formData.append('file', 'test');

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await apiPostFormData('/api/upload', formData);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'x-csrf-token': 'token',
            // Content-Type should NOT be set manually for FormData
          },
          body: formData,
        })
      );
    });
  });
});
