"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/client";

export interface PublicStats {
  projectsCompleted: number;
  professionals: number;
  clients: number;
  successRate: number;
  countries: number;
  yearsExperience: number;
}

async function getPublicStats(): Promise<PublicStats> {
  const [projectsRes, engineersRes, clientsRes, feedbackRes, locationsRes, expRes] =
    await Promise.all([
      supabase()
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .eq("status", "completed"),
      supabase()
        .from("engineer_profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_available", true),
      supabase()
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "client"),
      supabase().from("feedback").select("rating").eq("is_approved", true),
      supabase()
        .from("engineer_profiles")
        .select("location")
        .not("location", "is", null),
      supabase().from("engineer_profiles").select("experience_years"),
    ]);

  const ratings = (feedbackRes.data ?? []) as Array<{ rating: number }>;
  const avg =
    ratings.length > 0
      ? ratings.reduce((s, r) => s + (r.rating ?? 0), 0) / ratings.length
      : 0;
  const successRate =
    ratings.length > 0 ? Math.min(100, Math.round((avg / 5) * 100)) : 0;

  const locations = (locationsRes.data ?? []) as Array<{ location: string | null }>;
  const countries = new Set(
    locations
      .map((l) => l.location?.trim().toLowerCase().split(",").pop()?.trim())
      .filter((c): c is string => !!c)
  ).size;

  const experiences = (expRes.data ?? []) as Array<{ experience_years: number | null }>;
  const yearsExperience = experiences.reduce(
    (max, e) => Math.max(max, e.experience_years ?? 0),
    0
  );

  return {
    projectsCompleted: projectsRes.count ?? 0,
    professionals: engineersRes.count ?? 0,
    clients: clientsRes.count ?? 0,
    successRate,
    countries,
    yearsExperience,
  };
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: getPublicStats,
    staleTime: 5 * 60_000,
  });
}
