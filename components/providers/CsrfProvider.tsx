'use client';

import { useEffect, type ReactNode } from 'react';
import { fetchCsrfToken } from '@/lib/api-client';

type CsrfProviderProps = {
  children: ReactNode;
};

/**
 * CSRF Provider component
 * Fetches CSRF token on mount to ensure it's available for API calls
 */
export function CsrfProvider({ children }: CsrfProviderProps) {
  useEffect(() => {
    // Fetch CSRF token on mount
    fetchCsrfToken().catch((error) => {
      console.error('Failed to fetch CSRF token:', error);
    });
  }, []);

  return <>{children}</>;
}
