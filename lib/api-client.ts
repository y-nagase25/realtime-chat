import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf';
import { ApiError, CsrfError, RateLimitError } from '@/lib/errors';

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return undefined;
}

/**
 * Fetch CSRF token from the server
 * This will set the csrf_token cookie
 */
export async function fetchCsrfToken(): Promise<void> {
  const response = await fetch('/api/csrf', {
    method: 'GET',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to fetch CSRF token');
  }
}

/**
 * Ensure CSRF token exists, fetching if necessary
 */
async function ensureCsrfToken(): Promise<string> {
  let token = getCsrfTokenFromCookie();

  if (!token) {
    await fetchCsrfToken();
    token = getCsrfTokenFromCookie();
  }

  if (!token) {
    throw new CsrfError('Failed to obtain CSRF token');
  }

  return token;
}

/**
 * Handle API response errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 403) {
    // CSRF error - token may have expired
    throw new CsrfError('CSRF token invalid or expired');
  }

  if (response.status === 429) {
    const retryAfter = Number.parseInt(response.headers.get('Retry-After') ?? '60', 10);
    throw new RateLimitError(retryAfter);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message ?? errorData.error);
  }

  return response.json();
}

/**
 * Make a POST request with CSRF token
 */
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  const csrfToken = await ensureCsrfToken();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [CSRF_HEADER_NAME]: csrfToken,
    },
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * Make a POST request with FormData and CSRF token
 */
export async function apiPostFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const csrfToken = await ensureCsrfToken();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      [CSRF_HEADER_NAME]: csrfToken,
    },
    credentials: 'same-origin',
    body: formData,
  });

  return handleResponse<T>(response);
}
