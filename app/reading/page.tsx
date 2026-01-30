import { AppLayout } from '@/components/AppLayout';
import { ReadingPageClient } from './page-client';
import { NAV_ITEMS } from '@/lib/constants';
import { notFound } from 'next/navigation';

const item = NAV_ITEMS.find((item) => item.label === 'Reading');

export default function ReadingPage() {
  if (!item) return notFound();
  return (
    <AppLayout title={item.label} description={item.description}>
      <ReadingPageClient />
    </AppLayout>
  );
}
