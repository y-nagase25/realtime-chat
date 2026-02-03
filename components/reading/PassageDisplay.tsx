/**
 * PassageDisplay Component
 * Renders a reading passage with interactive word clicking
 * and grammar pattern highlighting.
 */

'use client';

import { useState } from 'react';
import type {
  ComprehensionQuestion,
  Passage,
  QuestionResult,
  UserAnswer,
} from '@/lib/types/reading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ReadingTimer } from './ReadingTimer';
import { ComprehensionQuestions } from './ComprehensionQuestions';
import { useVocabPopup } from '@/lib/hooks/use-vocab-popup';
import { VocabularyPopup } from './VocabularyPopup';
import { GeneratedWords } from './GeneratedWords';
import { findContextSentence, stripPunctuation } from '@/lib/utils/string';
import { checkAnswer } from '@/lib/utils/reading-session';

/**
 * Props for the PassageDisplay component
 */
export type PassageDisplayProps = {
  /** The passage to display */
  passage: Passage;
  /** The comprehension questions for the passage */
  questions: ComprehensionQuestion[];
  /** Callback when answers are submitted */
  handleSubmitAnswers: (results: QuestionResult[]) => void;
};

/**
 * PassageDisplay - Displays a reading passage with interactive words
 */
export function PassageDisplay({ passage, questions, handleSubmitAnswers }: PassageDisplayProps) {
  const [clickedWord, setClickedWord] = useState<string | null>(null);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);
  const {
    vocabPopup,
    isSaved,
    handleWordClick,
    handleRetry: handleRetryVocabulary,
    handleSave: handleSaveVocabulary,
    handleClose: handleClosePopup,
  } = useVocabPopup();

  const words = passage.content.split(/\s+/);

  const onWordClick = (word: string, index: number) => {
    const cleanWord = stripPunctuation(word);
    if (!cleanWord) return;

    setClickedWord(cleanWord.toLowerCase());
    const context = findContextSentence(passage.content, index);
    handleWordClick(cleanWord, context);
  };

  const onSubmit = (answers: Record<string, UserAnswer>) => {
    setIsSubmittingAnswers(true);

    const regularQuestions = questions.filter((q) => q.type !== 'summary');
    const results = regularQuestions.map((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAnswer(question, userAnswer);
      return { question, userAnswer, isCorrect };
    });

    setIsSubmittingAnswers(false);
    handleSubmitAnswers(results);
  };

  return (
    <>
      <Card data-testid="passage-display">
        <CardHeader className="space-y-2">
          <h2 data-testid="passage-title" className="text-2xl font-bold">
            {passage.title}
          </h2>
          <div
            data-testid="passage-metadata"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span>{passage.level}</span>
            <span aria-hidden="true">•</span>
            <span>{passage.wordCount} words</span>
            <span aria-hidden="true">•</span>
            <span>約{passage.estimatedReadingTimeMinutes}分</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <GeneratedWords
            words={words}
            passage={passage}
            clickedWord={clickedWord}
            onWordClick={onWordClick}
          />
        </CardContent>
      </Card>

      <div className="mt-4">
        <ReadingTimer isRunning={true} wordCount={passage.wordCount} level={passage.level} />
      </div>

      {questions.length > 0 && (
        <div className="mt-6">
          <ComprehensionQuestions
            questions={questions}
            onSubmit={onSubmit}
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
  );
}
