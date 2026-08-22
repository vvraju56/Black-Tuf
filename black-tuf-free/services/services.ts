import { supabase } from "./client";
import type { Service } from "@/types";

export interface ServiceInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string | null;
  image_url?: string | null;
  price?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAllServices(): Promise<Service[]> {
  const { data, error } = await supabase()
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
}

export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase()
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Service[];
}

export async function createService(input: ServiceInput) {
  const { error } = await supabase().from("services").insert({
    ...input,
    slug: input.slug || slugify(input.name),
    description: input.description ?? "",
    icon: input.icon ?? null,
    image_url: input.image_url ?? null,
    price: input.price ?? null,
    is_active: input.is_active ?? true,
    sort_order: input.sort_order ?? 0,
  });
  if (error) throw new Error(error.message);
}

export async function updateService(id: string, patch: Partial<ServiceInput>) {
  const { error } = await supabase().from("services").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteService(id: string) {
  const { error } = await supabase().from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
