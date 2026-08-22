import { supabase } from "./client";
import type { SiteVisit, VisitStatus } from "@/types";

export async function getVisits(): Promise<SiteVisit[]> {
  const { data, error } = await supabase()
    .from("site_visits")
    .select(
      "*, project:project_id(id, name, status), engineer:engineer_id(id, full_name, email, role), client:client_id(id, full_name, email, role)"
    )
    .order("visit_date", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SiteVisit[];
}

export async function createVisit(input: {
  project_id: string;
  client_id: string;
  title?: string;
  notes?: string;
}) {
  const { error } = await supabase().from("site_visits").insert({
    project_id: input.project_id,
    client_id: input.client_id,
    title: input.title ?? "Site visit",
    notes: input.notes ?? "",
    status: "requested",
  });

  if (error) throw new Error(error.message);
}

export async function updateVisit(
  id: string,
  patch: Partial<{
    visit_date: string | null;
    visit_time: string | null;
    engineer_id: string | null;
    status: VisitStatus;
    notes: string;
  }>
) {
  const { error } = await supabase().from("site_visits").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function cancelVisit(id: string) {
  const { error } = await supabase().from("site_visits").update({ status: "cancelled" }).eq("id", id);
  if (error) throw new Error(error.message);
}
