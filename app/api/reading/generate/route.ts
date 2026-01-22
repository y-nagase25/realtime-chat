/**
 * API Route: POST /api/reading/generate
 * Generates a reading passage based on level and topic using GPT-5
 */

import { validateGeneratePassageRequest } from '@/lib/utils/reading-validation';
import { createReadingApiHandler, getJsonCompletion } from '@/lib/utils/reading-api';
import {
  READING_LEVELS,
  getTopicById,
  getGrammarPatternById,
  calculateEstimatedReadingTime,
} from '@/lib/constants/reading';
import type { GeneratePassageRequest, Passage } from '@/lib/types/reading';

/**
 * Count words in a text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Build the prompt for passage generation
 */
function buildPassagePrompt(request: GeneratePassageRequest): string {
  const levelConfig = READING_LEVELS[request.level];
  const topic = getTopicById(request.topic);
  const grammarPattern = request.grammarFocus
    ? getGrammarPatternById(request.grammarFocus)
    : undefined;

  let prompt = `You are an expert English teacher creating reading material for Japanese learners.

Generate an engaging English reading passage with the following specifications:

**Difficulty Level:** ${request.level} (${levelConfig.label})
- Target vocabulary and grammar complexity for ${levelConfig.descriptionJa}
- Word count: ${levelConfig.wordCountMin}-${levelConfig.wordCountMax} words

**Topic:** ${topic?.labelEn} (${topic?.labelJa})
- Create content related to this theme that would interest adult learners

**Requirements:**
1. Include a compelling title for the passage
2. Write clear, coherent paragraphs
3. Use vocabulary appropriate for ${request.level} level
4. Sentences should be natural and engaging
5. The passage should have a clear beginning, middle, and end
`;

  if (grammarPattern) {
    prompt += `
**Grammar Focus:** ${grammarPattern.labelEn} (${grammarPattern.labelJa})
- Naturally incorporate multiple examples of ${grammarPattern.description}
- The grammar pattern should appear at least 3-5 times in the passage
`;
  }

  prompt += `
**Output Format:**
Return a valid JSON object with exactly this structure:
{
  "title": "The title of the passage",
  "content": "The full passage text here..."
}

Do not include any text outside of the JSON object. The content should be a single continuous text (paragraphs separated by newlines).`;

  return prompt;
}

type PassageResponse = {
  title: string;
  content: string;
};

export const POST = createReadingApiHandler<GeneratePassageRequest, Passage>({
  validate: validateGeneratePassageRequest,
  errorMessage: 'Failed to generate passage. Please try again.',
  handler: async (request) => {
    const prompt = buildPassagePrompt(request);
    const parsed = await getJsonCompletion<PassageResponse>(prompt, 1500);

    if (!parsed.title || !parsed.content) {
      throw new Error('Invalid response format from AI');
    }

    const wordCount = countWords(parsed.content);
    const estimatedReadingTime = calculateEstimatedReadingTime(wordCount, request.level);

    return {
      title: parsed.title,
      content: parsed.content,
      level: request.level,
      topic: request.topic,
      wordCount,
      estimatedReadingTimeMinutes: estimatedReadingTime,
      grammarFocus: request.grammarFocus,
    };
  },
});
