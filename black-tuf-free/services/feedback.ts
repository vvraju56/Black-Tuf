import { supabase } from "./client";
import type { Feedback } from "@/types";

export async function getFeedback(projectId?: string): Promise<Feedback[]> {
  let query = supabase()
    .from("feedback")
    .select("*, client:client_id(id, full_name, email, role), project:project_id(id, name, service)");

  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Feedback[];
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const { data, error } = await supabase()
    .from("feedback")
    .select("*, client:client_id(id, full_name, email, role), project:project_id(id, name, service)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Feedback[];
}

export async function getFeedbackForProject(projectId: string): Promise<Feedback | null> {
  const { data, error } = await supabase()
    .from("feedback")
    .select("*, client:client_id(id, full_name, email, role)")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as unknown as Feedback) ?? null;
}

export async function submitFeedback(input: {
  project_id: string;
  client_id: string;
  rating: number;
  communication: number;
  quality: number;
  delivery: number;
  support: number;
  comment?: string;
}) {
  const { error } = await supabase()
    .from("feedback")
    .upsert(
      {
        project_id: input.project_id,
        client_id: input.client_id,
        rating: input.rating,
        communication: input.communication,
        quality: input.quality,
        delivery: input.delivery,
        support: input.support,
        comment: input.comment ?? "",
      },
      { onConflict: "project_id,client_id" }
    );

  if (error) throw new Error(error.message);
}

export async function setFeedbackApproved(id: string, approved: boolean) {
  const { error } = await supabase().from("feedback").update({ is_approved: approved }).eq("id", id);
  if (error) throw new Error(error.message);
}
