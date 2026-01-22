/**
 * API Route: POST /api/reading/vocabulary
 * Looks up a word and provides definition with Japanese translation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { completionModel, openai } from '@/lib/openai';
import { validateVocabularyLookupRequest } from '@/lib/utils/reading-validation';
import { lookupWaseiEigo } from '@/lib/data/wasei-eigo';
import type { VocabularyLookupRequest, VocabularyEntry } from '@/lib/types/reading';
import { trackChatCompletion } from '@/lib/utils/track-usage';

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

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateVocabularyLookupRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const vocabRequest = body as VocabularyLookupRequest;

    // Build prompt
    const prompt = buildVocabularyPrompt(vocabRequest);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: completionModel,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 500,
    });
    trackChatCompletion(completion, 'reading');

    // Parse response
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);

    // Validate response structure
    if (
      !parsed.word ||
      !parsed.partOfSpeech ||
      !parsed.definitionEn ||
      !parsed.definitionJa ||
      !parsed.exampleSentence
    ) {
      throw new Error('Invalid response format from AI');
    }

    // Check for Wasei-Eigo warning
    const waseiEigoWarning = lookupWaseiEigo(vocabRequest.word);

    const vocabularyEntry: VocabularyEntry = {
      word: parsed.word,
      pronunciation: parsed.pronunciation,
      partOfSpeech: parsed.partOfSpeech,
      definitionEn: parsed.definitionEn,
      definitionJa: parsed.definitionJa,
      exampleSentence: parsed.exampleSentence,
      waseiEigoWarning: waseiEigoWarning,
    };

    return NextResponse.json({
      success: true,
      data: vocabularyEntry,
    });
  } catch (error) {
    console.error('Vocabulary lookup error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to look up word. Please try again.',
      },
      { status: 500 }
    );
  }
}
