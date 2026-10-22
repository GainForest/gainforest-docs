import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client, built from SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY. The service role key bypasses RLS, so this must
 * only ever be imported from route handlers, never from a client component.
 * Returns null when the variables are unset (local dev without a database).
 */
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}
