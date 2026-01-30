import { Histories } from '@/components/history/Histories';
import { AppLayout } from '@/components/AppLayout';
import { NAV_ITEMS } from '@/lib/constants';
import { notFound } from 'next/navigation';

const item = NAV_ITEMS.find((item) => item.label === 'History');

export default function HistoryPage() {
  if (!item) return notFound();
  return (
    <AppLayout title={item.label} description={item.description}>
      <Histories />
    </AppLayout>
  );
}
