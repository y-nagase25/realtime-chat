import { Histories } from '@/components/history/Histories';

export default function HistoryPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">学習履歴</h1>
        <p className="mt-2 text-muted-foreground">過去の学習履歴を確認できます</p>
      </div>
      <Histories />
    </div>
  );
}
