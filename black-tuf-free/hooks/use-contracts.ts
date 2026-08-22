"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContract,
  getAllContracts,
  getMyContracts,
  updateContractStatus,
} from "@/services/contracts";
import type { ContractStatus } from "@/types";

export const contractKeys = {
  all: ["contracts"] as const,
  mine: () => [...contractKeys.all, "mine"] as const,
  allList: () => [...contractKeys.all, "admin"] as const,
};

export function useMyContracts() {
  return useQuery({ queryKey: contractKeys.mine(), queryFn: getMyContracts });
}

export function useAllContracts() {
  return useQuery({ queryKey: contractKeys.allList(), queryFn: getAllContracts });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createContract>[0]) => createContract(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}

export function useUpdateContractStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContractStatus }) =>
      updateContractStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
  });
}
