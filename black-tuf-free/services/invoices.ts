import { supabase } from "./client";
import type { Invoice, InvoiceStatus } from "@/types";

export async function getProjectInvoices(projectId: string): Promise<Invoice[]> {
  const { data, error } = await supabase()
    .from("invoices")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Invoice[];
}

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase()
    .from("invoices")
    .select("*, project:project_id(id, name, service, client_id)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Invoice[];
}

export async function createInvoice(input: {
  project_id: string;
  invoice_number: string;
  description?: string;
  amount: number;
  due_date?: string | null;
  file_path?: string | null;
}) {
  const { error } = await supabase().from("invoices").insert({
    project_id: input.project_id,
    invoice_number: input.invoice_number,
    description: input.description ?? "",
    amount: input.amount,
    due_date: input.due_date ?? null,
    file_path: input.file_path ?? null,
    status: "pending",
  });

  if (error) throw new Error(error.message);
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const { error } = await supabase().from("invoices").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function nextInvoiceNumber(): Promise<string> {
  const { data, error } = await supabase()
    .from("invoices")
    .select("invoice_number")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);

  const last = data?.[0]?.invoice_number;
  const seq = last ? parseInt(last.replace(/\D/g, ""), 10) + 1 : 1;
  return `INV-${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`;
}
