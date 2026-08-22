import { createClient } from "@/lib/supabase/client";
import type { PushToken } from "@/types";

export async function upsertPushToken(userId: string, token: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("push_tokens")
    .upsert(
      {
        user_id: userId,
        token,
        device: "web",
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,token" }
    );
  if (error) throw new Error(error.message);
}

export async function removePushToken(token: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("push_tokens").delete().eq("token", token);
  if (error) throw new Error(error.message);
}

export async function getPushTokens(userId: string): Promise<PushToken[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("push_tokens")
    .select("*")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []) as PushToken[];
}

export async function testPushNotification(userId: string): Promise<void> {
  if (!userId) return;
  await fetch("/api/notifications/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      title: "Black Tuf Test Notification",
      body: "Your push notifications are working!",
      data: { type: "system", path: "/dashboard/settings" },
    }),
  });
}
