import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses Row Level Security.
 * NEVER expose this client to the browser. Server-side only.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

let adminClient: ReturnType<typeof createAdminClient> | null = null

/**
 * Memoized service-role client, created on first use.
 *
 * Prefer this over calling createAdminClient() at module scope in a route:
 * `next build` imports every route module during "Collecting page data", and
 * supabase-js throws "supabaseUrl is required" when the env is absent — which
 * fails the build on any machine without the runtime env, even though no
 * request has been served. Missing config should fail the request, not the build.
 */
export function getSupabaseAdmin() {
  if (!adminClient) adminClient = createAdminClient()
  return adminClient
}
