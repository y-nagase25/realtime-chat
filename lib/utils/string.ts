export function trimString(str: string, len: number = 30): string {
  if (str.length > len) {
    return `${str.slice(0, len)}...`;
  }
  return str;
}

/**
 * Grammar pattern keywords mapping
 */
export const GRAMMAR_KEYWORDS: Record<string, string[]> = {
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
export function stripPunctuation(word: string): string {
  return word.replace(/[.,!?;:'"()[\]{}—–-]/g, '');
}

/**
 * Check if a word matches a grammar pattern
 */
export function isGrammarWord(word: string, grammarFocus?: string): boolean {
  if (!grammarFocus) return false;
  const keywords = GRAMMAR_KEYWORDS[grammarFocus];
  if (!keywords) return false;
  return keywords.includes(stripPunctuation(word).toLowerCase());
}

/**
 * Find the sentence containing a word at a given position in the text
 */
export function findContextSentence(content: string, wordIndex: number): string {
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
