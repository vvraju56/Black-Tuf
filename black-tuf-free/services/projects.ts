import { supabase } from "./client";
import type { Project } from "@/types";

export interface NewProjectInput {
  name: string;
  service: string;
  domains: string[];
  skills?: string[];
  project_type: "online" | "on_site";
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  budget?: number | null;
  deadline?: string | null;
  priority?: Project["priority"];
  currency_code?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  delivery_date?: string | null;
  delivery_time?: string | null;
  timezone?: string | null;
  description: string;
  has_sample: boolean;
  figma_link?: string | null;
  adobe_link?: string | null;
  sample_file_paths?: string[];
}

export const PROJECT_SELECT = `*, 
  client:client_id(id, full_name, email, avatar_url), 
  engineer:engineer_id(id, full_name, email, avatar_url),
  domains:project_domains(domain:domain_id(*))`;

async function replaceProjectDomains(projectId: string, domains: string[]) {
  const client = supabase();
  if (domains.length === 0) return;
  const { error } = await client
    .from("project_domains")
    .insert(domains.map((domain_id) => ({ project_id: projectId, domain_id })));
  if (error) throw new Error(error.message);
}

/** Attach proposal counts to a list of published projects. */
async function attachProposalCounts(projects: Project[]): Promise<Project[]> {
  if (projects.length === 0) return projects;
  try {
    const { data, error } = await supabase().rpc("project_proposal_counts");
    if (error) throw error;
    const map = new Map<string, number>();
    (data ?? []).forEach((row: { project_id: string; proposal_count: number }) => {
      map.set(row.project_id, row.proposal_count);
    });
    return projects.map((p) => ({ ...p, proposal_count: map.get(p.id) ?? 0 }));
  } catch {
    return projects;
  }
}

/** Admin posts a project assigned to a specific client (and optionally engineer). */
export async function postProject(input: NewProjectInput & {
  client_id: string;
  engineer_id?: string | null;
}): Promise<Project> {
  const { data, error } = await supabase()
    .from("projects")
    .insert({
      client_id: input.client_id,
      engineer_id: input.engineer_id ?? null,
      name: input.name,
      service: input.service,
      skills: input.skills ?? [],
      project_type: input.project_type,
      address: input.project_type === "on_site" ? input.address ?? null : null,
      city: input.project_type === "on_site" ? input.city ?? null : null,
      state: input.project_type === "on_site" ? input.state ?? null : null,
      pincode: input.project_type === "on_site" ? input.pincode ?? null : null,
      budget: input.budget ?? null,
      deadline: input.deadline ?? null,
      priority: input.priority ?? "medium",
      currency_code: input.currency_code ?? "INR",
      budget_min: input.budget_min ?? null,
      budget_max: input.budget_max ?? null,
      delivery_date: input.delivery_date ?? null,
      delivery_time: input.delivery_time ?? null,
      timezone: input.timezone ?? null,
      description: input.description,
      has_sample: input.has_sample,
      figma_link: input.has_sample ? input.figma_link ?? null : null,
      adobe_link: input.has_sample ? input.adobe_link ?? null : null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await replaceProjectDomains(data.id, input.domains ?? []);
  return data as unknown as Project;
}

export async function getMyProjects(): Promise<Project[]> {
  const { data, error } = await supabase()
    .from("projects")
    .select(PROJECT_SELECT)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase()
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as unknown as Project) ?? null;
}

export async function createProject(input: NewProjectInput): Promise<Project> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase()
    .from("projects")
    .insert({
      client_id: user.id,
      name: input.name,
      service: input.service,
      skills: input.skills ?? [],
      project_type: input.project_type,
      address: input.project_type === "on_site" ? input.address ?? null : null,
      city: input.project_type === "on_site" ? input.city ?? null : null,
      state: input.project_type === "on_site" ? input.state ?? null : null,
      pincode: input.project_type === "on_site" ? input.pincode ?? null : null,
      budget: input.budget ?? null,
      deadline: input.deadline ?? null,
      priority: input.priority ?? "medium",
      currency_code: input.currency_code ?? "INR",
      budget_min: input.budget_min ?? null,
      budget_max: input.budget_max ?? null,
      delivery_date: input.delivery_date ?? null,
      delivery_time: input.delivery_time ?? null,
      timezone: input.timezone ?? null,
      description: input.description,
      has_sample: input.has_sample,
      is_published: true,
      figma_link: input.has_sample ? input.figma_link ?? null : null,
      adobe_link: input.has_sample ? input.adobe_link ?? null : null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  await replaceProjectDomains(data.id, input.domains ?? []);
  return data as unknown as Project;
}

export async function updateProject(
  id: string,
  patch: Partial<{
    name: string;
    status: Project["status"];
    progress: number;
    engineer_id: string | null;
    description: string;
    priority: Project["priority"];
    budget: number | null;
    deadline: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    skills: string[];
    currency_code: string | null;
    budget_min: number | null;
    budget_max: number | null;
    delivery_date: string | null;
    delivery_time: string | null;
    timezone: string | null;
  }>
) {
  const { error } = await supabase().from("projects").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAccessibleProjects(): Promise<Project[]> {
  const { data, error } = await supabase()
    .from("projects")
    .select(PROJECT_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Project[];
}

export interface BrowseFilters {
  query?: string;
  service?: string;
  domains?: string[];
  project_type?: "online" | "on_site" | "";
  budgetMax?: number | null;
  budgetMin?: number | null;
  deadline?: string | null;
  location?: string;
  sort?: "newest" | "budget_high" | "budget_low" | "deadline";
}

export async function browseProjects(filters: BrowseFilters = {}): Promise<Project[]> {
  const hasDomains = (filters.domains ?? []).length > 0;
  let query = supabase()
    .from("projects")
    .select(
      hasDomains
        ? `*, 
  client:client_id(id, full_name, email, avatar_url), 
  engineer:engineer_id(id, full_name, email, avatar_url),
  domains:project_domains!inner(domain:domain_id(*))`
        : PROJECT_SELECT
    )
    .eq("is_published", true)
    .eq("status", "pending");

  if (filters.query) {
    query = query.ilike("name", `%${filters.query}%`);
  }
  if (filters.service) {
    query = query.eq("service", filters.service);
  }
  if (hasDomains) {
    query = query.in("domains.domain_id", filters.domains!);
  }
  if (filters.project_type) {
    query = query.eq("project_type", filters.project_type);
  }
  if (filters.budgetMin != null) {
    query = query.gte("budget_min", filters.budgetMin);
  }
  if (filters.budgetMax != null) {
    query = query.lte("budget_max", filters.budgetMax);
  }
  if (filters.deadline) {
    query = query.lte("delivery_date", filters.deadline);
  }
  if (filters.location) {
    query = query.or(`address.ilike.%${filters.location}%,city.ilike.%${filters.location}%`);
  }

  switch (filters.sort) {
    case "budget_high":
      query = query.order("budget_max", { ascending: false });
      break;
    case "budget_low":
      query = query.order("budget_min", { ascending: true });
      break;
    case "deadline":
      query = query.order("delivery_date", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(100);
  if (error) throw new Error(error.message);
  const projects = (data ?? []) as unknown as Project[];
  return attachProposalCounts(projects);
}

export async function getRecommendedProjects(domainIds: string[]): Promise<Project[]> {
  if (!domainIds.length) return [];
  return browseProjects({ domains: domainIds });
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const { data, error } = await supabase()
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("is_published", true)
    .eq("status", "completed")
    .order("updated_at", { ascending: false })
    .limit(8);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Project[];
}

export async function publishProject(id: string, published: boolean) {
  const { error } = await supabase()
    .from("projects")
    .update({ is_published: published })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
