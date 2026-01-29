import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'リーディング練習',
  description: 'AIが生成した英文を読んで、理解力を高めましょう',
};

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
