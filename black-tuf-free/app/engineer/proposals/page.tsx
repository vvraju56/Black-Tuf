"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useMyProposals } from "@/hooks/use-proposals";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { Send, ArrowRight } from "lucide-react";
import { formatCurrency, timeAgo } from "@/lib/utils";

const statusVariant: Record<string, "warning" | "secondary" | "success" | "destructive"> = {
  pending: "warning",
  shortlisted: "secondary",
  accepted: "success",
  rejected: "destructive",
};

export default function EngineerProposalsPage() {
  useDashboardTitle("My Proposals", "Proposals you've submitted");
  const { data: proposals, isLoading } = useMyProposals();

  useRealtime("engineer-proposals", [
    { table: "proposals", queryKeys: [["proposals"]] },
  ]);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : !proposals || proposals.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No Proposals Yet"
          description="Submit proposals to open projects to start getting work."
          action={
            <Button variant="gradient" size="sm" asChild>
              <Link href="/engineer/projects">Browse Projects</Link>
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/projects/${p.project_id}`}
                    className="font-semibold hover:text-primary hover:underline"
                  >
                    {p.project?.name ?? "Project"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Submitted {timeAgo(p.created_at)} · {p.estimated_time}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                  <p className="text-lg font-bold text-success">{formatCurrency(p.price)}</p>
                </div>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.cover_letter}</p>

              {p.status === "accepted" && (
                <div className="mt-3">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href="/engineer/assigned">
                      View assignment <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
