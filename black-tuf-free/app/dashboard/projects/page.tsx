"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Filter, FolderKanban } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useRealtime } from "@/hooks/use-realtime";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { SERVICE_BY_ID, PROJECT_STATUS } from "@/utils/constants";
import { timeAgo } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const STATUS_FILTERS: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyProjectsPage() {
  useDashboardTitle("My Projects", "All your projects in one place");
  const { data: projects, isLoading } = useProjects();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");

  useRealtime("projects-list", [
    { table: "projects", queryKeys: [["projects"]] },
  ]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        SERVICE_BY_ID[p.service as keyof typeof SERVICE_BY_ID]?.title
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus = status === "all" || p.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={status === f.value ? "default" : "secondary"}
              onClick={() => setStatus(f.value as ProjectStatus | "all")}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium">No projects found.</p>
          <p className="text-sm text-muted-foreground">
            {search || status !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first project to get started."}
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/projects/new">New Project</Link>
          </Button>
        </div>
      ) : (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hide"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              variants={{ show: { opacity: 1, y: 0 }, hide: { opacity: 0, y: 12 } }}
            >
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: NonNullable<ReturnType<typeof useProjects>["data"]>[number] }) {
  const st = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS] ?? PROJECT_STATUS.pending;
  const svc = SERVICE_BY_ID[project.service as keyof typeof SERVICE_BY_ID];
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="block rounded-xl border p-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          <p className="text-sm text-muted-foreground">
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
    </Link>
  );
}
