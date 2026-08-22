"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEngineer,
  getEngineers,
  getAllEngineers,
  upsertEngineerProfile,
  setFreelancerDomains,
} from "@/services/engineers";
import { useAuth } from "@/hooks/use-auth";
import type { EngineerProfile } from "@/types";

export const engineerKeys = {
  all: ["engineers"] as const,
  list: () => [...engineerKeys.all, "list"] as const,
  adminList: () => [...engineerKeys.all, "admin"] as const,
  detail: (id: string) => [...engineerKeys.all, "detail", id] as const,
};

export function useEngineers() {
  return useQuery({ queryKey: engineerKeys.list(), queryFn: getEngineers });
}

export function useAllEngineers() {
  return useQuery({ queryKey: engineerKeys.adminList(), queryFn: getAllEngineers });
}

export function useEngineer(userId: string) {
  return useQuery({
    queryKey: engineerKeys.detail(userId),
    queryFn: () => getEngineer(userId),
    enabled: !!userId,
  });
}

export function useMyEngineerProfile() {
  const { user } = useAuth();
  return useEngineer(user?.id ?? "");
}

export function useUpsertEngineerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<EngineerProfile>) => upsertEngineerProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engineerKeys.all });
    },
  });
}

export function useSetFreelancerDomains() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainIds: string[]) => setFreelancerDomains(domainIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engineerKeys.all });
    },
  });
}
