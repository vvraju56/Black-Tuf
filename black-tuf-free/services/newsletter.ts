import { supabase } from "./client";

export async function subscribeToNewsletter(email: string): Promise<{ ok: boolean; message: string }> {
  const { error } = await supabase().from("newsletter_subscribers").upsert(
    { email, is_active: true },
    { onConflict: "email" }
  );
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Subscribed. Welcome to the Black Tuf network." };
}

export async function getAllSubscribers() {
  const { data, error } = await supabase()
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Array<{
    id: string;
    email: string;
    is_active: boolean;
    created_at: string;
  }>;
}

export async function removeSubscriber(id: string) {
  const { error } = await supabase().from("newsletter_subscribers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
