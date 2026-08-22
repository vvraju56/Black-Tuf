import { supabase } from "./client";
import type { BlogPost } from "@/types";

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  cover_url?: string | null;
  tags?: string[];
  is_published?: boolean;
  published_at?: string | null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase()
    .from("blog_posts")
    .select("*, author:author_id(id, full_name, email, role)")
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase()
    .from("blog_posts")
    .select("*, author:author_id(id, full_name, email, role)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as unknown as BlogPost) ?? null;
}

export async function createBlogPost(input: BlogPostInput) {
  const { data: { user } } = await supabase().auth.getUser();
  const { error } = await supabase().from("blog_posts").insert({
    ...input,
    excerpt: input.excerpt ?? "",
    content: input.content ?? "",
    tags: input.tags ?? [],
    author_id: user?.id ?? null,
    is_published: input.is_published ?? false,
    published_at: input.is_published ? (input.published_at ?? new Date().toISOString()) : null,
  });
  if (error) throw new Error(error.message);
}

export async function updateBlogPost(id: string, patch: Partial<BlogPostInput>) {
  const { error } = await supabase().from("blog_posts").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase().from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
