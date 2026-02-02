'use client';

import { useState, useCallback } from 'react';
import { ReadingSettings } from '@/components/reading/ReadingSettings';
import { PassageDisplay } from '@/components/reading/PassageDisplay';
import { VocabularyPopup } from '@/components/reading/VocabularyPopup';
import { ComprehensionQuestions } from '@/components/reading/ComprehensionQuestions';
import { QuestionResults } from '@/components/reading/QuestionResults';
import { ReadingTimer } from '@/components/reading/ReadingTimer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  Passage,
  ComprehensionQuestion,
  UserAnswer,
  QuestionResult,
} from '@/lib/types/reading';
import type { ReadingSession } from '@/lib/types/local-storage';
import { useLocalStorage, READING_HISTORY_STORAGE_KEY } from '@/lib/hooks/use-local-storage';
import { useVocabPopup } from '@/lib/hooks/use-vocab-popup';
import { buildSessionData } from '@/lib/utils/reading-session';

type ReadingPhase = 'settings' | 'reading' | 'results' | 'summary';

/**
 * Check if user's answer is correct for a given question
 */
function checkAnswer(question: ComprehensionQuestion, userAnswer: UserAnswer): boolean {
  switch (question.type) {
    case 'multiple-choice':
      return userAnswer === question.correctAnswer;
    case 'true-false':
      return userAnswer === question.correctAnswer;
    case 'fill-in-blank': {
      const normalized = String(userAnswer).trim().toLowerCase();
      const correctNormalized = question.correctAnswer.trim().toLowerCase();
      if (normalized === correctNormalized) return true;
      return question.acceptableAnswers.some((a) => a.trim().toLowerCase() === normalized);
    }
    case 'summary':
      return false;
  }
}

export function ReadingPageClient() {
  // global state for reading practice
  const [phase, setPhase] = useState<ReadingPhase>('settings');
  const [passage, setPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);

  // Custom hooks
  const { add: addReadingHistory } = useLocalStorage<ReadingSession>(READING_HISTORY_STORAGE_KEY);
  const {
    vocabPopup,
    isSaved,
    handleWordClick,
    handleRetry: handleRetryVocabulary,
    handleSave: handleSaveVocabulary,
    handleClose: handleClosePopup,
  } = useVocabPopup();

  const handleSubmitAnswers = (answers: Record<string, UserAnswer>) => {
    setIsSubmittingAnswers(true);

    const regularQuestions = questions.filter((q) => q.type !== 'summary');
    const results = regularQuestions.map((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);
      return { question, userAnswer, isCorrect };
    });

    setQuestionResults(results);
    setPhase('results');
    setIsSubmittingAnswers(false);
  };

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
        <>
          <PassageDisplay
            passage={passage}
            onWordClick={handleWordClick}
            highlightGrammar={!!passage.grammarFocus}
          />
          <div className="mt-4">
            <ReadingTimer isRunning={true} wordCount={passage.wordCount} level={passage.level} />
          </div>
          {questions.length > 0 && (
            <div className="mt-6">
              <ComprehensionQuestions
                questions={questions}
                onSubmit={handleSubmitAnswers}
                isSubmitting={isSubmittingAnswers}
                passageContent={passage.content}
              />
            </div>
          )}
          {vocabPopup && (
            <VocabularyPopup
              word={vocabPopup.word}
              entry={vocabPopup.entry}
              isLoading={vocabPopup.isLoading}
              position={vocabPopup.position}
              onClose={handleClosePopup}
              error={vocabPopup.error ?? undefined}
              onRetry={handleRetryVocabulary}
              onSave={handleSaveVocabulary}
              isSaved={isSaved}
            />
          )}
        </>
      )}

      {phase === 'results' && questionResults.length > 0 && (
        <QuestionResults results={questionResults} onSaveHistory={handleComplete} />
      )}
    </>
  );
}
