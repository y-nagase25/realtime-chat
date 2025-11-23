import 'server-only';

import { cache } from 'react';
import type { PostgrestResponse } from '@supabase/supabase-js';
import { createAdminSupabase } from '../supabase/admin';
import type { Question } from '@/lib/types/db';

export const getQuestions = cache(async (): Promise<PostgrestResponse<Question>> => {
  return await createAdminSupabase().from('questions').select('*').order('id', { ascending: true });
});

export const testDatabaseAccess = async () => {
  const { data: tables } = await createAdminSupabase()
    .from('information_schema.tables')
    .select('table_schema, table_name')
    .eq('table_name', 'questions');

  console.log('Found tables:', tables);
};
