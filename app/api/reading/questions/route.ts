/**
 * API Route: POST /api/reading/questions
 * Generates comprehension questions for a given passage using GPT-5
 */

import { type NextRequest, NextResponse } from 'next/server';
import { completionModel, openai } from '@/lib/openai';
import { validateGenerateQuestionsRequest } from '@/lib/utils/reading-validation';
import { READING_LEVELS } from '@/lib/constants/reading';
import type { GenerateQuestionsRequest, ComprehensionQuestion } from '@/lib/types/reading';
import { v4 as uuidv4 } from 'uuid';
import { trackChatCompletion } from '@/lib/utils/track-usage';

/**
 * Build the prompt for question generation
 */
function buildQuestionsPrompt(request: GenerateQuestionsRequest): string {
  const levelConfig = READING_LEVELS[request.level];

  return `You are an expert English teacher creating comprehension questions for Japanese learners.

Based on the following passage, generate 3-5 comprehension questions that test understanding (not memorization).

**Passage:**
${request.passage}

**Difficulty Level:** ${request.level} (${levelConfig.label})
- Questions should be appropriate for this level

**Question Types to Include:**
1. Multiple choice questions (4 options, labeled A, B, C, D)
2. True/False questions
3. Fill-in-the-blank questions

**Requirements:**
1. Questions should test understanding of the main ideas and details
2. Each question must have a clear correct answer
3. Provide an explanation in English and Japanese for each answer
4. For multiple choice, make distractors plausible but clearly wrong
5. For fill-in-the-blank, accept reasonable alternative answers

**Output Format:**
Return a valid JSON object with exactly this structure:
{
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

Important:
- For multiple-choice, correctAnswer is the index (0-3) of the correct option
- For true-false, correctAnswer is a boolean (true or false)
- For fill-in-blank, include the main answer and acceptable alternatives
- Generate a mix of question types (at least 2 different types)
- All explanationJa fields must be in Japanese`;
}

/**
 * Add IDs to questions
 */
function addQuestionIds(questions: Omit<ComprehensionQuestion, 'id'>[]): ComprehensionQuestion[] {
  return questions.map((q) => ({
    ...q,
    id: uuidv4(),
  })) as ComprehensionQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateGenerateQuestionsRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const questionsRequest = body as GenerateQuestionsRequest;

    // Build prompt
    const prompt = buildQuestionsPrompt(questionsRequest);

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
      max_completion_tokens: 2000,
    });
    trackChatCompletion(completion, 'reading');

    // Parse response
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);

    // Validate response structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format from AI');
    }

    // Validate each question has required fields
    for (const q of parsed.questions) {
      if (!q.type || !q.question || !q.explanation || !q.explanationJa) {
        throw new Error('Invalid question format from AI');
      }
    }

    // Add IDs to questions
    const questionsWithIds = addQuestionIds(parsed.questions);

    return NextResponse.json({
      success: true,
      data: {
        questions: questionsWithIds,
      },
    });
  } catch (error) {
    console.error('Question generation error:', error);

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
        error: 'Failed to generate questions. Please try again.',
      },
      { status: 500 }
    );
  }
}
