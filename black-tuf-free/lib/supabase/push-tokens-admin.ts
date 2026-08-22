import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Server-only Supabase client for push-token maintenance. */
export function createClient() {
  return {
    async removePushTokens(tokens: string[]) {
      if (!SERVICE_ROLE_KEY || tokens.length === 0) return;
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      await supabase.from("push_tokens").delete().in("token", tokens);
    },
  };
}
