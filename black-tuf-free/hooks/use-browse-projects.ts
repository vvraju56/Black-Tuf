"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { browseProjects, getFeaturedProjects, getRecommendedProjects, publishProject, type BrowseFilters } from "@/services/projects";
import { useMyEngineerProfile } from "@/hooks/use-engineers";

export const browseKeys = {
  all: ["browse-projects"] as const,
  list: (filters: BrowseFilters) => [...browseKeys.all, JSON.stringify(filters)] as const,
  featured: () => [...browseKeys.all, "featured"] as const,
  recommended: () => [...browseKeys.all, "recommended"] as const,
};

export function useBrowseProjects(filters: BrowseFilters) {
  return useQuery({
    queryKey: browseKeys.list(filters),
    queryFn: () => browseProjects(filters),
  });
}

export function useFeaturedProjects() {
  return useQuery({
    queryKey: browseKeys.featured(),
    queryFn: getFeaturedProjects,
  });
}

export function useRecommendedProjects() {
  const { data: profile } = useMyEngineerProfile();
  const domainIds = (profile?.freelancer_domains ?? [])
    .map((d) => d.domain_id)
    .filter(Boolean);

  return useQuery({
    queryKey: [...browseKeys.recommended(), domainIds],
    queryFn: () => getRecommendedProjects(domainIds),
    enabled: domainIds.length > 0,
  });
}

export function usePublishProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      publishProject(id, published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: browseKeys.all });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
