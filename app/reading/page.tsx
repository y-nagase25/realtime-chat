/**
 * Reading Practice Page
 * Allows users to practice English reading with AI-generated passages
 */

'use client';

import { useState, useCallback } from 'react';
import { ReadingSettings, type ReadingSettingsValue } from '@/components/reading/ReadingSettings';
import { PassageDisplay } from '@/components/reading/PassageDisplay';
import { VocabularyPopup } from '@/components/reading/VocabularyPopup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Passage, VocabularyEntry } from '@/lib/types/reading';

type ReadingPhase = 'settings' | 'reading' | 'questions' | 'results' | 'summary';

type VocabPopupState = {
  word: string;
  entry: VocabularyEntry | null;
  isLoading: boolean;
  position: { x: number; y: number };
  isSaved: boolean;
};

export default function ReadingPage() {
  const [phase, setPhase] = useState<ReadingPhase>('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vocabPopup, setVocabPopup] = useState<VocabPopupState | null>(null);

  const handleSubmit = async (settings: ReadingSettingsValue) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reading/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

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
    // Get click position from the word element
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
      const response = await fetch('/api/reading/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context }),
      });

      const data = await response.json();

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

  const handleFinishReading = () => {
    setVocabPopup(null);
    setPhase('questions');
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
    </div>
  );
}
