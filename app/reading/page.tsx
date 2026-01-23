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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Passage, VocabularyEntry, ComprehensionQuestion } from '@/lib/types/reading';
import { apiPost } from '@/lib/api-client';

type ReadingPhase = 'settings' | 'reading' | 'questions' | 'results' | 'summary';

type VocabPopupState = {
  word: string;
  entry: VocabularyEntry | null;
  isLoading: boolean;
  position: { x: number; y: number };
  isSaved: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export default function ReadingPage() {
  const [phase, setPhase] = useState<ReadingPhase>('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vocabPopup, setVocabPopup] = useState<VocabPopupState | null>(null);
  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([]);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);

  const handleSubmit = async (settings: ReadingSettingsValue) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiPost<ApiResponse<Passage>>('/api/reading/generate', settings);

      if (!data.success) {
        throw new Error(data.error || '文章の生成に失敗しました');
      }

      setPassage(data.data);
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
    });

    try {
      const data = await apiPost<ApiResponse<VocabularyEntry>>('/api/reading/vocabulary', {
        word,
        context,
      });

      if (data.success) {
        setVocabPopup((prev) => (prev ? { ...prev, entry: data.data, isLoading: false } : null));
      } else {
        setVocabPopup((prev) => (prev ? { ...prev, isLoading: false } : null));
      }
    } catch {
      setVocabPopup((prev) => (prev ? { ...prev, isLoading: false } : null));
    }
  };

  const handleClosePopup = useCallback(() => {
    setVocabPopup(null);
  }, []);

  const handleSaveWord = useCallback(() => {
    setVocabPopup((prev) => (prev ? { ...prev, isSaved: true } : null));
  }, []);

  const handleFinishReading = async () => {
    setVocabPopup(null);
    setPhase('questions');

    if (!passage) return;

    try {
      const data = await apiPost<ApiResponse<{ questions: ComprehensionQuestion[] }>>(
        '/api/reading/questions',
        {
          passage: passage.content,
          level: passage.level,
        }
      );

      if (data.success) {
        setQuestions(data.data.questions);
      }
    } catch {
      // Questions loading failed silently
    }
  };

  const handleSubmitAnswers = (_answers: Record<string, UserAnswer>) => {
    setIsSubmittingAnswers(true);
    // Results will be computed in a later task (3.5)
    setPhase('results');
    setIsSubmittingAnswers(false);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">リーディング練習</h1>
        <p className="mt-2 text-muted-foreground">AIが生成した英文を読んで、理解力を高めましょう</p>
      </div>

      {phase === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>設定</CardTitle>
            <CardDescription>難易度とトピックを選んで文章を生成</CardDescription>
          </CardHeader>
          <CardContent>
            <ReadingSettings onSubmit={handleSubmit} isLoading={isLoading} />
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      {phase === 'reading' && passage && (
        <>
          <PassageDisplay
            passage={passage}
            onWordClick={handleWordClick}
            onFinishReading={handleFinishReading}
            highlightGrammar={!!passage.grammarFocus}
          />
          {vocabPopup && (
            <VocabularyPopup
              word={vocabPopup.word}
              entry={vocabPopup.entry}
              isLoading={vocabPopup.isLoading}
              position={vocabPopup.position}
              onClose={handleClosePopup}
              onSave={handleSaveWord}
              isSaved={vocabPopup.isSaved}
            />
          )}
        </>
      )}

      {phase === 'questions' && questions.length > 0 && (
        <ComprehensionQuestions
          questions={questions}
          onSubmit={handleSubmitAnswers}
          isSubmitting={isSubmittingAnswers}
        />
      )}
    </div>
  );
}
