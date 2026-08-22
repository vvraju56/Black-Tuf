"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard, ProjectCardSkeleton } from "@/components/projects/project-card";
import { useRecommendedProjects } from "@/hooks/use-browse-projects";
import { useMyEngineerProfile } from "@/hooks/use-engineers";
import { useMyProposals } from "@/hooks/use-proposals";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { Sparkles, Settings2 } from "lucide-react";
import { useActiveServices } from "@/hooks/use-services";

export default function EngineerRecommendedPage() {
  useDashboardTitle("Recommended Projects", "Open projects matched to your service domains");
  const { data: profile, isLoading: profileLoading } = useMyEngineerProfile();
  const { services } = useActiveServices();
  const { data: projects, isLoading, isFetching } = useRecommendedProjects();
  const { data: myProposals } = useMyProposals();

  useRealtime("engineer-recommended", [
    { table: "projects", queryKeys: [["browse-projects"]] },
    { table: "project_domains", queryKeys: [["browse-projects"]] },
    { table: "freelancer_domains", queryKeys: [["engineers"]] },
    { table: "proposals", queryKeys: [["proposals"]] },
  ]);

  const myDomains = (profile?.freelancer_domains ?? []).map((d) => d.domain_id);
  const domainNames = useMemo(
    () =>
      services.filter((s) => myDomains.includes(s.id))
        .map((s) => s.short)
        .join(", "),
    [myDomains, services]
  );

  const appliedIds = useMemo(
    () => new Set((myProposals ?? []).map((p) => p.project_id)),
    [myProposals]
  );

  const noDomains = !profileLoading && myDomains.length === 0;

  return (
    <div className="space-y-6">
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Recommended for you</p>
            <p className="text-sm text-muted-foreground">
              {noDomains
                ? "Select your service domains to start getting matched."
                : `Matched to: ${domainNames || "your domains"}`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/engineer/settings">
            <Settings2 className="mr-1 h-4 w-4" /> Manage Domains
          </Link>
        </Button>
      </div>

      {noDomains ? (
        <EmptyState
          icon={Sparkles}
          title="No service domains selected yet"
          description="Choose the domains you serve and matching projects will appear here instantly — plus you'll be notified when new ones are posted."
          action={
            <Button variant="gradient" size="sm" asChild>
              <Link href="/engineer/settings">
                <Settings2 className="mr-1 h-4 w-4" /> Set Up My Domains
              </Link>
            </Button>
          }
        />
      ) : isLoading || profileLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No matching projects yet"
          description="New projects matching your domains will appear here in real time. Check the Global Projects page for everything else."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/engineer/projects">Browse Global Projects</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {projects.length} matching open project{projects.length === 1 ? "" : "s"}
              {isFetching ? " · syncing…" : ""}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p, i) => (
              <motion.div key={p.id}>
                <ProjectCard project={p} index={i} />
                {appliedIds.has(p.id) && (
                  <p className="mt-1 text-center text-xs text-primary">
                    ✓ You've submitted a proposal for this project
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
