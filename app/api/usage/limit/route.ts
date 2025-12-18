import { NextResponse } from 'next/server';
import { audioModel } from '@/lib/openai';
import { getSupabaseClient } from '@/lib/supabase';
import { TABLE_NAME } from '@/lib/types/db';
import { getJSTDayRange } from '@/lib/utils/date-jst';
import type { DailyUsageLimit } from '@/lib/types/usage-stats';
import { WHISPER_LIMIT_SECONDS_PER_DAY } from '@/lib/costants';

export const revalidate = 60;

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { startOfDay, endOfDay, dateString } = getJSTDayRange();

    const { data, error } = await supabase
      .from(TABLE_NAME.TOKEN_USAGE)
      .select('audio_duration_seconds')
      .eq('api_type', 'transcription')
      .eq('model_name', audioModel)
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString());

    if (error) throw new Error(`Transcription query failed: ${error.message}`);

    const sum = data.reduce((acc, row) => {
      return acc + (row.audio_duration_seconds || 0);
    }, 0);

    const responseData: DailyUsageLimit = {
      date: dateString,
      timezone: 'JST',
      exceeded: Number(sum) >= WHISPER_LIMIT_SECONDS_PER_DAY,
    };

    // For now just return the raw data; this can be expanded to enforce limits.
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[UsageLimit] Failed to fetch usage limit data:', error);
    return NextResponse.json({ error: 'Failed to fetch usage limit data' }, { status: 500 });
  }
}
