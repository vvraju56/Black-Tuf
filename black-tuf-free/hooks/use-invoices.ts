"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvoice,
  getInvoices,
  getProjectInvoices,
  nextInvoiceNumber,
  updateInvoiceStatus,
} from "@/services/invoices";

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: () => [...invoiceKeys.all, "list"] as const,
  project: (id: string) => [...invoiceKeys.all, "project", id] as const,
};

export function useInvoices() {
  return useQuery({ queryKey: invoiceKeys.list(), queryFn: getInvoices });
}

export function useProjectInvoices(projectId: string) {
  return useQuery({
    queryKey: invoiceKeys.project(projectId),
    queryFn: () => getProjectInvoices(projectId),
    enabled: !!projectId,
  });
}

export function useNextInvoiceNumber() {
  return useQuery({
    queryKey: ["invoices", "next-number"],
    queryFn: nextInvoiceNumber,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.list() });
      queryClient.invalidateQueries({ queryKey: ["invoices", "next-number"] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: "pending" | "paid" | "overdue" | "cancelled" }) =>
      updateInvoiceStatus(vars.id, vars.status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.list() }),
  });
}