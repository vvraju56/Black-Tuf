"use client";

import { useAuth } from "@/hooks/use-auth";
import { useModuleFlags } from "@/hooks/use-modules";
import { useProjects } from "@/hooks/use-projects";
import { useVisits } from "@/hooks/use-visits";
import { useRealtime } from "@/hooks/use-realtime";
import { PROJECT_STATUS, VISIT_STATUS } from "@/utils/constants";
import { timeAgo } from "@/lib/utils";
import type { Project, SiteVisit } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";

export default function EngineerPage() {
  useDashboardTitle("Engineer Dashboard");
  const { user, profile } = useAuth();
  const { data: flags } = useModuleFlags();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: visits, isLoading: visitsLoading } = useVisits();

  useRealtime("engineer-page", [
    { table: "projects", queryKeys: [["projects"]] },
    { table: "site_visits", queryKeys: [["visits", "list"]] },
  ]);

  if (!user) return null;

  const role = profile?.role;
  const isEngineer = role === "engineer" || role === "admin";
  if (!isEngineer) return null;

  const assigned = (projects ?? []).filter((p) => p.engineer_id === user.id);
  const myVisits = (visits ?? []).filter((v) => v.engineer_id === user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Assigned Projects</h2>
        <p className="text-sm text-muted-foreground">{assigned.length} projects assigned to you</p>
      </div>

      {projectsLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : assigned.length === 0 ? (
        <Empty title="No projects assigned" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {assigned.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {flags?.["site_visits"] !== false && (
        <>
          <div>
            <h2 className="text-lg font-semibold">My Site Visits</h2>
            <p className="text-sm text-muted-foreground">{myVisits.length} visits assigned</p>
          </div>

          {visitsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : myVisits.length === 0 ? (
            <Empty title="No visits assigned" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {myVisits.map((v) => (
                <VisitCard key={v.id} visit={v} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const st = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS] ?? PROJECT_STATUS.pending;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Badge variant={st.color as any}>{st.label}</Badge>
        <p className="text-xs text-muted-foreground">Progress: {project.progress}%</p>
        <p className="text-xs text-muted-foreground">{timeAgo(project.updated_at)}</p>
      </CardContent>
    </Card>
  );
}

function VisitCard({ visit }: { visit: SiteVisit }) {
  const st = VISIT_STATUS[visit.status as keyof typeof VISIT_STATUS] ?? VISIT_STATUS.requested;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{visit.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Badge variant={st.color as any}>{st.label}</Badge>
        {visit.visit_date ? <p className="text-xs text-muted-foreground">{visit.visit_date.slice(0, 10)}</p> : null}
        <p className="text-xs text-muted-foreground">{timeAgo(visit.created_at)}</p>
      </CardContent>
    </Card>
  );
}

function Empty({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-dashed py-8 text-center">
      <CalendarDays className="mx-auto h-6 w-6 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">{title}</p>
    </div>
  );
}
