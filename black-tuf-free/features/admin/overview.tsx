"use client";

import { useAdminProjects, useAdminUsers, useAdminVisits, useAdminMessages, useAdminFeedback, useAdminInvoices } from "@/hooks/use-admin";
import { useModuleFlags } from "@/hooks/use-modules";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderKanban,
  Users,
  CalendarDays,
  Mail,
  Star,
  Receipt,
  CheckCircle2,
} from "lucide-react";

export function OverviewPanel() {
  const { data: flags } = useModuleFlags();
  const projects = useAdminProjects();
  const users = useAdminUsers();
  const visits = useAdminVisits();
  const messages = useAdminMessages();
  const feedback = useAdminFeedback();
  const invoices = useAdminInvoices();

  const p = projects.data ?? [];
  const u = users.data ?? [];
  const v = visits.data ?? [];
  const m = messages.data ?? [];
  const f = feedback.data ?? [];
  const inv = invoices.data ?? [];

  const pending = p.filter((x) => x.status === "pending").length;
  const inProgress = p.filter((x) => x.status === "in_progress").length;
  const completed = p.filter((x) => x.status === "completed").length;
  const cancelled = p.filter((x) => x.status === "cancelled").length;
  const clients = u.filter((x) => x.role === "client").length;
  const engineers = u.filter((x) => x.role === "engineer").length;
  const admins = u.filter((x) => x.role === "admin").length;
  const visitsRequested = v.filter((x) => x.status === "requested").length;
  const visitsScheduled = v.filter((x) => x.status === "scheduled" || x.status === "confirmed").length;
  const unpaid = inv.filter((x) => x.status === "pending" || x.status === "overdue").length;
  const approvedFeedback = f.filter((x) => x.is_approved).length;

  const statCards = [
    { label: "Total Projects", value: p.length, icon: FolderKanban, sub: `${pending} pending · ${inProgress} in progress`, module: "marketplace" as const },
    { label: "Completed", value: completed, icon: CheckCircle2, sub: `${cancelled} cancelled`, module: "marketplace" as const },
    { label: "Clients", value: clients, icon: Users, sub: `${engineers} engineers · ${admins} admins`, module: null as string | null },
    { label: "Messages", value: m.length, icon: Mail, sub: "latest across projects", module: "chat" as const },
    { label: "Site Visits", value: v.length, icon: CalendarDays, sub: `${visitsRequested} requested · ${visitsScheduled} scheduled`, module: "site_visits" as const },
    { label: "Feedback", value: f.length, icon: Star, sub: `${approvedFeedback} approved`, module: "feedback" as const },
    { label: "Invoices", value: inv.length, icon: Receipt, sub: `${unpaid} unpaid`, module: "invoices" as const },
  ].filter((c) => !c.module || flags?.[c.module as keyof typeof flags] !== false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold leading-tight">{c.value}</p>
                <p className="text-sm font-medium text-muted-foreground truncate">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.isLoading || projects.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <ul className="divide-y">
              {(messages.data ?? []).slice(0, 8).map((msg) => (
                <li key={msg.id} className="py-2 text-sm">
                  <span className="font-medium">{msg.sender?.full_name ?? msg.sender?.email ?? "User"}</span>
                  <span className="text-muted-foreground"> said in </span>
                  <span className="font-medium">{msg.project?.name ?? "project"}</span>
                  <p className="text-muted-foreground text-xs truncate">{msg.content ?? msg.file_name ?? "📎 attachment"}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(msg.created_at)}</p>
                </li>
              ))}
              {(messages.data ?? []).length === 0 && (
                <li className="py-4 text-center text-sm text-muted-foreground">No recent messages.</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
