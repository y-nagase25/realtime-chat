import 'server-only';

import { cache } from 'react';
import type { PostgrestResponse } from '@supabase/supabase-js';
import type { Question } from '@/lib/types/db';
import { getSupabaseClient } from '@/lib/supabase';
import { getJSTDayRange } from '@/lib/utils/date-jst';

export const getQuestions = cache(async (): Promise<PostgrestResponse<Question>> => {
  const supabase = getSupabaseClient();
  return await supabase.from('questions').select('*').order('id', { ascending: true });
});

export const getUsageLimit = cache(async () => {
  const supabase = getSupabaseClient();
  const { dateString } = getJSTDayRange();

  return await supabase
    .from('daily_usage_aggregates')
    .select('total_tokens, audio_duration_seconds')
    .eq('date', dateString)
    .single();
});

export const testDatabaseAccess = async () => {
  const supabase = getSupabaseClient();
  const { data: tables } = await supabase
    .from('information_schema.tables')
    .select('table_schema, table_name')
    .eq('table_name', 'questions');

  console.log('Found tables:', tables);
};
