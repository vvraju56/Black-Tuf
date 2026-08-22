"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminProjects, useAdminUsers, useAssignEngineer, adminKeys } from "@/hooks/use-admin";
import { useQueryClient } from "@tanstack/react-query";
import { updateProject } from "@/services/projects";
import { PROJECT_STATUS } from "@/utils/constants";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import type { Project, Profile, ProjectPriority } from "@/types";
import { PostProjectForm } from "@/features/admin/post-project-form";

const PRIORITY_COLOR: Record<ProjectPriority, "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export function ProjectsPanel() {
  const projects = useAdminProjects();
  const users = useAdminUsers();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [posting, setPosting] = useState(false);

  const list = projects.data ?? [];
  const engineers = (users.data ?? []).filter((u) => u.role === "engineer");
  const filtered = q
    ? list.filter((p) =>
        `${p.name} ${p.service} ${p.client?.full_name ?? ""}`.toLowerCase().includes(q.toLowerCase())
      )
    : list;

  const setStatus = async (id: string, status: string) => {
    await updateProject(id, { status: status as any });
    queryClient.invalidateQueries({ queryKey: adminKeys.projects });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Projects</CardTitle>
          <Button size="sm" onClick={() => setPosting((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" /> {posting ? "Close form" : "Post Project"}
          </Button>
        </div>
        <div className="relative w-72 max-w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            className="pl-8"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {posting ? <PostProjectForm onDone={() => setPosting(false)} /> : null}

        {projects.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No projects found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-3">Project</th>
                  <th className="pb-2 pr-3">Client</th>
                  <th className="pb-2 pr-3">Service</th>
                  <th className="pb-2 pr-3">Priority</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Progress</th>
                  <th className="pb-2 pr-3">Budget</th>
                  <th className="pb-2 pr-3">Deadline</th>
                  <th className="pb-2 pr-3">Engineer</th>
                  <th className="pb-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <ProjectRow
                    key={p.id}
                    project={p}
                    engineers={engineers}
                    onStatus={(s) => setStatus(p.id, s)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectRow({
  project,
  engineers,
  onStatus,
}: {
  project: Project;
  engineers: Profile[];
  onStatus: (status: string) => void;
}) {
  const assign = useAssignEngineer(project.id);
  return (
    <tr className="border-b last:border-0 align-top">
      <td className="py-2 pr-3">
        <Link href={`/dashboard/projects/${project.id}`} className="font-medium hover:underline">
          {project.name}
        </Link>
      </td>
      <td className="py-2 pr-3 text-muted-foreground">{project.client?.full_name ?? project.client?.email ?? "—"}</td>
      <td className="py-2 pr-3 capitalize">{project.service}</td>
      <td className="py-2 pr-3">
        <Badge variant={PRIORITY_COLOR[project.priority] ?? "secondary"} className="capitalize">
          {project.priority}
        </Badge>
      </td>
      <td className="py-2 pr-3">
        <select
          value={project.status}
          onChange={(e) => onStatus(e.target.value)}
          className="rounded-md border border-input text-sm px-2 py-1"
        >
          {Object.entries(PROJECT_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{project.progress}%</span>
        </div>
      </td>
      <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
        {project.budget != null ? `₹${project.budget.toLocaleString("en-IN")}` : "—"}
      </td>
      <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
        {project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN") : "—"}
      </td>
      <td className="py-2 pr-3">
        <select
          value={project.engineer_id ?? ""}
          onChange={(e) => assign.assign(e.target.value || null)}
          className="rounded-md border border-input text-sm px-2 py-1 max-w-36"
        >
          <option value="">Unassigned</option>
          {engineers.map((e) => (
            <option key={e.id} value={e.id}>{e.full_name ?? e.email}</option>
          ))}
        </select>
      </td>
      <td className="py-2 text-muted-foreground whitespace-nowrap">{timeAgo(project.updated_at)}</td>
    </tr>
  );
}
