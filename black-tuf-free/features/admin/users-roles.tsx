"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminUsers, useUpdateRole } from "@/hooks/use-admin";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile, Role } from "@/types";

const ROLE_COLOR: Record<Role, "default" | "secondary" | "success"> = {
  client: "secondary",
  engineer: "success",
  admin: "default",
};

export function UsersPanel() {
  const users = useAdminUsers();
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [search, setSearch] = useState("");

  const list = (users.data ?? []).filter((u) => {
    if (filter !== "all" && u.role !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  });

  const counts = (users.data ?? []).reduce<Record<Role, number>>(
    (acc, u) => {
      acc[u.role] += 1;
      return acc;
    },
    { client: 0, engineer: 0, admin: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users & roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "client", "engineer", "admin"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} ({f === "all" ? (users.data ?? []).length : counts[f as Role]})
            </button>
          ))}
          <Input
            className="ml-auto max-w-[220px]"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {users.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No users match.</p>
        ) : (
          <div className="space-y-2">
            {list.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.avatar_url ?? undefined} />
                    <AvatarFallback>{u.full_name?.[0] ?? u.email?.[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.full_name ?? "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email} · joined {timeAgo(u.created_at)}
                    </p>
                  </div>
                </div>
                <RoleSelect user={u} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoleSelect({ user }: { user: Profile }) {
  const { setRole } = useUpdateRole(user.id);
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Badge variant={ROLE_COLOR[user.role]}>{user.role}</Badge>
      <select
        className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
        value={user.role}
        disabled={saving}
        onChange={async (e) => {
          const role = e.target.value as Role;
          if (role === user.role) return;
          setSaving(true);
          try {
            await setRole(role);
            toast.success(`Role updated to ${role}`);
          } catch (err: any) {
            toast.error("Update failed", { description: err.message });
          } finally {
            setSaving(false);
          }
        }}
      >
        <option value="client">client</option>
        <option value="engineer">engineer</option>
        <option value="admin">admin</option>
      </select>
    </div>
  );
}
