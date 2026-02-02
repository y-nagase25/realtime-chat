'use client';

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
        const cleanWord = stripPunctuation(word);
        const grammarMatch = !!passage.grammarFocus && isGrammarWord(word, passage.grammarFocus);
        const isClicked = clickedWord === cleanWord.toLowerCase();
        console.log(grammarMatch ? `match: ${word}` : 'N/A');

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
              onClick={() => onWordClick(word, index)}
              aria-label={cleanWord}
            >
              {word}
            </button>
            {index < words.length - 1 && ' '}
          </span>
        );
      })}
    </article>
  );
}
