/**
 * API Route: POST /api/speaking/score
 * Scores user's transcribed response against model answer using GPT-4o
 */

import { type NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { buildScoringPrompt } from '@/lib/utils/scoring';
import { validateScoringRequest } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body = await request.json();

    validateScoringRequest(body);

    const { questionText, modelAnswer, userTranscript } = body;

    // Build scoring prompt
    const prompt = buildScoringPrompt(questionText, modelAnswer, userTranscript);

    // Call OpenAI Chat Completion API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    });

    // Parse response
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);

    // Validate response structure
    if (
      typeof result.score !== 'number' ||
      !Array.isArray(result.areasForImprovement) ||
      !Array.isArray(result.goodPoints)
    ) {
      throw new Error('Invalid response format from AI');
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        score: result.score,
        areasForImprovement: result.areasForImprovement,
        goodPoints: result.goodPoints,
        processingTime,
      },
    });
  } catch (error) {
    console.error('Scoring API error:', error);

    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Invalid')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Scoring failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
