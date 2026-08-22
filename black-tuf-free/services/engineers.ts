import { supabase } from "./client";
import type { EngineerProfile, Profile } from "@/types";

const ENGINEER_SELECT = `*,
  profile:user_id(id, full_name, email, role, avatar_url, created_at),
  freelancer_domains:profile.freelancer_domains(domain:domain_id(*))`;

export interface EngineerWithProfile extends EngineerProfile {
  profile: Profile;
}

export async function getEngineers(): Promise<EngineerWithProfile[]> {
  const { data, error } = await supabase()
    .from("engineer_profiles")
    .select(ENGINEER_SELECT)
    .eq("is_available", true)
    .order("experience_years", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EngineerWithProfile[];
}

export async function getAllEngineers(): Promise<EngineerWithProfile[]> {
  const { data, error } = await supabase()
    .from("engineer_profiles")
    .select(ENGINEER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EngineerWithProfile[];
}

export async function getEngineer(userId: string): Promise<EngineerWithProfile | null> {
  const { data, error } = await supabase()
    .from("engineer_profiles")
    .select(ENGINEER_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as unknown as EngineerWithProfile) ?? null;
}

export async function getEngineerRating(userId: string) {
  const { data, error } = await supabase()
    .from("feedback")
    .select("rating, project:project_id(engineer_id)")
    .eq("is_approved", true);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<{
    rating: number;
    project: { engineer_id: string } | null;
  }>;
  const mine = rows.filter((r) => r.project?.engineer_id === userId);
  if (mine.length === 0) return { rating: null, count: 0 };
  const avg = mine.reduce((s, r) => s + r.rating, 0) / mine.length;
  return { rating: Math.round(avg * 10) / 10, count: mine.length };
}

export async function upsertEngineerProfile(
  input: Partial<EngineerProfile>
): Promise<void> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase().from("engineer_profiles").upsert(
    {
      user_id: user.id,
      title: input.title ?? "",
      bio: input.bio ?? "",
      skills: input.skills ?? [],
      hourly_rate: input.hourly_rate ?? null,
      experience_years: input.experience_years ?? 0,
      portfolio_links: input.portfolio_links ?? [],
      certificates: input.certificates ?? [],
      availability: input.availability ?? "full_time",
      location: input.location ?? null,
      languages: input.languages ?? [],
      is_available: input.is_available ?? true,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
}

/** Replace the engineer's service-domain list (many-to-many). */
export async function setFreelancerDomains(domainIds: string[]): Promise<void> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const client = supabase();
  const { error: deleteError } = await client
    .from("freelancer_domains")
    .delete()
    .eq("user_id", user.id);
  if (deleteError) throw new Error(deleteError.message);

  if (domainIds.length === 0) return;

  const { error: insertError } = await client
    .from("freelancer_domains")
    .insert(domainIds.map((domain_id) => ({ user_id: user.id, domain_id })));
  if (insertError) throw new Error(insertError.message);
}
