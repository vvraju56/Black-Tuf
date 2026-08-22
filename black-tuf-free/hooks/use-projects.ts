"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, getMyProjects, getProject, updateProject } from "@/services/projects";
import type { NewProjectInput } from "@/services/projects";
import type { Project } from "@/types";
import { browseKeys } from "@/hooks/use-browse-projects";

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: getMyProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewProjectInput) => createProject(input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      queryClient.invalidateQueries({ queryKey: browseKeys.all });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateProject>[1]) => updateProject(id, patch),
    onSuccess: (_, patch) => {
      queryClient.setQueryData<Project>(projectKeys.detail(id), (old) =>
        old ? { ...old, ...patch, updated_at: new Date().toISOString() } : old
      );
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.list() });
    },
  });
}
