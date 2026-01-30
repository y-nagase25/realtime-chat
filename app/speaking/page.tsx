import { getQuestions } from '@/lib/loaders';
import { SpeakingPracticeContainer } from '@/components/speaking/SpeakingPracticeContainer';
import { AppLayout } from '@/components/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { notFound } from 'next/navigation';

const item = NAV_ITEMS.find((item) => item.label === 'Speaking');

export default async function SpeakingPage() {
  if (!item) return notFound();
  const { data: questions } = await getQuestions();

  return (
    <AppLayout title={item.label} description={item.description}>
      {!questions || questions.length === 0 ? (
        <NoQuestionsAvailable />
      ) : (
        <SpeakingPracticeContainer questions={questions} />
      )}
    </AppLayout>
  );
}

function NoQuestionsAvailable() {
  return (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircleIcon />
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription>
        問題を取得できませんでした。しばらくしてから再度お試しください。
      </AlertDescription>
    </Alert>
  );
}
