"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, FolderKanban } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useRealtime } from "@/hooks/use-realtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { PROJECT_STATUS } from "@/utils/constants";
import type { ProjectStatus } from "@/types";

const STATUS_FILTERS: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyProjectsPage() {
  useDashboardTitle("My Projects", "Projects you posted or are working on");
  const { data: projects, isLoading } = useProjects();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");

  useRealtime("my-projects-list", [
    { table: "projects", queryKeys: [["projects"]] },
  ]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.service.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || p.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, status]);

  return (
    <div className="space-y-6 animate-black-tuf-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-sm text-muted-foreground">Projects you posted or are working on.</p>
        </div>
        <Button asChild className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4" />
            Post Project
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${status === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="black-tuf-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <FolderKanban className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-4 text-sm font-semibold">No Projects Yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Create your first project to get started.</p>
          <Button asChild size="sm" className="mt-4 gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
            <Link href="/dashboard/projects/new">
              <Plus className="h-4 w-4" />
              Post Project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="black-tuf-card block rounded-2xl p-5 transition-all hover:border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.service}</p>
                </div>
                <Badge variant={PROJECT_STATUS[p.status as keyof typeof PROJECT_STATUS]?.color as "secondary" | "warning" | "success" | "destructive"}>{PROJECT_STATUS[p.status as keyof typeof PROJECT_STATUS]?.label}</Badge>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                {p.budget_min != null && <span>{p.currency_code ?? "INR"} {p.budget_min.toLocaleString()} — {p.budget_max?.toLocaleString()}</span>}
                {p.deadline && <span>Due {new Date(p.deadline + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
