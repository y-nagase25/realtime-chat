import 'server-only';

import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase Admin Client for privileged operations
 * IMPORTANT: This client should ONLY be used in server-side code (Server Actions, Route Handlers)
 * Never expose this client or the service_role key to the browser
 */
export function createAdminSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase Admin environment variables');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}