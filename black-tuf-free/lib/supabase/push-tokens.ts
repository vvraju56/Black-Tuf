import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { PushToken } from "@/types";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Get all web push tokens for a given user (server-only). */
export async function getPushTokensForUser(userId: string): Promise<string[]> {
  if (!SERVICE_ROLE_KEY) return [];
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", userId);
  if (error) return [];
  return ((data ?? []) as Pick<PushToken, "token">[]).map((row) => row.token);
}
