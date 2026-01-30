import { type NextRequest, NextResponse } from 'next/server';
import { validateCsrfToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf';
import { checkRateLimit } from '@/lib/rate-limit';
import { checkOpenAIUsage } from '@/lib/rate-limit/api';

/**
 * Protected API endpoints that require CSRF validation
 */
const PROTECTED_ENDPOINTS = [
  '/api/realtime/session',
  '/api/transcribe',
  '/api/text',
  '/api/speaking/score',
  // Reading Practice API endpoints
  '/api/reading/generate',
  '/api/reading/vocabulary',
  '/api/reading/evaluate-summary',
];

/**
 * Get client IP address from request headers
 */
function getClientIp(request: NextRequest): string {
  // Check x-forwarded-for header (set by reverse proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Get the first IP in the list (original client)
    return forwardedFor.split(',')[0].trim();
  }

  // Check x-real-ip header
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default value for local development
  return '127.0.0.1';
}

/**
 * Check if the endpoint is protected
 */
function isProtectedEndpoint(pathname: string): boolean {
  return PROTECTED_ENDPOINTS.some((endpoint) => pathname.startsWith(endpoint));
}

/**
 * Create a JSON error response
 */
function createErrorResponse(
  status: number,
  error: string,
  message: string,
  headers?: Record<string, string>
): NextResponse {
  const response = NextResponse.json({ error, message }, { status });

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process protected endpoints with POST method
  if (!isProtectedEndpoint(pathname) || request.method !== 'POST') {
    return NextResponse.next();
  }

  const result = await checkOpenAIUsage();
  if (!result.allowed) {
    return createErrorResponse(429, 'Usage Limit Exceeded', 'Retry after next 24 hours');
  }

  const clientIp = getClientIp(request);

  // 1. Rate limiting check (do this first to reject early)
  const rateLimitResult = checkRateLimit(clientIp, pathname);

  // Set rate limit headers on all responses
  const rateLimitHeaders: Record<string, string> = {
    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(rateLimitResult.resetAt / 1000).toString(),
  };

  if (!rateLimitResult.allowed) {
    return createErrorResponse(
      429,
      'Too Many Requests',
      'Rate limit exceeded. Please try again later.',
      {
        ...rateLimitHeaders,
        'Retry-After': rateLimitResult.retryAfter?.toString() ?? '60',
      }
    );
  }

  // 2. CSRF validation
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  const csrfResult = validateCsrfToken(cookieToken, headerToken ?? undefined);

  if (!csrfResult.valid) {
    return createErrorResponse(403, 'Forbidden', 'Invalid or missing CSRF token', rateLimitHeaders);
  }

  // Both checks passed, continue with rate limit headers
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(rateLimitHeaders)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    '/api/realtime/session',
    '/api/transcribe',
    '/api/text',
    '/api/speaking/score',
    '/api/reading/generate',
    '/api/reading/vocabulary',
    '/api/reading/evaluate-summary',
  ],
};
