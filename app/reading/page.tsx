/**
 * Reading Practice Page
 * Allows users to practice English reading with AI-generated passages
 */

'use client';

import { useState, useCallback } from 'react';
import { ReadingSettings, type ReadingSettingsValue } from '@/components/reading/ReadingSettings';
import { PassageDisplay } from '@/components/reading/PassageDisplay';
import { VocabularyPopup } from '@/components/reading/VocabularyPopup';
import {
  ComprehensionQuestions,
  type UserAnswer,
} from '@/components/reading/ComprehensionQuestions';
import { QuestionResults, type QuestionResult } from '@/components/reading/QuestionResults';
import { ReadingTimer } from '@/components/reading/ReadingTimer';
import { PassageSkeleton } from '@/components/reading/PassageSkeleton';
import { ErrorMessage } from '@/components/reading/ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Passage, ComprehensionQuestion } from '@/lib/types/reading';
import type { ReadingSession } from '@/lib/types/local-storage';
import type { ApiResponse } from '@/lib/types/api';
import { apiPost } from '@/lib/api-client';
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

export default function ReadingPage() {
  const [phase, setPhase] = useState<ReadingPhase>('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSettings, setLastSettings] = useState<ReadingSettingsValue | null>(null);
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

  const handleSubmit = async (settings: ReadingSettingsValue) => {
    setIsLoading(true);
    setError(null);
    setLastSettings(settings);

    try {
      const data = await apiPost<ApiResponse<Passage>>('/api/reading/generate', settings);

      if (!data.success) {
        throw new Error(data.error || '文章の生成に失敗しました');
      }

      setPassage(data.data);
      setQuestions(data.data.questions);
      setPhase('reading');
    } catch (err) {
      setError(err instanceof Error ? err.message : '文章の生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleRetryGenerate = () => {
    if (lastSettings) {
      handleSubmit(lastSettings);
    }
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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">リーディング練習</h1>
        <p className="mt-2 text-muted-foreground">AIが生成した英文を読んで、理解力を高めましょう</p>
      </div>

      {phase === 'settings' && (
        <>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>設定</CardTitle>
              <CardDescription>難易度とトピックを選んで文章を生成</CardDescription>
            </CardHeader>
            <CardContent>
              <ReadingSettings onSubmit={handleSubmit} isLoading={isLoading} />
              {error && (
                <div className="mt-4">
                  <ErrorMessage message={error} onRetry={handleRetryGenerate} />
                </div>
              )}
            </CardContent>
          </Card>
          {isLoading && (
            <div className="mt-4">
              <PassageSkeleton />
            </div>
          )}
        </>
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

      {phase === 'results' && questionResults.length > 0 && passage && (
        <QuestionResults
          results={questionResults}
          passage={passage}
          onSaveHistory={handleComplete}
        />
      )}
    </div>
  );
}
