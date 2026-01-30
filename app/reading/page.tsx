import { AppLayout } from '@/components/AppLayout';
import { ReadingPageClient } from './page-client';

export default function ReadingPage() {
  return (
    <AppLayout
      title="リーディング練習"
      description="AIが生成した英文を読んで、理解力を高めましょう"
    >
      <ReadingPageClient />
    </AppLayout>
  );
}
