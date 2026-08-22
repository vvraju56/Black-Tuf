"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useVisits, useUpdateVisit, useCancelVisit, useCreateVisit, visitKeys } from "@/hooks/use-visits";
import { useProjects } from "@/hooks/use-projects";
import { useRealtime } from "@/hooks/use-realtime";
import { VISIT_STATUS } from "@/utils/constants";
import { timeAgo, formatDate, formatTime } from "@/lib/utils";
import type { SiteVisit } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck, Clock } from "lucide-react";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { updateVisit as updateVisitSrv } from "@/services/visits";

export default function VisitsPage() {
  useDashboardTitle("Site Visits");
  const { user, profile } = useAuth();
  const { data: visits, isLoading } = useVisits();
  const { data: projects } = useProjects();

  useRealtime("visits-page", [{ table: "site_visits", queryKeys: [visitKeys.list()] }]);

  if (!user) return null;

  const role = profile?.role;
  const myVisits = (visits ?? []).filter((v) => {
    if (role === "client") return v.client_id === user.id;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Site Visits</h2>
        {role === "client" ? <RequestVisitDialog projects={projects ?? []} /> : null}
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : myVisits.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-3">
          {myVisits.map((v) => (
            <VisitCard key={v.id} visit={v} role={role ?? "client"} />
          ))}
        </ul>
      )}
    </div>
  );
}

function VisitCard({
  visit,
  role,
}: {
  visit: SiteVisit;
  role: string;
}) {
  const queryClient = useQueryClient();
  const updateMut = useUpdateVisit(visit.id);
  const cancelMut = useCancelVisit(visit.id);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: visitKeys.list() });

  const st = VISIT_STATUS[visit.status as keyof typeof VISIT_STATUS] ?? VISIT_STATUS.requested;
  const canSchedule = role === "admin" || role === "engineer";
  const canCancel = visit.status !== "completed" && visit.status !== "cancelled";

  const handleUpdate = async (patch: Record<string, unknown>) => {
    await updateMut.mutateAsync(patch as Parameters<typeof updateVisitSrv>[1]);
    invalidate();
  };
  const handleCancel = async () => {
    await cancelMut.mutateAsync();
    invalidate();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{visit.title}</CardTitle>
          <Badge variant={st.color as any}>{st.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarCheck className="h-4 w-4" />
          {visit.visit_date ? formatDate(visit.visit_date) : "—"}
          {visit.visit_time ? formatTime(visit.visit_time) : null}
        </div>
        {visit.project ? <p className="font-medium">{visit.project.name}</p> : null}
        {visit.engineer ? <p className="text-muted-foreground">Engineer: {visit.engineer.full_name ?? visit.engineer.email}</p> : null}
        {visit.notes ? <p className="text-muted-foreground">{visit.notes}</p> : null}
        <p className="text-xs text-muted-foreground">{timeAgo(visit.updated_at)}</p>

        {canSchedule && visit.status !== "completed" ? (
          <div className="flex items-center gap-2 pt-2">
            <Select
              value={visit.status}
              onValueChange={(val) => handleUpdate({ status: val })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VISIT_STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              defaultValue={visit.visit_date?.slice(0, 10) ?? ""}
              onChange={(e) => handleUpdate({ visit_date: e.target.value ? e.target.value + "T00:00:00Z" : null })}
              className="w-44"
            />
          </div>
        ) : null}

        {canCancel && role === "client" ? (
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel request
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RequestVisitDialog({
  projects,
}: {
  projects: { id: string; name: string }[];
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { mutateAsync: submitRequest, isPending } = useCreateVisit();
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("Site visit");
  const [notes, setNotes] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: visitKeys.list() });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Request Visit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Site Visit</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="Choose a project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button
            disabled={!projectId || isPending}
            onClick={async () => {
              if (!user) return;
              try {
                await submitRequest({
                  project_id: projectId,
                  client_id: user.id,
                  title,
                  notes,
                });
                toast.success("Visit requested");
                setOpen(false);
                refresh();
              } catch (e: any) {
                toast.error("Failed", { description: e.message });
              }
            }}
          >
            {isPending ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
      <Clock className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No site visits.</p>
    </div>
  );
}
