'use client';

import { useState, useCallback } from 'react';
import { ReadingSettings } from '@/components/reading/ReadingSettings';
import { PassageDisplay } from '@/components/reading/PassageDisplay';
import { QuestionResults } from '@/components/reading/QuestionResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Passage, ComprehensionQuestion, QuestionResult } from '@/lib/types/reading';
import type { ReadingSession } from '@/lib/types/local-storage';
import { useLocalStorage, READING_HISTORY_STORAGE_KEY } from '@/lib/hooks/use-local-storage';
import { buildSessionData } from '@/lib/utils/reading-session';

type ReadingPhase = 'settings' | 'reading' | 'results' | 'summary';

export function ReadingPageClient() {
  // global state for reading practice
  const [phase, setPhase] = useState<ReadingPhase>('settings');
  const [passage, setPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);

  // Custom hooks
  const { add: addReadingHistory } = useLocalStorage<ReadingSession>(READING_HISTORY_STORAGE_KEY);

  /**
   * Reset all state to return to settings phase
   */
  const resetState = useCallback(() => {
    setPassage(null);
    setQuestions([]);
    setQuestionResults([]);
    setPhase('settings');
  }, []);

  /**
   * Handle completion of reading session - saves history and resets state
   */
  const handleComplete = useCallback(() => {
    if (!passage) {
      // If passage is null for some reason, just reset state
      resetState();
      return;
    }

    try {
      // Build session data and save to localStorage
      const sessionData = buildSessionData(passage, questionResults);
      addReadingHistory(sessionData);
    } catch {
      // Log error but continue with navigation
      // We don't want to block the user from proceeding
    }

    // Reset state and navigate to settings
    resetState();
  }, [passage, questionResults, addReadingHistory, resetState]);

  /**
   * Proceed to reading phase
   */
  const proceedToReading = useCallback((data: Passage) => {
    setPassage(data);
    setQuestions(data.questions);
    setPhase('reading');
  }, []);

  /**
   * Proceed to results phase
   */
  const proceedToResults = useCallback((results: QuestionResult[]) => {
    setQuestionResults(results);
    setPhase('results');
  }, []);

  return (
    <>
      {phase === 'settings' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>設定</CardTitle>
            <CardDescription>難易度とトピックを選んで文章を生成</CardDescription>
          </CardHeader>
          <CardContent>
            <ReadingSettings proceedToReading={proceedToReading} />
          </CardContent>
        </Card>
      )}

      {phase === 'reading' && passage && (
        <PassageDisplay
          passage={passage}
          questions={questions}
          proceedToResults={proceedToResults}
        />
      )}

      {phase === 'results' && questionResults.length > 0 && (
        <QuestionResults results={questionResults} onSaveHistory={handleComplete} />
      )}
    </>
  );
}
