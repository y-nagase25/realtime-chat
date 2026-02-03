'use client';

import { ReadingSettings } from '@/components/reading/ReadingSettings';
import { PassageDisplay } from '@/components/reading/PassageDisplay';
import { QuestionResults } from '@/components/reading/QuestionResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Passage, QuestionResult } from '@/lib/types/reading';
import type { ReadingSession } from '@/lib/types/local-storage';
import { useLocalStorage, READING_HISTORY_STORAGE_KEY } from '@/lib/hooks/use-local-storage';
import { buildSessionData } from '@/lib/utils/reading-session';
import { useReadingReducer } from '@/lib/hooks/use-reading-reducer';

export function ReadingPageClient() {
  const [readingState, dispatch] = useReadingReducer();

  // Custom hooks
  const { add: addReadingHistory } = useLocalStorage<ReadingSession>(READING_HISTORY_STORAGE_KEY);

  /**
   * Proceed to reading phase with generated passage
   */
  const handleStartReading = (passage: Passage) => {
    dispatch({ type: 'START_READING', payload: passage });
  };

  /**
   * Proceed to results phase with calculated results
   */
  const handleSubmitAnswers = (results: QuestionResult[]) => {
    dispatch({ type: 'SUBMIT_ANSWERS', payload: results });
  };

  /**
   * Finalize session: save history and reset to settings
   */
  const handleReset = () => {
    if (readingState.phase === 'results') {
      try {
        const sessionData = buildSessionData(readingState.passage, readingState.results);
        addReadingHistory(sessionData);
      } catch (error) {
        console.error('Failed to save reading history:', error);
      }
    }

    dispatch({ type: 'RESET' });
  };

  return (
    <>
      {readingState.phase === 'settings' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>設定</CardTitle>
            <CardDescription>難易度とトピックを選んで文章を生成</CardDescription>
          </CardHeader>
          <CardContent>
            <ReadingSettings handleStartReading={handleStartReading} />
          </CardContent>
        </Card>
      )}

      {readingState.phase === 'reading' && (
        <PassageDisplay
          passage={readingState.passage}
          questions={readingState.questions}
          handleSubmitAnswers={handleSubmitAnswers}
        />
      )}

      {readingState.phase === 'results' && (
        <QuestionResults results={readingState.results} handleReset={handleReset} />
      )}
    </>
  );
}
