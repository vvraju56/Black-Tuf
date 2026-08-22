"use client";

import { useAdminUsers, useAdminProjects } from "@/hooks/use-admin";
import { useUpdateRole } from "@/hooks/use-admin";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/types";

export function EngineersPanel() {
  const users = useAdminUsers();
  const projects = useAdminProjects();

  const engineers = (users.data ?? []).filter((u) => u.role === "engineer");
  const projectList = projects.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engineers ({engineers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {users.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : engineers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No engineers yet. Promote a client to engineer from the Clients tab.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {engineers.map((e) => {
              const assigned = projectList.filter((p) => p.engineer_id === e.id);
              const active = assigned.filter((p) => p.status !== "completed" && p.status !== "cancelled").length;
              return (
                <EngineerCard
                  key={e.id}
                  engineer={e}
                  assignedCount={assigned.length}
                  activeCount={active}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EngineerCard({
  engineer,
  assignedCount,
  activeCount,
}: {
  engineer: Profile;
  assignedCount: number;
  activeCount: number;
}) {
  const patch = useUpdateRole(engineer.id);
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={engineer.avatar_url ?? undefined} />
          <AvatarFallback>{engineer.full_name?.[0] ?? engineer.email?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium truncate">{engineer.full_name ?? engineer.email ?? "—"}</p>
          <p className="text-xs text-muted-foreground truncate">{engineer.email}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">{assignedCount} projects</Badge>
        <Badge variant="outline">{activeCount} active</Badge>
        <span>{timeAgo(engineer.created_at)}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <select
          value="engineer"
          onChange={(ev) => patch.setRole(ev.target.value as Profile["role"])}
          className="rounded-md border border-input text-sm px-2 py-1 capitalize"
        >
          <option value="engineer">Engineer</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  );
}
