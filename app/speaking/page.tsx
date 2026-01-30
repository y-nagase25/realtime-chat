import { getQuestions } from '@/lib/loaders';
import { SpeakingPracticeContainer } from '@/components/speaking/SpeakingPracticeContainer';
import { AppLayout } from '@/components/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

export default async function SpeakingPage() {
  const { data: questions } = await getQuestions();

  return (
    <AppLayout
      title="スピーキング練習"
      description="練習したいフレーズを選んで、AIとスピーキング練習"
    >
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
