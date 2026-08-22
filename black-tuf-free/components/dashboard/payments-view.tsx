"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useInvoices } from "@/hooks/use-invoices";
import { useMyContracts } from "@/hooks/use-contracts";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { CreditCard, CheckCircle2, Clock, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types";

const invStatusVariant: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  pending: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "secondary",
};

export function PaymentsView({ title = "Payments" }: { title?: string }) {
  useDashboardTitle(title, "Invoices and money");
  const { data: invoices, isLoading } = useInvoices();
  const { data: contracts } = useMyContracts();

  useRealtime("payments-view", [{ table: "invoices", queryKeys: [["invoices"]] }]);

  const stats = useMemo(() => {
    const list = invoices ?? [];
    const paid = list.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const pending = list
      .filter((i) => i.status === "pending" || i.status === "overdue")
      .reduce((s, i) => s + i.amount, 0);
    return { total: list.length, paid, pending };
  }, [invoices]);

  const contractTotal = useMemo(
    () => (contracts ?? []).filter((c) => c.status !== "cancelled").reduce((s, c) => s + c.amount, 0),
    [contracts]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" /> Paid
          </p>
          <p className="mt-1 text-2xl font-bold text-success">{formatCurrency(stats.paid)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-warning" /> Outstanding
          </p>
          <p className="mt-1 text-2xl font-bold text-warning">{formatCurrency(stats.pending)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" /> Under contract
          </p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(contractTotal)}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : !invoices || invoices.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Payments Yet"
          description="Invoices against your projects will appear here."
          action={
            <Button variant="gradient" size="sm" asChild>
              <Link href="/dashboard/projects">Go to Projects</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((inv: Invoice, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{inv.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {inv.project?.name ?? "Project"} · {inv.description || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Issued {formatDate(inv.created_at)}
                    {inv.due_date ? ` · Due ${formatDate(inv.due_date)}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={invStatusVariant[inv.status]}>{inv.status}</Badge>
                <p className="text-lg font-bold">{formatCurrency(inv.amount)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
