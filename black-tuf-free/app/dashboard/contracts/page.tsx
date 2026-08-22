"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { useMyContracts, useUpdateContractStatus } from "@/hooks/use-contracts";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FileSignature, Check, PenLine, User, Briefcase } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Contract } from "@/types";

const statusVariant: Record<string, "secondary" | "default" | "warning" | "success" | "destructive"> = {
  draft: "secondary",
  sent: "default",
  signed: "warning",
  active: "success",
  completed: "success",
  cancelled: "destructive",
};

export default function ContractsPage() {
  useDashboardTitle("Contracts", "Agreements between you and engineers");
  const { user } = useAuth();
  const { data: contracts, isLoading } = useMyContracts();
  const updateStatus = useUpdateContractStatus();

  useRealtime("contracts-list", [{ table: "contracts", queryKeys: [["contracts"]] }]);

  const sign = (c: Contract) => {
    updateStatus.mutate(
      { id: c.id, status: "active" },
      { onSuccess: () => toast.success("Contract signed and activated.") }
    );
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No Contracts"
          description="Accepted proposals become contracts. You'll find them here."
          action={
            <Button variant="gradient" size="sm" asChild>
              <a href="/dashboard/proposals">Review Proposals</a>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {contracts.map((c, i) => {
            const isClient = user?.id === c.client_id;
            const other = isClient ? c.engineer : c.client;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AvatarWithFallback
                      src={other?.avatar_url}
                      name={other?.full_name}
                      email={other?.email}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{c.project?.name ?? "Project"}</span>
                        <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        {isClient ? (
                          <>
                            <User className="h-3 w-3" /> {c.engineer?.full_name ?? "Engineer"}
                          </>
                        ) : (
                          <>
                            <Briefcase className="h-3 w-3" /> {c.client?.full_name ?? "Client"}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">{formatCurrency(c.amount)}</p>
                    <p className="text-xs text-muted-foreground">Created {formatDate(c.created_at)}</p>
                  </div>
                </div>

                <p className="mt-3 rounded-lg border border-border/50 bg-background/40 p-3 text-sm leading-relaxed text-muted-foreground">
                  {c.terms}
                </p>

                {(c.milestones?.length ?? 0) > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {c.milestones.map((m, mi) => (
                      <div key={mi} className="flex items-center justify-between text-sm">
                        <span>{m.title}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(m.amount)}
                          {m.due ? ` · due ${formatDate(m.due)}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                  <p className="text-xs text-muted-foreground">
                    {c.signed_at ? `Signed ${formatDate(c.signed_at)}` : "Awaiting signature"}
                  </p>
                  {(c.status === "sent" || c.status === "draft") && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="gradient"
                        disabled={updateStatus.isPending}
                        onClick={() => sign(c)}
                      >
                        <Check className="h-4 w-4" /> Sign &amp; Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() =>
                          updateStatus.mutate(
                            { id: c.id, status: "cancelled" },
                            { onSuccess: () => toast.success("Contract cancelled.") }
                          )
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {c.status === "active" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateStatus.mutate(
                          { id: c.id, status: "completed" },
                          { onSuccess: () => toast.success("Contract marked completed.") }
                        )
                      }
                    >
                      <PenLine className="h-4 w-4" /> Mark Completed
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
