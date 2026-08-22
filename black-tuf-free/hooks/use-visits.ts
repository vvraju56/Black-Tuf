"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cancelVisit, createVisit, getVisits, updateVisit } from "@/services/visits";

export const visitKeys = {
  all: ["visits"] as const,
  list: () => [...visitKeys.all, "list"] as const,
};

export function useVisits() {
  return useQuery({ queryKey: visitKeys.list(), queryFn: getVisits });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVisit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: visitKeys.list() }),
  });
}

export function useUpdateVisit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateVisit>[1]) => updateVisit(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: visitKeys.list() }),
  });
}

export function useCancelVisit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelVisit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: visitKeys.list() }),
  });
}