import 'server-only';

import type { NextRequest } from 'next/server';
import type { DailyUsageLimit } from './types/usage-stats';

export async function checkUsageLimit(request: NextRequest): Promise<DailyUsageLimit> {
  const origin = request.nextUrl.origin;
  const limitRes = await fetch(`${origin}/api/usage/limit`);
  if (limitRes.ok) {
    const limitData = await limitRes.json();
    return limitData;
  }

  throw new Error('Failed to fetch usage limit data');
}
