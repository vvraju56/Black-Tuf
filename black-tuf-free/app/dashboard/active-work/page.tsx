"use client";

import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { PROJECT_STATUS } from "@/utils/constants";
import { useState, useEffect } from "react";
import { supabase } from "@/services/client";

export default function ActiveWorkPage() {
  useDashboardTitle("Active Work", "Projects you are working on");
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    if (!user?.id) return;
    const { data } = await supabase()
      .from("projects")
      .select("*, client:client_id(full_name, avatar_url)")
      .eq("engineer_id", user.id)
      .order("updated_at", { ascending: false });
    setProjects(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  useRealtime("active-work-list", [
    { table: "projects", queryKeys: [["projects"]] },
  ]);

  const active = projects.filter((p) => p.status !== "completed");

  return (
    <div className="space-y-6 animate-black-tuf-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Active Work</h1>
          <p className="text-sm text-muted-foreground">Projects assigned to you.</p>
        </div>
        <Button asChild className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
          <Link href="/dashboard/projects">
            <Briefcase className="h-4 w-4" />
            Browse Projects
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <div className="black-tuf-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-4 text-sm font-semibold">No Active Work</p>
          <p className="mt-1 text-xs text-muted-foreground">Browse projects and submit proposals to get started.</p>
          <Button asChild size="sm" className="mt-4 gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
            <Link href="/dashboard/projects">
              <Plus className="h-4 w-4" />
              Browse Projects
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="black-tuf-card block rounded-2xl p-5 transition-all hover:border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.service} • {p.client?.full_name ?? "Client"}</p>
                </div>
                <Badge variant={PROJECT_STATUS[p.status as keyof typeof PROJECT_STATUS]?.color as "secondary" | "warning" | "success" | "destructive"}>{PROJECT_STATUS[p.status as keyof typeof PROJECT_STATUS]?.label}</Badge>
              </div>
              {p.status === "in_progress" && p.progress != null && (
                <div className="mt-3">
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{p.progress}% complete</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
