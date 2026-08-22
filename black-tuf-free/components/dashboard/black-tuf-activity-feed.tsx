"use client";

import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useProjects } from "@/hooks/use-projects";
import { cn, timeAgo } from "@/lib/utils";
import {
  FolderPlus,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type ActivityType =
  | "project_posted"
  | "engineer_assigned"
  | "project_completed"
  | "client_joined"
  | "visit_scheduled";

interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
    role: string;
  };
  description: string;
  project?: {
    name: string;
    href: string;
  };
  timestamp: string;
}

export function BlackTufActivityFeed() {
  const { user } = useAuth();
  const { data: notifications } = useNotifications(user?.id ?? "");
  const { data: projects } = useProjects();

  // Real activity only — built from actual notifications and projects.
  const activity: ActivityItem[] = [];
  for (const n of notifications ?? []) {
    const type = activityTypeFromNotification(n.title);
    if (!type) continue;
    activity.push({
      id: n.id,
      type,
      user: { name: user?.user_metadata?.full_name ?? user?.email ?? "You", role: "client" },
      description: n.body || n.title,
      timestamp: n.created_at,
    });
  }
  for (const p of projects ?? []) {
    activity.push({
      id: `project-${p.id}`,
      type: "project_posted",
      user: {
        name: p.client?.full_name ?? "Client",
        avatar: p.client?.avatar_url ?? undefined,
        role: "client",
      },
      description: `posted a new project: ${p.name}`,
      project: { name: p.name, href: `/dashboard/projects/${p.id}` },
      timestamp: p.created_at,
    });
  }

  const sorted = activity
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="black-tuf-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent Activity</h2>
      </div>
      {sorted.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            No activity yet. Post a project or respond to a notification and it will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((item) => (
            <ActivityCard key={item.id} activity={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function activityTypeFromNotification(title: string): ActivityType | null {
  const t = title.toLowerCase();
  if (t.includes("project") && t.includes("match")) return "project_posted";
  if (t.includes("assigned")) return "engineer_assigned";
  if (t.includes("complete") || t.includes("completed")) return "project_completed";
  if (t.includes("visit")) return "visit_scheduled";
  if (t.includes("proposal")) return "engineer_assigned";
  if (t.includes("welcome")) return "client_joined";
  return null;
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "project_posted":
        return <FolderPlus className="h-4 w-4" />;
      case "engineer_assigned":
        return <UserCheck className="h-4 w-4" />;
      case "project_completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "client_joined":
        return <UserPlus className="h-4 w-4" />;
      case "visit_scheduled":
        return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "project_posted":
        return "bg-blue-500/10 text-blue-500";
      case "engineer_assigned":
        return "bg-green-500/10 text-green-500";
      case "project_completed":
        return "bg-emerald-500/10 text-emerald-500";
      case "client_joined":
        return "bg-purple-500/10 text-purple-500";
      case "visit_scheduled":
        return "bg-amber-500/10 text-amber-500";
    }
  };

  return (
    <div className="group rounded-xl border border-border/50 p-4 transition-all hover:border-border hover:shadow-sm">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={activity.user.avatar} />
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {getInitials(activity.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-semibold">{activity.user.name}</span>
            <span className="text-muted-foreground"> {activity.description}</span>
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", getActivityColor(activity.type))}>
              {getActivityIcon(activity.type)}
              {activity.type.replace(/_/g, " ")}
            </span>
            <span className="text-[11px] text-muted-foreground">{timeAgo(activity.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="black-tuf-card rounded-2xl p-5">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
