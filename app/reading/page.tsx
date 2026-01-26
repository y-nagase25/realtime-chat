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
import { SummaryWriting } from '@/components/reading/SummaryWriting';
import { PassageSkeleton } from '@/components/reading/PassageSkeleton';
import { ErrorMessage } from '@/components/reading/ErrorMessage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  Passage,
  VocabularyEntry,
  ComprehensionQuestion,
  SummaryFeedback,
} from '@/lib/types/reading';
import { apiPost } from '@/lib/api-client';

type ReadingPhase = 'settings' | 'reading' | 'results' | 'summary';

type VocabPopupState = {
  word: string;
  entry: VocabularyEntry | null;
  isLoading: boolean;
  position: { x: number; y: number };
  isSaved: boolean;
  error: string | null;
  context: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

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
  const [vocabPopup, setVocabPopup] = useState<VocabPopupState | null>(null);
  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);
  const [summaryFeedback, setSummaryFeedback] = useState<SummaryFeedback | null>(null);
  const [isEvaluatingSummary, setIsEvaluatingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

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

  const handleWordClick = async (word: string, context: string) => {
    const wordElement = document.querySelector(`[data-testid="word-${word.toLowerCase()}"]`);
    const rect = wordElement?.getBoundingClientRect();
    const position = rect ? { x: rect.left, y: rect.bottom } : { x: 100, y: 100 };

    setVocabPopup({
      word,
      entry: null,
      isLoading: true,
      position,
      isSaved: false,
      error: null,
      context,
    });

    try {
      const data = await apiPost<ApiResponse<VocabularyEntry>>('/api/reading/vocabulary', {
        word,
        context,
      });

      if (data.success) {
        setVocabPopup((prev) => (prev ? { ...prev, entry: data.data, isLoading: false } : null));
      } else {
        setVocabPopup((prev) =>
          prev
            ? { ...prev, isLoading: false, error: data.error || '単語の検索に失敗しました' }
            : null
        );
      }
    } catch {
      setVocabPopup((prev) =>
        prev ? { ...prev, isLoading: false, error: '単語の検索に失敗しました' } : null
      );
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleWordClick depends on state and doesn't need to be in deps
  const handleRetryVocabulary = useCallback(() => {
    if (vocabPopup) {
      handleWordClick(vocabPopup.word, vocabPopup.context);
    }
  }, [vocabPopup]);

  const handleClosePopup = useCallback(() => {
    setVocabPopup(null);
  }, []);

  const handleSaveWord = useCallback(() => {
    setVocabPopup((prev) => (prev ? { ...prev, isSaved: true } : null));
  }, []);

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

  const handleNewPassage = () => {
    setPassage(null);
    setQuestions([]);
    setQuestionResults([]);
    setSummaryFeedback(null);
    setPhase('settings');
  };

  const handleSubmitSummary = async (summary: string) => {
    if (!passage) return;

    setIsEvaluatingSummary(true);
    setSummaryError(null);
    setLastSummary(summary);

    try {
      const data = await apiPost<ApiResponse<SummaryFeedback>>('/api/reading/evaluate-summary', {
        passage: passage.content,
        userSummary: summary,
      });

      if (data.success) {
        setSummaryFeedback(data.data);
      } else {
        setSummaryError(data.error || '要約の評価に失敗しました');
      }
    } catch {
      setSummaryError('要約の評価に失敗しました');
    } finally {
      setIsEvaluatingSummary(false);
    }
  };

  const handleRetrySummary = () => {
    if (lastSummary) {
      handleSubmitSummary(lastSummary);
    }
  };

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
              onSave={handleSaveWord}
              isSaved={vocabPopup.isSaved}
              error={vocabPopup.error ?? undefined}
              onRetry={handleRetryVocabulary}
            />
          )}
        </>
      )}

      {phase === 'results' && questionResults.length > 0 && (
        <QuestionResults results={questionResults} onNewPassage={handleNewPassage} />
      )}

      {phase === 'summary' && (
        <SummaryWriting
          onSubmit={handleSubmitSummary}
          isEvaluating={isEvaluatingSummary}
          feedback={summaryFeedback}
          error={summaryError ?? undefined}
          onRetry={handleRetrySummary}
        />
      )}
    </div>
  );
}
