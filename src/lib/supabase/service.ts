import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service role client — bypasses RLS for trusted server-side operations.
 * NEVER expose this to the client. Only use in server actions, API routes,
 * and server components for cross-user queries (e.g. social leaderboards).
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
