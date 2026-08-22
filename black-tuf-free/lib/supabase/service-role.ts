import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Service-role client for admin operations (server-only). NEVER import into client components. */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
