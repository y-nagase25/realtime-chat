/**
 * API Route: POST /api/reading/vocabulary
 * Looks up a word and provides definition with Japanese translation
 */

import { validateVocabularyLookupRequest } from '@/lib/utils/reading-validation';
import { createReadingApiHandler, getJsonCompletion } from '@/lib/utils/reading-api';
import type { VocabularyLookupRequest, VocabularyEntry } from '@/lib/types/reading';

/**
 * Build the prompt for vocabulary lookup
 */
function buildVocabularyPrompt(request: VocabularyLookupRequest): string {
  let prompt = `You are an expert English-Japanese dictionary for Japanese learners studying English.

Provide detailed information about the following English word:

**Word:** ${request.word}
`;

  if (request.context) {
    prompt += `
**Context:** "${request.context}"
(Use this context to determine the appropriate meaning/usage)
`;
  }

  prompt += `
**Requirements:**
1. Provide the most common/relevant definition
2. Include accurate Japanese translation
3. Include an example sentence that demonstrates natural usage
4. If the word is commonly misunderstood by Japanese speakers, mention it

**Output Format:**
Return a valid JSON object with exactly this structure:
{
  "word": "the word",
  "pronunciation": "/phonetic pronunciation/",
  "partOfSpeech": "noun/verb/adjective/etc.",
  "definitionEn": "Clear English definition",
  "definitionJa": "Japanese translation (日本語訳)",
  "exampleSentence": "A natural example sentence using the word."
}

Important:
- The definitionJa must be in Japanese
- The pronunciation should use IPA notation
- Choose the meaning most relevant to the context (if provided)`;

  return prompt;
}

type VocabularyResponse = {
  word: string;
  pronunciation?: string;
  partOfSpeech: string;
  definitionEn: string;
  definitionJa: string;
  exampleSentence: string;
};

export const POST = createReadingApiHandler<VocabularyLookupRequest, VocabularyEntry>({
  validate: validateVocabularyLookupRequest,
  errorMessage: 'Failed to look up word. Please try again.',
  handler: async (request) => {
    const prompt = buildVocabularyPrompt(request);
    const parsed = await getJsonCompletion<VocabularyResponse>(prompt, 500);

    if (
      !parsed.word ||
      !parsed.partOfSpeech ||
      !parsed.definitionEn ||
      !parsed.definitionJa ||
      !parsed.exampleSentence
    ) {
      throw new Error('Invalid response format from AI');
    }

    return {
      word: parsed.word,
      pronunciation: parsed.pronunciation,
      partOfSpeech: parsed.partOfSpeech,
      definitionEn: parsed.definitionEn,
      definitionJa: parsed.definitionJa,
      exampleSentence: parsed.exampleSentence,
    };
  },
});
