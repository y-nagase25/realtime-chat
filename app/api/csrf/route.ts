import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateCsrfToken, getCsrfCookieOptions, CSRF_COOKIE_NAME } from '@/lib/csrf';

/**
 * GET /api/csrf
 * Generate and set a CSRF token in a cookie
 * Returns 204 No Content with Set-Cookie header
 */
export async function GET() {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME);

  // If a valid token already exists, don't generate a new one
  if (existingToken?.value) {
    return new NextResponse(null, { status: 204 });
  }

  // Generate a new CSRF token
  const token = generateCsrfToken();
  const cookieOptions = getCsrfCookieOptions();

  // Set the cookie
  cookieStore.set(CSRF_COOKIE_NAME, token, cookieOptions);

  return new NextResponse(null, { status: 204 });
}
