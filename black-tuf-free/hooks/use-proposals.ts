"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllProposals,
  getMyProposals,
  getProposalCount,
  getProposalsForClient,
  getProposalsForProject,
  submitProposal,
  updateProposalStatus,
} from "@/services/proposals";
import type { ProposalStatus } from "@/types";

export const proposalKeys = {
  all: ["proposals"] as const,
  forProject: (id: string) => [...proposalKeys.all, "project", id] as const,
  mine: () => [...proposalKeys.all, "mine"] as const,
  forClient: () => [...proposalKeys.all, "client"] as const,
  allList: () => [...proposalKeys.all, "admin"] as const,
  count: (id: string) => [...proposalKeys.all, "count", id] as const,
};

export function useProposalsForProject(projectId: string) {
  return useQuery({
    queryKey: proposalKeys.forProject(projectId),
    queryFn: () => getProposalsForProject(projectId),
    enabled: !!projectId,
  });
}

export function useProposalCount(projectId: string) {
  return useQuery({
    queryKey: proposalKeys.count(projectId),
    queryFn: () => getProposalCount(projectId),
    enabled: !!projectId,
  });
}

export function useMyProposals() {
  return useQuery({
    queryKey: proposalKeys.mine(),
    queryFn: getMyProposals,
  });
}

export function useClientProposals() {
  return useQuery({
    queryKey: proposalKeys.forClient(),
    queryFn: getProposalsForClient,
  });
}

export function useAllProposals() {
  return useQuery({
    queryKey: proposalKeys.allList(),
    queryFn: getAllProposals,
  });
}

export function useSubmitProposal(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof submitProposal>[0]) => submitProposal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.forProject(projectId) });
      queryClient.invalidateQueries({ queryKey: proposalKeys.count(projectId) });
      queryClient.invalidateQueries({ queryKey: proposalKeys.mine() });
      queryClient.invalidateQueries({ queryKey: proposalKeys.forClient() });
      queryClient.invalidateQueries({ queryKey: proposalKeys.allList() });
    },
  });
}

export function useUpdateProposalStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProposalStatus }) =>
      updateProposalStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: proposalKeys.all });
    },
  });
}
