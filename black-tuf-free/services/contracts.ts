import { supabase } from "./client";
import type { Contract, ContractStatus } from "@/types";

export async function getMyContracts(): Promise<Contract[]> {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase()
    .from("contracts")
    .select(`*, 
      project:project_id(id, name, service, status),
      client:client_id(id, full_name, email, avatar_url),
      engineer:engineer_id(id, full_name, email, avatar_url)`)
    .or(`client_id.eq.${user.id},engineer_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Contract[];
}

export async function getAllContracts(): Promise<Contract[]> {
  const { data, error } = await supabase()
    .from("contracts")
    .select(`*, 
      project:project_id(id, name, service, status),
      client:client_id(id, full_name, email),
      engineer:engineer_id(id, full_name, email)`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Contract[];
}

export async function createContract(input: {
  project_id: string;
  client_id: string;
  engineer_id: string;
  proposal_id?: string | null;
  amount: number;
  terms?: string;
}) {
  const { error } = await supabase().from("contracts").insert({
    project_id: input.project_id,
    client_id: input.client_id,
    engineer_id: input.engineer_id,
    proposal_id: input.proposal_id ?? null,
    amount: input.amount,
    terms: input.terms ?? "",
    status: "sent",
  });
  if (error) throw new Error(error.message);
}

export async function updateContractStatus(id: string, status: ContractStatus) {
  const { error } = await supabase()
    .from("contracts")
    .update({ status, signed_at: status === "signed" ? new Date().toISOString() : undefined })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
