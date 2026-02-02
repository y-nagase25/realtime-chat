'use client';

import { cn } from '@/lib/utils';
import type { Passage } from '@/lib/types/reading';
import { isGrammarWord, stripPunctuation } from '@/lib/utils/string';

type GeneratedWordsProps = {
  words: string[];
  passage: Passage;
  clickedWord: string | null;
  onWordClick: (word: string, index: number) => void;
};

export function GeneratedWords({ words, passage, clickedWord, onWordClick }: GeneratedWordsProps) {
  return (
    <article data-testid="passage-content" className="leading-relaxed text-lg">
      {words.map((word, index) => {
        return (
          <Word
            key={`${word}-${index}`}
            word={word}
            index={index}
            passage={passage}
            clickedWord={clickedWord}
            onWordClick={onWordClick}
            wordsLength={words.length}
          />
        );
      })}
    </article>
  );
}

function Word({
  word,
  index,
  passage,
  clickedWord,
  onWordClick,
  wordsLength,
}: {
  word: string;
  index: number;
  passage: Passage;
  clickedWord: string | null;
  onWordClick: (word: string, index: number) => void;
  wordsLength: number;
}) {
  const cleanWord = stripPunctuation(word);
  const grammarMatch = !!passage.grammarFocus && isGrammarWord(word, passage.grammarFocus);
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
  ];
  const className = cn(wordClasses, {
    'grammar-highlight bg-purple-50 text-purple-900 border-b border-purple-300': grammarMatch,
    'bg-blue-200': isClicked,
  });

  return (
    <span key={`${word}-${index}`}>
      <button
        type="button"
        data-testid={cleanWord ? `word-${cleanWord.toLowerCase()}` : undefined}
        data-grammar-highlight={grammarMatch ? 'true' : undefined}
        data-clicked={isClicked ? 'true' : undefined}
        className={className}
        onClick={() => onWordClick(word, index)}
        aria-label={cleanWord}
      >
        {word}
      </button>
      {index < wordsLength - 1 && ' '}
    </span>
  );
}
