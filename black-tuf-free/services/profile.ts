import { supabase } from "./client";
import type { Profile, Role } from "@/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as Profile | null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "full_name" | "phone" | "avatar_url">>
) {
  const { error } = await supabase().from("profiles").update(patch as Record<string, unknown>).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function getUsersByRole(role: Role): Promise<Profile[]> {
  const { data, error } = await supabase()
    .from("profiles")
    .select("*")
    .eq("role", role)
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export async function setUserRole(userId: string, role: Role) {
  const { error } = await supabase().from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase().auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
