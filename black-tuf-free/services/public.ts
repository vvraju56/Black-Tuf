import { createClient } from "@/lib/supabase/server";
import type { Project, Feedback, BlogPost } from "@/types";

export async function getPublicPortfolio(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .eq("status", "completed")
    .order("updated_at", { ascending: false })
    .limit(12);

  if (error) throw error;
  return (data ?? []) as unknown as Project[];
}

export async function getPublicBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:author_id(id, full_name, email, role)")
    .eq("is_published", true)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as unknown as BlogPost[];
}

export async function getPublicBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:author_id(id, full_name, email, role)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as BlogPost) ?? null;
}

export async function getPublicTestimonials(): Promise<Feedback[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select(
      "*, client:client_id(id, full_name, email, avatar_url), project:project_id(id, name, service)"
    )
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) throw error;
  return (data ?? []) as unknown as Feedback[];
}

export async function getPublicStats(): Promise<{ projects: number; clients: number }> {
  const supabase = await createClient();
  const [projectsRes, clientsRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client"),
  ]);
  return {
    projects: projectsRes.count ?? 0,
    clients: clientsRes.count ?? 0,
  };
}
