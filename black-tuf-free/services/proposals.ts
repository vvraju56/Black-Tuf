import { supabase } from "./client";
import type { Proposal, ProposalStatus } from "@/types";

const PROPOSAL_SELECT = `*, 
  engineer:engineer_id(id, full_name, email, role, avatar_url),
  engineer_profile:engineer_id(*),
  project:project_id(id, name, client_id, service, budget, status)`;

export async function getProposalsForProject(projectId: string): Promise<Proposal[]> {
  const { data, error } = await supabase()
    .from("proposals")
    .select(PROPOSAL_SELECT)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Proposal[];
}

export async function getMyProposals(): Promise<Proposal[]> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase()
    .from("proposals")
    .select(`*, project:project_id(id, name, service, budget, status, deadline)`)
    .eq("engineer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Proposal[];
}

export async function getProposalsForClient(): Promise<Proposal[]> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: projects } = await supabase()
    .from("projects")
    .select("id")
    .eq("client_id", user.id);

  const ids = (projects ?? []).map((p: { id: string }) => p.id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase()
    .from("proposals")
    .select(PROPOSAL_SELECT)
    .in("project_id", ids)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Proposal[];
}

export async function getAllProposals(): Promise<Proposal[]> {
  const { data, error } = await supabase()
    .from("proposals")
    .select(`*, 
      engineer:engineer_id(id, full_name, email, role),
      project:project_id(id, name, service, status)`)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Proposal[];
}

export async function submitProposal(input: {
  project_id: string;
  engineer_id: string;
  price: number;
  estimated_time: string;
  cover_letter: string;
  portfolio_link?: string | null;
}): Promise<Proposal> {
  const { data, error } = await supabase()
    .from("proposals")
    .upsert(
      {
        project_id: input.project_id,
        engineer_id: input.engineer_id,
        price: input.price,
        estimated_time: input.estimated_time,
        cover_letter: input.cover_letter,
        portfolio_link: input.portfolio_link ?? null,
        status: "pending",
      },
      { onConflict: "project_id,engineer_id" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as Proposal;
}

export async function updateProposalStatus(id: string, status: ProposalStatus) {
  const { error } = await supabase().from("proposals").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function hasSubmitted(projectId: string, engineerId: string): Promise<boolean> {
  const { data, error } = await supabase()
    .from("proposals")
    .select("id")
    .eq("project_id", projectId)
    .eq("engineer_id", engineerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function getProposalCount(projectId: string): Promise<number> {
  const { count, error } = await supabase()
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}
