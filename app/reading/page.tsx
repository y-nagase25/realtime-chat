/**
 * Reading Practice Page
 * Allows users to practice English reading with AI-generated passages
 */

'use client';

import { useState } from 'react';
import { ReadingSettings, type ReadingSettingsValue } from '@/components/reading/ReadingSettings';
import { PassageDisplay } from '@/components/reading/PassageDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Passage } from '@/lib/types/reading';

type ReadingPhase = 'settings' | 'reading' | 'questions' | 'results' | 'summary';

export default function ReadingPage() {
  const [phase, setPhase] = useState<ReadingPhase>('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleWordClick = (_word: string, _context: string) => {
    // Will be wired up with VocabularyPopup in a later task
  };

  const handleFinishReading = () => {
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
        <PassageDisplay
          passage={passage}
          onWordClick={handleWordClick}
          onFinishReading={handleFinishReading}
          highlightGrammar={!!passage.grammarFocus}
        />
      )}
    </div>
  );
}
