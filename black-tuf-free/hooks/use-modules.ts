"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getModuleFlags, saveModuleFlags } from "@/services/modules";

export const moduleKeys = {
  all: ["modules"] as const,
};

export function useModuleFlags() {
  return useQuery({
    queryKey: moduleKeys.all,
    queryFn: getModuleFlags,
    staleTime: 30_000,
  });
}

export function useSaveModuleFlags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveModuleFlags,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all });
    },
  });
}
