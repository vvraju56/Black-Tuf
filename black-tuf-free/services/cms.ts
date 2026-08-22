import { supabase } from "./client";

export interface SiteSettings {
  company_name?: string;
  tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  socials?: { label: string; url: string }[];
  announcement?: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  company_name: "Black Tuf",
  tagline: "Software & Engineering Company",
  contact_email: "hello@black-tuf.example",
  contact_phone: "+91 80 0000 0000",
  address: "Bengaluru, India · Remote-friendly",
  socials: [],
  announcement: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase()
    .from("site_settings")
    .select("key, value")
    .in("key", Object.keys(DEFAULT_SETTINGS));

  if (error) throw new Error(error.message);

  const merged = { ...DEFAULT_SETTINGS };
  for (const row of data ?? []) {
    (merged as Record<string, unknown>)[row.key] = row.value;
  }
  return merged;
}

export async function saveSiteSettings(settings: SiteSettings) {
  const entries = Object.entries(settings).map(([key, value]) => ({
    key,
    value: value as Record<string, unknown>,
  }));
  const { error } = await supabase().from("site_settings").upsert(entries);
  if (error) throw new Error(error.message);
}
