/**
 * PassageDisplay Component
 * Renders a reading passage with interactive word clicking
 * and grammar pattern highlighting.
 */

'use client';

import { useState } from 'react';
import type { Passage } from '@/lib/types/reading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Props for the PassageDisplay component
 */
export type PassageDisplayProps = {
  /** The passage to display */
  passage: Passage;
  /** Callback when a word is clicked */
  onWordClick: (word: string, context: string) => void;
  /** Whether to highlight grammar patterns in the passage */
  highlightGrammar?: boolean;
};

/**
 * Grammar pattern keywords mapping
 */
const GRAMMAR_KEYWORDS: Record<string, string[]> = {
  articles: ['a', 'an', 'the'],
  prepositions: ['in', 'on', 'at', 'for', 'to', 'with', 'by', 'from', 'of'],
  'present-perfect': ['have', 'has', 'had'],
  'relative-clauses': ['who', 'which', 'that', 'whose', 'whom', 'where', 'when'],
  'passive-voice': ['was', 'were', 'been', 'being'],
  conditionals: ['if', 'unless', 'would', 'could', 'might'],
};

/**
 * Strip punctuation from a word for lookup purposes
 */
function stripPunctuation(word: string): string {
  return word.replace(/[.,!?;:'"()[\]{}—–-]/g, '');
}

/**
 * Check if a word matches a grammar pattern
 */
function isGrammarWord(word: string, grammarFocus?: string): boolean {
  if (!grammarFocus) return false;
  const keywords = GRAMMAR_KEYWORDS[grammarFocus];
  if (!keywords) return false;
  return keywords.includes(stripPunctuation(word).toLowerCase());
}

/**
 * Find the sentence containing a word at a given position in the text
 */
function findContextSentence(content: string, wordIndex: number): string {
  const words = content.split(/\s+/);
  const precedingText = words.slice(0, wordIndex).join(' ');
  const followingText = words.slice(wordIndex).join(' ');

  const sentenceStart = precedingText.lastIndexOf('.') + 1;
  const sentenceEnd = followingText.indexOf('.');

  const before = precedingText.slice(sentenceStart).trim();
  const after =
    sentenceEnd >= 0 ? followingText.slice(0, sentenceEnd + 1).trim() : followingText.trim();

  return `${before} ${after}`.trim();
}

/**
 * PassageDisplay - Displays a reading passage with interactive words
 */
export function PassageDisplay({
  passage,
  onWordClick,
  highlightGrammar = false,
}: PassageDisplayProps) {
  const [clickedWord, setClickedWord] = useState<string | null>(null);

  const words = passage.content.split(/\s+/);

  const handleWordClick = (word: string, index: number) => {
    const cleanWord = stripPunctuation(word);
    if (!cleanWord) return;

    setClickedWord(cleanWord.toLowerCase());
    const context = findContextSentence(passage.content, index);
    onWordClick(cleanWord, context);
  };

  return (
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
        <article data-testid="passage-content" className="leading-relaxed text-lg">
          {words.map((word, index) => {
            const cleanWord = stripPunctuation(word);
            const grammarMatch = highlightGrammar && isGrammarWord(word, passage.grammarFocus);
            const isClicked = clickedWord === cleanWord.toLowerCase();

            const wordClasses = [
              'cursor-pointer',
              'inline',
              'rounded',
              'px-0.5',
              'transition-colors',
              'hover:bg-blue-100',
              'focus-visible:outline-none',
              'focus-visible:ring-2',
              'focus-visible:ring-ring',
              grammarMatch
                ? 'grammar-highlight bg-purple-50 text-purple-900 border-b border-purple-300'
                : '',
              isClicked ? 'bg-blue-200' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <span key={`${word}-${index}`}>
                <button
                  type="button"
                  data-testid={cleanWord ? `word-${cleanWord.toLowerCase()}` : undefined}
                  data-grammar-highlight={grammarMatch ? 'true' : undefined}
                  data-clicked={isClicked ? 'true' : undefined}
                  className={wordClasses}
                  onClick={() => handleWordClick(word, index)}
                  aria-label={cleanWord}
                >
                  {word}
                </button>
                {index < words.length - 1 && ' '}
              </span>
            );
          })}
        </article>
      </CardContent>
    </Card>
  );
}
