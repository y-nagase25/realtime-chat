import 'server-only';

import { cache } from 'react';
import { createAdminSupabase } from '../supabase/admin';

export const getQuestions = cache(async (): Promise<any> => {
  return await createAdminSupabase().from('questions').select('*').order('id', { ascending: true });
});

export const testDatabaseAccess = async () => {
  const { data: tables } = await createAdminSupabase()
    .from('information_schema.tables')
    .select('table_schema, table_name')
    .eq('table_name', 'questions');

  console.log('Found tables:', tables);
};
