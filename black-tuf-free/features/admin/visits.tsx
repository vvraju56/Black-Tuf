"use client";

import { useAdminVisits, useAdminUsers, useUpdateVisitAdmin } from "@/hooks/use-admin";
import { VISIT_STATUS } from "@/utils/constants";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/types";

export function VisitsPanel() {
  const visits = useAdminVisits();
  const users = useAdminUsers();
  const engineers = (users.data ?? []).filter((u) => u.role === "engineer");
  const list = visits.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Visits ({list.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {visits.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No site visits yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map((v) => (
              <VisitRow key={v.id} visit={v} engineers={engineers} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VisitRow({
  visit: v,
  engineers,
}: {
  visit: NonNullable<ReturnType<typeof useAdminVisits>["data"]>[number];
  engineers: Profile[];
}) {
  const st = VISIT_STATUS[v.status as keyof typeof VISIT_STATUS] ?? VISIT_STATUS.requested;
  const update = useUpdateVisitAdmin(v.id);
  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{v.title}</p>
          <p className="text-sm text-muted-foreground">
            {v.project?.name ?? "Project"} · requested by {v.client?.full_name ?? v.client?.email ?? "—"}
          </p>
        </div>
        <Badge variant={st.color as any}>{st.label}</Badge>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">Date</span>
          <input
            type="date"
            defaultValue={v.visit_date?.slice(0, 10) ?? ""}
            onChange={(e) => update.mutate({ visit_date: e.target.value || null })}
            className="rounded-md border border-input px-2 py-1 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">Time</span>
          <input
            type="time"
            defaultValue={v.visit_time?.slice(0, 5) ?? ""}
            onChange={(e) => update.mutate({ visit_time: e.target.value || null })}
            className="rounded-md border border-input px-2 py-1 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">Engineer</span>
          <select
            value={v.engineer_id ?? ""}
            onChange={(e) => update.mutate({ engineer_id: e.target.value || null })}
            className="rounded-md border border-input px-2 py-1 text-sm"
          >
            <option value="">Unassigned</option>
            {engineers.map((e) => (
              <option key={e.id} value={e.id}>{e.full_name ?? e.email}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">Status</span>
          <select
            value={v.status}
            onChange={(e) => update.mutate({ status: e.target.value as any })}
            className="rounded-md border border-input px-2 py-1 text-sm"
          >
            {Object.entries(VISIT_STATUS).map(([k, val]) => (
              <option key={k} value={k}>{val.label}</option>
            ))}
          </select>
        </label>
      </div>
      {v.notes ? <p className="mt-2 text-sm text-muted-foreground">{v.notes}</p> : null}
      <p className="mt-2 text-xs text-muted-foreground">Created {timeAgo(v.created_at)}</p>
    </div>
  );
}
