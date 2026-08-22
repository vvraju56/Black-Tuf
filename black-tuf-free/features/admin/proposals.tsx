"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { useAllProposals, useUpdateProposalStatus } from "@/hooks/use-proposals";
import { useRealtime } from "@/hooks/use-realtime";
import { timeAgo, formatCurrency } from "@/lib/utils";
import { FileText } from "lucide-react";

const statusVariant: Record<string, "warning" | "secondary" | "success" | "destructive"> = {
  pending: "warning",
  shortlisted: "secondary",
  accepted: "success",
  rejected: "destructive",
};

export function ProposalsPanel() {
  const { data: proposals, isLoading } = useAllProposals();
  const updateStatus = useUpdateProposalStatus();
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [search, setSearch] = useState("");

  useRealtime("admin-proposals", [{ table: "proposals", queryKeys: [["proposals"]] }]);

  const list = (proposals ?? []).filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.engineer?.full_name ?? "").toLowerCase().includes(q) ||
      (p.project?.name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "pending", "shortlisted", "accepted", "rejected"] as const).map((f) => (
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
        <Input
          className="ml-auto max-w-[220px]"
          placeholder="Search engineer or project…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : list.length === 0 ? (
        <EmptyState icon={FileText} title="No Proposals" description="No proposals match your filters." />
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarWithFallback src={p.engineer?.avatar_url} name={p.engineer?.full_name} email={p.engineer?.email} />
                  <div>
                    <p className="text-sm font-medium">
                      {p.engineer?.full_name ?? "Engineer"} · {p.project?.name ?? "Project"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(p.price)} · {p.estimated_time} · {timeAgo(p.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                  {p.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          updateStatus.mutate(
                            { id: p.id, status: "shortlisted" },
                            { onSuccess: () => toast.success("Proposal shortlisted.") }
                          )
                        }
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() =>
                          updateStatus.mutate(
                            { id: p.id, status: "rejected" },
                            { onSuccess: () => toast.success("Proposal rejected.") }
                          )
                        }
                      >
                        Reject
                      </Button>
                    </>
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
