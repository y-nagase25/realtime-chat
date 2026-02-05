import { render, screen } from '@testing-library/react';
import type { GrammarPatternId, Passage } from '@/lib/types/reading';
import { Word } from './Word';

describe('Word', () => {
  function getMockPassage(grammer: GrammarPatternId | undefined = undefined): Passage {
    return {
      title: 'A Day in My Life',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      level: 'A1',
      topic: 'daily-life',
      grammarFocus: grammer,
      wordCount: 0,
      estimatedReadingTimeMinutes: 1,
      questions: [],
    };
  }

  it('should render a word', () => {
    render(
      <Word
        word="Lorem"
        index={0}
        passage={getMockPassage()}
        clickedWord=""
        onWordClick={vi.fn()}
        wordsLength={300}
      />
    );
    const wordButton = screen.getByTestId('word-lorem');
    expect(wordButton).toBeInTheDocument();
    expect(wordButton).toHaveTextContent('Lorem');
  });

  it('should render a highlighted word when grammar focus provided', () => {
    render(
      <Word
        word="the"
        index={0}
        passage={getMockPassage('articles')}
        clickedWord=""
        onWordClick={vi.fn()}
        wordsLength={300}
      />
    );
    const wordButton = screen.getByTestId('word-the');
    expect(wordButton).toBeInTheDocument();
    expect(wordButton).toHaveAttribute('data-grammar-highlight', 'true');
  });
});
