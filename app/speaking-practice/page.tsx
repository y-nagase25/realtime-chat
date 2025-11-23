/**
 * Speaking Practice Page
 * Main page for practicing speaking with AI scoring
 */

import { getQuestions } from '@/lib/loaders';
import { Questions } from '@/components/Questions';
import { SpeakingPractice } from '@/components/speaking';

export default async function SpeakingPracticePage() {
  const { data: questions } = await getQuestions();

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Speaking Practice</h1>
        <p className="text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  const currentQuestion = questions[0];

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Speaking Practice</h1>

      {/* Question Display */}
      <Questions questions={questions} />

      {/* Speaking Practice Component */}
      <SpeakingPractice question={currentQuestion} />
    </div>
  );
}
