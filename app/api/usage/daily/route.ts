/**
 * API Route: GET /api/usage/daily
 * Returns daily usage statistics for transcription and speaking-scoring APIs
 * Data is calculated for the current day in JST (Japan Standard Time)
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getJSTDayRange } from '@/lib/utils/date-jst';
import {
  aggregateTranscriptionSeconds,
  aggregateSpeakingTokens,
} from '@/lib/utils/aggregate-usage';
import type { DailyUsageStats, UsageTrackingRecord } from '@/lib/types/usage-stats';
import { TABLE_NAME } from '@/lib/types/db';
import { audioModel, completionModel } from '@/lib/openai';

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();

    // Calculate JST date range for current day
    const { startOfDay, endOfDay, dateString } = getJSTDayRange();

    // Execute both queries in parallel for better performance
    const [transcriptionResult, speakingResult] = await Promise.all([
      // Query transcription data
      supabase
        .from(TABLE_NAME.TOKEN_USAGE)
        .select('audio_duration_seconds')
        .eq('api_type', 'transcription')
        .eq('model_name', audioModel)
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString()),

      // Query speaking-scoring data
      supabase
        .from(TABLE_NAME.TOKEN_USAGE)
        .select('total_tokens')
        .eq('api_type', 'transcription')
        .eq('model_name', completionModel)
        .gte('created_at', startOfDay.toISOString())
        .lt('created_at', endOfDay.toISOString()),
    ]);

    // Check for query errors
    if (transcriptionResult.error) {
      throw new Error(`Transcription query failed: ${transcriptionResult.error.message}`);
    }

    if (speakingResult.error) {
      throw new Error(`Speaking-scoring query failed: ${speakingResult.error.message}`);
    }

    // Aggregate results using utility functions
    const transcriptionData = (transcriptionResult.data ?? []) as UsageTrackingRecord[];
    const speakingData = (speakingResult.data ?? []) as UsageTrackingRecord[];

    const totalSeconds = aggregateTranscriptionSeconds(transcriptionData);
    const totalTokens = aggregateSpeakingTokens(speakingData);

    // Build response object
    const responseData: DailyUsageStats = {
      date: dateString,
      timezone: 'JST',
      transcription: {
        totalSeconds,
        recordCount: transcriptionData.length,
      },
      speakingScoring: {
        totalTokens,
        recordCount: speakingData.length,
      },
    };

    // Return JSON response with cache headers for performance
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    // Log error details server-side for debugging
    console.error('[DailyUsage] Error fetching usage statistics:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return generic error message to client (don't expose internals)
    return NextResponse.json({ error: 'Failed to fetch usage statistics' }, { status: 500 });
  }
}
