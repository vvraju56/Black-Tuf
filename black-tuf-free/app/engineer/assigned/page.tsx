"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { SERVICE_BY_ID, PROJECT_STATUS } from "@/utils/constants";
import { timeAgo } from "@/lib/utils";
import { Briefcase, ArrowRight } from "lucide-react";
import type { Project } from "@/types";
import { Progress } from "@/components/ui/progress";

export default function EngineerAssignedProjectsPage() {
  useDashboardTitle("Assigned Projects", "Projects where you're the engineer");
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();

  useRealtime("engineer-assigned", [
    { table: "projects", queryKeys: [["projects"]] },
  ]);

  const assigned = useMemo(
    () => (projects ?? []).filter((p) => p.engineer_id === user?.id),
    [projects, user]
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : assigned.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Assignments Yet"
          description="Projects you're hired for will appear here after a proposal is accepted."
          action={
            <Button variant="gradient" size="sm" asChild>
              <Link href="/engineer/projects">Browse Open Projects</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {assigned.map((p, i) => (
            <AssignedCard key={p.id} project={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignedCard({ project, index }: { project: Project; index: number }) {
  const svc = SERVICE_BY_ID[project.service as keyof typeof SERVICE_BY_ID];
  const st = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS] ?? PROJECT_STATUS.pending;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="font-semibold hover:text-primary hover:underline"
          >
            {project.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {svc?.title ?? project.service} · {project.project_type}
          </p>
        </div>
        <Badge variant={st.color as "secondary" | "success" | "warning" | "destructive" | "default" | "outline"}>
          {st.label}
        </Badge>
      </div>

      <div className="mt-3 space-y-1.5">
        <Progress value={project.progress} className="h-1.5" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{project.progress}% complete</span>
          <span>Updated {timeAgo(project.updated_at)}</span>
        </div>
      </div>

      <div className="mt-4">
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/dashboard/projects/${project.id}`}>
            Open Project Workspace <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
