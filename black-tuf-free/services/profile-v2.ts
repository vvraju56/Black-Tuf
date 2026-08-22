import { supabase } from "./client";
import type {
  Domain,
  ExperienceItem,
  PortfolioProject,
  Profile,
  ProfileCompletion,
  Skill,
  UserSkill,
  ProfileDomain,
} from "@/types";

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase().auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return data.user.id;
}

// ---------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------
export async function getProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as Profile | null;
}

/** Public-safe profile lookup (via the public_profiles view). */
export async function getPublicProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase()
    .from("public_profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as Profile | null;
}

export async function getPublicProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase()
    .from("public_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as Profile | null;
}

export async function updateOwnProfile(
  patch: Partial<Pick<
    Profile,
    | "full_name"
    | "phone"
    | "avatar_url"
    | "cover_url"
    | "username"
    | "headline"
    | "bio"
    | "country"
    | "city"
    | "available_for_work"
    | "hourly_rate"
    | "hourly_currency"
    | "timezone"
  >>
) {
  const userId = await currentUserId();
  const { error } = await supabase().from("profiles").update(patch).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function setLastSeen() {
  const userId = await currentUserId();
  const { error } = await supabase()
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------
// Profile completion — computed from required fields only
// ---------------------------------------------------------------
export async function getProfileCompletion(userId: string): Promise<ProfileCompletion> {
  const client = supabase();
  const [profile, skills, domains] = await Promise.all([
    client.from("profiles").select("full_name, username, avatar_url, headline, bio, country").eq("id", userId).maybeSingle(),
    client.from("user_skills").select("skill_id").eq("user_id", userId),
    client.from("profile_domains").select("domain_id").eq("user_id", userId),
  ]);

  const missing: string[] = [];
  const p = profile?.data as Record<string, unknown> | undefined;
  if (!p?.full_name) missing.push("Add your full name");
  if (!p?.username) missing.push("Add a username");
  if (!p?.avatar_url) missing.push("Add a profile photo");
  if (!p?.country) missing.push("Add your country");
  if (!p?.headline) missing.push("Add a professional headline");
  if (!p?.bio) missing.push("Add an about description");
  if (!(domains?.data?.length ?? 0)) missing.push("Select a service domain");
  if (!(skills?.data?.length ?? 0)) missing.push("Add at least one skill");

  const total = 8;
  const done = total - missing.length;
  const percent = Math.round((done / total) * 100);
  return { percent: Math.min(100, Math.max(0, percent)), missing };
}

// ---------------------------------------------------------------
// Reviews — real approved feedback for this profile
// ---------------------------------------------------------------
export interface ProfileReviewSummary {
  rating: number | null;
  count: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer_name: string | null;
    reviewer_avatar: string | null;
    project_name: string | null;
  }>;
}

export async function getProfileReviews(userId: string): Promise<ProfileReviewSummary> {
  const { data, error } = await supabase()
    .from("profile_reviews")
    .select("id, rating, comment, created_at, engineer_id, project_name, reviewer_name, reviewer_avatar")
    .eq("engineer_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    project_name: string | null;
    reviewer_name: string | null;
    reviewer_avatar: string | null;
  }>;

  const rating =
    rows.length > 0
      ? Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10) / 10
      : null;

  return {
    rating,
    count: rows.length,
    reviews: rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      reviewer_name: r.reviewer_name,
      reviewer_avatar: r.reviewer_avatar,
      project_name: r.project_name,
    })),
  };
}

// ---------------------------------------------------------------
// Skills
// ---------------------------------------------------------------
export async function getMySkills(): Promise<UserSkill[]> {
  const userId = await currentUserId();
  return getPublicSkills(userId);
}

export async function getPublicSkills(userId: string): Promise<UserSkill[]> {
  const { data, error } = await supabase()
    .from("user_skills")
    .select("*, skill:skill_id(*)")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as UserSkill[];
}

export async function searchSkills(term: string, limit = 10): Promise<Skill[]> {
  const { data, error } = await supabase()
    .from("skills")
    .select("*")
    .ilike("name", `%${term}%`)
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Skill[];
}

async function ensureSkill(name: string): Promise<string> {
  const { data: existing } = await supabase().from("skills").select("id").eq("name", name).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase().from("skills").insert({ name }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function addSkill(name: string) {
  const userId = await currentUserId();
  const skillId = await ensureSkill(name.trim());
  const { data: existing } = await supabase()
    .from("user_skills")
    .select("sort_order")
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .maybeSingle();
  if (existing) return;
  const { data: last } = await supabase()
    .from("user_skills")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase().from("user_skills").insert({
    user_id: userId,
    skill_id: skillId,
    sort_order: (last?.sort_order ?? 0) + 1,
  });
  if (error) throw new Error(error.message);
}

export async function removeSkill(skillId: string) {
  const userId = await currentUserId();
  const { error } = await supabase()
    .from("user_skills")
    .delete()
    .eq("user_id", userId)
    .eq("skill_id", skillId);
  if (error) throw new Error(error.message);
}

export async function reorderSkills(orderedSkillIds: string[]) {
  const userId = await currentUserId();
  const { error } = await supabase()
    .from("user_skills")
    .upsert(
      orderedSkillIds.map((skill_id, index) => ({ user_id: userId, skill_id, sort_order: index })),
      { onConflict: "user_id,skill_id" }
    );
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------
// Service domains
// ---------------------------------------------------------------
export async function getDomains(): Promise<Domain[]> {
  const { data, error } = await supabase()
    .from("domains")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Domain[];
}

export async function getProfileDomains(userId: string): Promise<ProfileDomain[]> {
  const { data, error } = await supabase()
    .from("profile_domains")
    .select("*, domain:domain_id(*)")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ProfileDomain[];
}

export async function setProfileDomains(domainIds: string[]) {
  const userId = await currentUserId();
  const client = supabase();
  const { error: del } = await client.from("profile_domains").delete().eq("user_id", userId);
  if (del) throw new Error(del.message);
  if (domainIds.length === 0) return;
  const { error: ins } = await client
    .from("profile_domains")
    .insert(domainIds.map((domain_id) => ({ user_id: userId, domain_id })));
  if (ins) throw new Error(ins.message);
}

// ---------------------------------------------------------------
// Portfolio projects
// ---------------------------------------------------------------
export async function getPortfolioProjects(userId: string): Promise<PortfolioProject[]> {
  const { data, error } = await supabase()
    .from("portfolio_projects")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PortfolioProject[];
}

export async function upsertPortfolioProject(input: Partial<PortfolioProject>) {
  const userId = await currentUserId();
  const { error } = await supabase().from("portfolio_projects").upsert({
    ...input,
    user_id: userId,
    sort_order: input.sort_order ?? 0,
  });
  if (error) throw new Error(error.message);
}

export async function deletePortfolioProject(id: string) {
  const userId = await currentUserId();
  const { error } = await supabase().from("portfolio_projects").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function setPortfolioOrder(ids: string[]) {
  const userId = await currentUserId();
  const { data } = await supabase()
    .from("portfolio_projects")
    .select("id")
    .eq("user_id", userId)
    .in("id", ids);
  const rows = (data ?? []) as Array<{ id: string }>;
  const { error } = await supabase()
    .from("portfolio_projects")
    .upsert(rows.map((r, i) => ({ id: r.id, user_id: userId, sort_order: i })), { onConflict: "id" });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------
// Experience
// ---------------------------------------------------------------
export async function getExperience(userId: string): Promise<ExperienceItem[]> {
  const { data, error } = await supabase()
    .from("experience")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ExperienceItem[];
}

export async function upsertExperience(input: Partial<ExperienceItem>) {
  const userId = await currentUserId();
  const { error } = await supabase().from("experience").upsert({ ...input, user_id: userId });
  if (error) throw new Error(error.message);
}

export async function deleteExperience(id: string) {
  const userId = await currentUserId();
  const { error } = await supabase().from("experience").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
