/**
 * API Route: POST /api/speaking/score
 * Scores user's transcribed response against model answer using GPT-4o
 */

import { type NextRequest, NextResponse } from 'next/server';
import { buildScoringPrompt } from '@/lib/utils/scoring';
import { validateScoringRequest } from '@/lib/utils/validation';
import type { Scoring, ScoringRequest } from '@/lib/types/speaking';
import { getJsonCompletion } from '@/lib/utils/reading-api';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body
    const body = await request.json();

    const { valid, error } = validateScoringRequest(body);

    if (!valid) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const scoringRequest = body as ScoringRequest;

    // Build scoring prompt
    const prompt = buildScoringPrompt(scoringRequest);

    // Call OpenAI Chat Completion API
    const result = await getJsonCompletion<Scoring>(prompt, 500, 'transcription');

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
