/**
 * Speaking Practice Page
 * Main page for practicing speaking with AI scoring
 */

import { getQuestions } from '@/lib/loaders';
import { SpeakingPracticeContainer } from '@/components/speaking/SpeakingPracticeContainer';

export default async function SpeakingPracticePage() {
  const { data: questions } = await getQuestions();

  return (
    <>
      <h1 className="text-3xl font-bold">Speaking Practice</h1>
      {!questions || questions.length === 0 ? (
        <p className="text-muted-foreground">No questions available.</p>
      ) : (
        <SpeakingPracticeContainer questions={questions} />
      )}
    </>
  );
}
