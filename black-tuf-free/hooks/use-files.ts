"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addProjectFile, deleteProjectFile, getProjectFiles, getAllFiles } from "@/services/files";

export const fileKeys = {
  all: ["project-files"] as const,
  list: (projectId: string) => [...fileKeys.all, "list", projectId] as const,
  allList: () => [...fileKeys.all, "all"] as const,
};

export function useAllFiles() {
  return useQuery({ queryKey: fileKeys.allList(), queryFn: getAllFiles });
}

export function useProjectFiles(projectId: string) {
  return useQuery({
    queryKey: fileKeys.list(projectId),
    queryFn: () => getProjectFiles(projectId),
    enabled: !!projectId,
  });
}

export function useAddProjectFile(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof addProjectFile>[0]) => addProjectFile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fileKeys.list(projectId) }),
  });
}

export function useDeleteProjectFile(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; storagePath?: string | null }) =>
      deleteProjectFile(vars.id, vars.storagePath),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: fileKeys.list(projectId) }),
  });
}