import { createBrowserClient } from "@supabase/ssr";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/** Browser Supabase client used by the services layer.
 * Typed loosely to `any` because the @supabase JS generics resolve table
 * inserts/updates to `never`; row shapes are instead enforced via explicit
 * domain casts in each service. */
 
export function supabase(): any {
  if (!cached) {
    cached = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return cached;
}

export type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;
