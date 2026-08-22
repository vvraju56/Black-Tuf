"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSavedEngineers, isEngineerSaved, saveEngineer, unsaveEngineer } from "@/services/saved-engineers";
import { useAuth } from "@/hooks/use-auth";

export const savedKeys = {
  all: ["saved-engineers"] as const,
  list: () => [...savedKeys.all, "list"] as const,
  check: (id: string) => [...savedKeys.all, "check", id] as const,
};

export function useSavedEngineers() {
  return useQuery({ queryKey: savedKeys.list(), queryFn: getSavedEngineers });
}

export function useIsEngineerSaved(engineerId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: savedKeys.check(engineerId),
    queryFn: () => isEngineerSaved(engineerId),
    enabled: !!user && !!engineerId && user.role === "client",
  });
}

export function useSaveEngineer(engineerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => saveEngineer(engineerId),
    onSuccess: () => {
      queryClient.setQueryData(savedKeys.check(engineerId), true);
      queryClient.invalidateQueries({ queryKey: savedKeys.list() });
    },
  });
}

export function useUnsaveEngineer(engineerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unsaveEngineer(engineerId),
    onSuccess: () => {
      queryClient.setQueryData(savedKeys.check(engineerId), false);
      queryClient.invalidateQueries({ queryKey: savedKeys.list() });
    },
  });
}
