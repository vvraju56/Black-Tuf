import { supabase } from "./client";
import type { SavedEngineer } from "@/types";

export async function getSavedEngineers(): Promise<SavedEngineer[]> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase()
    .from("saved_engineers")
    .select(`*,
      engineer:engineer_id(id, full_name, email, role, avatar_url),
      engineer_profile:engineer_id(*)`)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SavedEngineer[];
}

export async function isEngineerSaved(engineerId: string): Promise<boolean> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase()
    .from("saved_engineers")
    .select("client_id")
    .eq("client_id", user.id)
    .eq("engineer_id", engineerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function saveEngineer(engineerId: string) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase()
    .from("saved_engineers")
    .upsert({ client_id: user.id, engineer_id: engineerId });

  if (error) throw new Error(error.message);
}

export async function unsaveEngineer(engineerId: string) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase()
    .from("saved_engineers")
    .delete()
    .eq("client_id", user.id)
    .eq("engineer_id", engineerId);

  if (error) throw new Error(error.message);
}
