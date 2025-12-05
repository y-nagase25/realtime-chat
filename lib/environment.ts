import 'server-only';
import { notFound } from 'next/navigation';

export const env = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isPreview: process.env.VERCEL_ENV === 'preview',
} as const;

export function prodNotFound() {
  if (env.isProduction) notFound();
}
