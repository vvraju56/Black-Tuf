import { createBrowserClient } from "@supabase/ssr";

export type SupabaseClient = ReturnType<typeof createClient>;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
