"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { useClientProposals, useUpdateProposalStatus } from "@/hooks/use-proposals";
import { useCreateContract } from "@/hooks/use-contracts";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { toast } from "sonner";
import { FileText, Check, Star } from "lucide-react";
import { formatCurrency, timeAgo } from "@/lib/utils";

const statusVariant: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  pending: "warning",
  shortlisted: "secondary",
  accepted: "success",
  rejected: "destructive",
};

export default function ClientProposalsPage() {
  useDashboardTitle("Proposals", "Proposals received from engineers");
  const { data: proposals, isLoading } = useClientProposals();
  const updateStatus = useUpdateProposalStatus();
  const createContract = useCreateContract();

  useRealtime("client-proposals", [
    { table: "proposals", queryKeys: [["proposals", "client"]] },
  ]);

  const accept = (id: string, projectId: string, engineerId: string, clientId: string, price: number) => {
    updateStatus.mutate(
      { id, status: "accepted" },
      {
        onSuccess: () => {
          createContract.mutate(
            {
              project_id: projectId,
              client_id: clientId,
              engineer_id: engineerId,
              proposal_id: id,
              amount: price,
              terms: `Milestone-based contract generated from an accepted proposal.`,
            },
            { onError: () => toast.error("Accepted, but the contract could not be created.") }
          );
          toast.success("Proposal accepted. Contract created.");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : !proposals || proposals.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Proposals"
          description="Proposals engineers send for your projects will appear here."
          action={
            <Button variant="gradient" size="sm" asChild>
              <Link href="/dashboard/projects/new">Post a Project</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {proposals.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarWithFallback
                    src={p.engineer?.avatar_url}
                    name={p.engineer?.full_name}
                    email={p.engineer?.email}
                    size="lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/engineers/${p.engineer_id}`} className="font-semibold hover:text-primary hover:underline">
                        {p.engineer?.full_name ?? "Engineer"}
                      </Link>
                      <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.project?.name ?? "Project"} · {timeAgo(p.created_at)}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {p.engineer_profile?.experience_years != null && (
                        <span>{p.engineer_profile.experience_years} yrs exp</span>
                      )}
                      {p.engineer_profile?.rating != null && (
                        <span className="inline-flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-warning text-warning" /> {p.engineer_profile.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">{formatCurrency(p.price)}</p>
                  <p className="text-xs text-muted-foreground">{p.estimated_time}</p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.cover_letter}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                <p className="text-xs text-muted-foreground">
                  Proposal ID · {p.id.slice(0, 8)}
                </p>
                {p.status !== "accepted" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus.mutate({ id: p.id, status: "shortlisted" })}
                    >
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant="gradient"
                      disabled={updateStatus.isPending || createContract.isPending}
                      onClick={() => accept(p.id, p.project_id, p.engineer_id, p.project?.client_id ?? "", p.price)}
                    >
                      <Check className="h-4 w-4" /> Accept &amp; Contract
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => updateStatus.mutate({ id: p.id, status: "rejected" })}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
