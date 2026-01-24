/**
 * API Route: POST /api/reading/generate
 * Generates a reading passage with comprehension questions using GPT-5
 */

import { validateGeneratePassageRequest } from '@/lib/utils/reading-validation';
import { createReadingApiHandler, getJsonCompletion } from '@/lib/utils/reading-api';
import {
  READING_LEVELS,
  getTopicById,
  getGrammarPatternById,
  calculateEstimatedReadingTime,
} from '@/lib/constants/reading';
import type { GeneratePassageRequest, Passage, ComprehensionQuestion } from '@/lib/types/reading';
import { v4 as uuidv4 } from 'uuid';

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
 * Build the combined prompt for passage and question generation
 */
function buildCombinedPrompt(request: GeneratePassageRequest): string {
  const levelConfig = READING_LEVELS[request.level];
  const topic = getTopicById(request.topic);
  const grammarPattern = request.grammarFocus
    ? getGrammarPatternById(request.grammarFocus)
    : undefined;

  let prompt = `You are an expert English teacher creating reading material and comprehension questions for Japanese learners.

Generate an engaging English reading passage AND comprehension questions with the following specifications:

---

## PASSAGE REQUIREMENTS

**Difficulty Level:** ${request.level} (${levelConfig.label})
- Target vocabulary and grammar complexity for ${levelConfig.descriptionJa}
- Word count: ${levelConfig.wordCountMin}-${levelConfig.wordCountMax} words

**Topic:** ${topic?.labelEn} (${topic?.labelJa})
- Create content related to this theme that would interest adult learners

**Passage Guidelines:**
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
---

## COMPREHENSION QUESTIONS REQUIREMENTS

Based on the passage you generate above, create 3-5 comprehension questions that test understanding (not memorization).

**Question Types to Include (mix at least 2 different types):**
1. Multiple choice questions (4 options, labeled A, B, C, D)
2. True/False questions
3. Fill-in-the-blank questions

**Question Guidelines:**
1. Questions should test understanding of the main ideas and details
2. Each question must have a clear correct answer
3. Provide an explanation in English and Japanese for each answer
4. For multiple choice, make distractors plausible but clearly wrong
5. For fill-in-the-blank, accept reasonable alternative answers
6. Questions should be appropriate for ${request.level} level learners

---

## OUTPUT FORMAT

Return a valid JSON object with exactly this structure:
{
  "title": "The title of the passage",
  "content": "The full passage text here...",
  "questions": [
    {
      "type": "multiple-choice",
      "question": "What is the question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "English explanation of the correct answer",
      "explanationJa": "Japanese explanation of the correct answer"
    },
    {
      "type": "true-false",
      "question": "Statement to evaluate?",
      "correctAnswer": true,
      "explanation": "English explanation",
      "explanationJa": "Japanese explanation"
    },
    {
      "type": "fill-in-blank",
      "question": "Complete the sentence: The main character ___.",
      "correctAnswer": "went to the store",
      "acceptableAnswers": ["went to the store", "visited the store"],
      "explanation": "English explanation",
      "explanationJa": "Japanese explanation"
    }
  ]
}

**Important:**
- The content should be a single continuous text (paragraphs separated by newlines)
- For multiple-choice, correctAnswer is the index (0-3) of the correct option
- For true-false, correctAnswer is a boolean (true or false)
- For fill-in-blank, include the main answer and acceptable alternatives
- Generate a mix of question types (at least 2 different types)
- All explanationJa fields must be in Japanese
- Do not include any text outside of the JSON object`;

  return prompt;
}

type CombinedPassageResponse = {
  title: string;
  content: string;
  questions?: Array<{
    type: string;
    question: string;
    options?: string[];
    correctAnswer: number | boolean | string;
    acceptableAnswers?: string[];
    explanation: string;
    explanationJa: string;
  }>;
};

/**
 * Add UUIDs to questions
 */
function addQuestionIds(questions: Omit<ComprehensionQuestion, 'id'>[]): ComprehensionQuestion[] {
  return questions.map((q) => ({
    ...q,
    id: uuidv4(),
  })) as ComprehensionQuestion[];
}

/**
 * Validate and extract questions from AI response with graceful degradation
 */
function extractValidQuestions(
  raw: CombinedPassageResponse['questions']
): Omit<ComprehensionQuestion, 'id'>[] {
  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  const validQuestions: Omit<ComprehensionQuestion, 'id'>[] = [];

  for (const q of raw) {
    if (!q.type || !q.question || !q.explanation || !q.explanationJa) {
      continue;
    }

    if (q.type === 'multiple-choice') {
      if (
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== 'number'
      ) {
        continue;
      }
      validQuestions.push(q as unknown as Omit<ComprehensionQuestion, 'id'>);
    } else if (q.type === 'true-false') {
      if (typeof q.correctAnswer !== 'boolean') {
        continue;
      }
      validQuestions.push(q as unknown as Omit<ComprehensionQuestion, 'id'>);
    } else if (q.type === 'fill-in-blank') {
      if (typeof q.correctAnswer !== 'string') {
        continue;
      }
      validQuestions.push({
        ...q,
        acceptableAnswers: q.acceptableAnswers || [q.correctAnswer as string],
      } as unknown as Omit<ComprehensionQuestion, 'id'>);
    }
  }

  return validQuestions;
}

export const POST = createReadingApiHandler<GeneratePassageRequest, Passage>({
  validate: validateGeneratePassageRequest,
  errorMessage: 'Failed to generate passage. Please try again.',
  handler: async (request) => {
    const prompt = buildCombinedPrompt(request);
    const parsed = await getJsonCompletion<CombinedPassageResponse>(prompt, 3500);

    if (!parsed.title || !parsed.content) {
      throw new Error('Invalid response format from AI');
    }

    const wordCount = countWords(parsed.content);
    const estimatedReadingTime = calculateEstimatedReadingTime(wordCount, request.level);

    const validQuestions = extractValidQuestions(parsed.questions);
    const questionsWithIds = addQuestionIds(validQuestions);

    return {
      title: parsed.title,
      content: parsed.content,
      level: request.level,
      topic: request.topic,
      wordCount,
      estimatedReadingTimeMinutes: estimatedReadingTime,
      grammarFocus: request.grammarFocus,
      questions: questionsWithIds,
    };
  },
});
