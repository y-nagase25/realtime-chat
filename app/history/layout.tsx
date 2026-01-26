import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '学習履歴',
  description: '過去の学習履歴を確認できます',
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
