"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useAllContracts, useUpdateContractStatus } from "@/hooks/use-contracts";
import { useRealtime } from "@/hooks/use-realtime";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { ScrollText } from "lucide-react";

const statusVariant: Record<string, "secondary" | "default" | "warning" | "success" | "destructive"> = {
  draft: "secondary",
  sent: "default",
  signed: "warning",
  active: "success",
  completed: "success",
  cancelled: "destructive",
};

export function ContractsPanel() {
  const { data: contracts, isLoading } = useAllContracts();
  const updateStatus = useUpdateContractStatus();
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  useRealtime("admin-contracts", [{ table: "contracts", queryKeys: [["contracts"]] }]);

  const list = (contracts ?? []).filter((c) => statusFilter === "all" || c.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "draft", "sent", "signed", "active", "completed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              statusFilter === f ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : list.length === 0 ? (
        <EmptyState icon={ScrollText} title="No Contracts" description="No contracts match your filters." />
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <div key={c.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {c.project?.name ?? "Project"} · {c.client?.full_name ?? "Client"} ↔ {c.engineer?.full_name ?? "Engineer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(c.amount)} · {timeAgo(c.created_at)}
                    {c.signed_at ? ` · signed ${timeAgo(c.signed_at)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                  {c.status === "sent" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateStatus.mutate(
                          { id: c.id, status: "active" },
                          { onSuccess: () => toast.success("Contract activated.") }
                        )
                      }
                    >
                      Activate
                    </Button>
                  )}
                  {c.status === "active" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateStatus.mutate(
                          { id: c.id, status: "completed" },
                          { onSuccess: () => toast.success("Contract completed.") }
                        )
                      }
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
