/**
 * API Route: POST /api/reading/evaluate-summary
 * Evaluates a user's summary of a passage using GPT-5
 */

import { type NextRequest, NextResponse } from 'next/server';
import { completionModel, openai } from '@/lib/openai';
import { validateEvaluateSummaryRequest } from '@/lib/utils/reading-validation';
import type { EvaluateSummaryRequest, SummaryFeedback } from '@/lib/types/reading';

/**
 * Build the prompt for summary evaluation
 */
function buildEvaluationPrompt(request: EvaluateSummaryRequest): string {
  return `You are an expert English teacher evaluating a Japanese learner's summary writing.

**Original Passage:**
${request.passage}

**User's Summary:**
${request.userSummary}

**Task:**
Evaluate the user's summary and provide detailed feedback in Japanese to help them improve.

**Evaluation Criteria:**
1. Key points captured from the original passage
2. Key points missed
3. Grammar accuracy
4. Vocabulary usage and appropriateness
5. Overall quality

**Output Format:**
Return a valid JSON object with exactly this structure:
{
  "keyPointsCaptured": ["Key point 1 the user captured", "Key point 2..."],
  "keyPointsMissed": ["Important point 1 the user missed", "Point 2..."],
  "grammarFeedbackJa": "文法に関するフィードバック（日本語で）",
  "vocabularyFeedbackJa": "語彙の使い方に関するフィードバック（日本語で）",
  "overallFeedbackJa": "全体的な評価とアドバイス（日本語で）",
  "modelSummary": "A model summary showing how the passage could be summarized well",
  "score": 75
}

Important:
- keyPointsCaptured and keyPointsMissed should be in English
- grammarFeedbackJa, vocabularyFeedbackJa, and overallFeedbackJa MUST be in Japanese
- modelSummary should be in English (2-4 sentences)
- score is a number from 0-100 representing the overall quality
- Be encouraging but honest in feedback
- If the summary is good, acknowledge it positively`;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateEvaluateSummaryRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    const evalRequest = body as EvaluateSummaryRequest;

    // Build prompt
    const prompt = buildEvaluationPrompt(evalRequest);

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
    if (
      !Array.isArray(parsed.keyPointsCaptured) ||
      !Array.isArray(parsed.keyPointsMissed) ||
      !parsed.grammarFeedbackJa ||
      !parsed.vocabularyFeedbackJa ||
      !parsed.overallFeedbackJa ||
      !parsed.modelSummary ||
      typeof parsed.score !== 'number'
    ) {
      throw new Error('Invalid response format from AI');
    }

    // Ensure score is within range
    const score = Math.max(0, Math.min(100, parsed.score));

    const feedback: SummaryFeedback = {
      keyPointsCaptured: parsed.keyPointsCaptured,
      keyPointsMissed: parsed.keyPointsMissed,
      grammarFeedbackJa: parsed.grammarFeedbackJa,
      vocabularyFeedbackJa: parsed.vocabularyFeedbackJa,
      overallFeedbackJa: parsed.overallFeedbackJa,
      modelSummary: parsed.modelSummary,
      score,
    };

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Summary evaluation error:', error);

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
        error: 'Failed to evaluate summary. Please try again.',
      },
      { status: 500 }
    );
  }
}
