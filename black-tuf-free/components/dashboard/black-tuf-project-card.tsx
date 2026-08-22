"use client";

import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import type { Project } from "@/types";
import { PROJECT_STATUS } from "@/utils/constants";
import {
  ArrowRight,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectCardProps {
  project: Project;
  variant?: "default" | "compact";
}

export function BlackTufProjectCard({ project, variant = "default" }: ProjectCardProps) {
  const status = PROJECT_STATUS[project.status] ?? { label: project.status, color: "secondary" };
  const progress = project.progress ?? 0;

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === "compact") {
    return (
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="group flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-all hover:border-primary/30 hover:shadow-sm"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <DollarSign className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium group-hover:text-primary">{project.name}</p>
          <p className="text-xs text-muted-foreground">{project.service}</p>
        </div>
        <Badge variant={status.color as never} className="text-[10px]">{status.label}</Badge>
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group block black-tuf-card rounded-2xl p-5 transition-all hover:border-primary/30 black-tuf-hover-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold group-hover:text-primary">{project.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{project.service}</span>
            <span>·</span>
            <span className="capitalize">{project.project_type === "online" ? "Online" : "On-Site"}</span>
          </div>
        </div>
        <Badge
          variant={status.color as never}
          className={cn(
            "shrink-0",
            status.color === "success" && "bg-success/10 text-success",
            status.color === "warning" && "bg-warning/10 text-warning",
            status.color === "destructive" && "bg-destructive/10 text-destructive"
          )}
        >
          {status.label}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {project.budget != null && (
          <div className="flex items-center gap-2 text-xs">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">₹{project.budget.toLocaleString()}</span>
          </div>
        )}
        {project.deadline && (
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatDate(project.deadline)}</span>
          </div>
        )}
        {project.project_type === "on_site" && project.address && (
          <div className="col-span-2 flex items-center gap-2 text-xs">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">{project.address}</span>
          </div>
        )}
      </div>

      {project.status === "in_progress" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="mt-1.5 h-1.5" />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex items-center gap-2">
          {project.engineer ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage src={project.engineer.avatar_url ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-[9px] font-semibold text-primary">
                  {getInitials(project.engineer.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{project.engineer.full_name}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="black-tuf-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
        <div className="h-5 w-16 rounded bg-muted" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}
