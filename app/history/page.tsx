import { Histories } from '@/components/history/Histories';
import { AppLayout } from '@/components/AppLayout';

export default function HistoryPage() {
  return (
    <AppLayout title="学習履歴" description="過去の学習履歴を確認できます">
      <Histories />
    </AppLayout>
  );
}
