/**
 * Speaking Practice Page
 * Main page for practicing speaking with AI scoring
 */

import { getQuestions } from '@/lib/loaders';
import { SpeakingPracticeContainer } from '@/components/speaking/SpeakingPracticeContainer';
import { SPEAKING_LABELS } from '@/lib/constants/speaking-labels';

export default async function SpeakingPracticePage() {
  const { data: questions } = await getQuestions();

  return (
    <>
      <h1 className="text-3xl font-bold">{SPEAKING_LABELS.speakingPractice}</h1>
      {!questions || questions.length === 0 ? (
        <p className="text-muted-foreground">{SPEAKING_LABELS.noQuestionsAvailable}</p>
      ) : (
        <SpeakingPracticeContainer questions={questions} />
      )}
    </>
  );
}
