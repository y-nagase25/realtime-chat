/**
 * API Route: POST /api/reading/generate
 * Generates a reading passage based on level and topic using GPT-5
 */

import { type NextRequest, NextResponse } from 'next/server';
import { completionModel, openai } from '@/lib/openai';
import { validateGeneratePassageRequest } from '@/lib/utils/reading-validation';
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

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateGeneratePassageRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const passageRequest = body as GeneratePassageRequest;

    // Build prompt
    const prompt = buildPassagePrompt(passageRequest);
    console.log('prompt', prompt);

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
      max_completion_tokens: 1500,
    });

    // Parse response
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);

    // Validate response structure
    if (!parsed.title || !parsed.content) {
      throw new Error('Invalid response format from AI');
    }

    const wordCount = countWords(parsed.content);
    const estimatedReadingTime = calculateEstimatedReadingTime(wordCount, passageRequest.level);

    const passage: Passage = {
      title: parsed.title,
      content: parsed.content,
      level: passageRequest.level,
      topic: passageRequest.topic,
      wordCount,
      estimatedReadingTimeMinutes: estimatedReadingTime,
      grammarFocus: passageRequest.grammarFocus,
    };

    return NextResponse.json({
      success: true,
      data: passage,
    });
  } catch (error) {
    console.error('Passage generation error:', error);

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
        error: 'Failed to generate passage. Please try again.',
      },
      { status: 500 }
    );
  }
}
