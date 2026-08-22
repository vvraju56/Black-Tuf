"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, FileSearch, Mail, Star, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useProposalsForProject } from "@/hooks/use-proposals";
import { useUpdateProposalStatus } from "@/hooks/use-proposals";
import { useAuth } from "@/hooks/use-auth";
import { useCreateContract } from "@/hooks/use-contracts";
import { useProject } from "@/hooks/use-projects";
import { toast } from "sonner";
import { formatCurrency, timeAgo } from "@/lib/utils";

const statusVariant: Record<string, "secondary" | "warning" | "success" | "destructive"> = {
  pending: "secondary",
  shortlisted: "warning",
  accepted: "success",
  rejected: "destructive",
};

export function ProposalsList({ projectId }: { projectId: string }) {
  const { data: proposals, isLoading } = useProposalsForProject(projectId);
  const { user } = useAuth();
  const updateStatus = useUpdateProposalStatus();
  const createContract = useCreateContract();
  const { data: project } = useProject(projectId);

  const accept = (proposalId: string, engineerId: string, price: number) => {
    updateStatus.mutate(
      { id: proposalId, status: "accepted" },
      {
        onSuccess: () => {
          if (project) {
            createContract.mutate(
              {
                project_id: project.id,
                client_id: project.client_id,
                engineer_id: engineerId,
                proposal_id: proposalId,
                amount: price,
                terms: `Milestone-based contract for "${project.name}".`,
              },
              { onError: () => toast.error("Proposal accepted but contract could not be created.") }
            );
          }
          toast.success("Proposal accepted. Contract created.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <EmptyState
        icon={FileSearch}
        title="No proposals yet"
        description="Engineers will submit proposals for this project."
      />
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-2xl border p-5 ${
            p.status === "accepted"
              ? "border-success/40 bg-success/5"
              : "border-border bg-muted/20"
          }`}
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
                  <Link
                    href={`/engineers/${p.engineer_id}`}
                    className="font-semibold hover:text-primary hover:underline"
                  >
                    {p.engineer?.full_name ?? "Engineer"}
                  </Link>
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  {p.engineer_profile?.experience_years ? (
                    <span>{p.engineer_profile.experience_years} yrs experience</span>
                  ) : null}
                  {p.engineer_profile?.rating != null && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {p.engineer_profile.rating}
                    </span>
                  )}
                  <span>{timeAgo(p.created_at)}</span>
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {p.portfolio_link ? (
                <a
                  href={p.portfolio_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View portfolio ↗
                </a>
              ) : (
                <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> No portfolio link</span>
              )}
            </div>

            {user && p.engineer_id !== user.id && (project?.client_id === user.id) && p.status !== "accepted" && (
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
                  onClick={() => accept(p.id, p.engineer_id, p.price)}
                >
                  <Check className="h-4 w-4" /> Accept
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
  );
}

export function EmptyProposals() {
  return (
    <EmptyState
      icon={UserX}
      title="No proposals yet"
      description="Share your project to attract engineers, or post it publicly."
    />
  );
}
