"use client";

import { useAdminProjects, useAdminUsers, useAdminVisits, useAdminFeedback, useAdminInvoices, useAdminMessages } from "@/hooks/use-admin";
import { PROJECT_STATUS } from "@/utils/constants";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_BAR_COLOR: Record<string, string> = {
  secondary: "bg-muted",
  warning: "bg-yellow-500",
  success: "bg-emerald-500",
  destructive: "bg-red-500",
  primary: "bg-primary",
};

export function AnalyticsPanel() {
  const projects = useAdminProjects();
  const users = useAdminUsers();
  const visits = useAdminVisits();
  const feedback = useAdminFeedback();
  const invoices = useAdminInvoices();
  const messages = useAdminMessages();

  if (projects.isLoading) return <Skeleton className="h-64 w-full" />;

  const p = projects.data ?? [];
  const u = users.data ?? [];
  const v = visits.data ?? [];
  const f = feedback.data ?? [];
  const inv = invoices.data ?? [];
  const m = messages.data ?? [];

  const byStatus = (Object.keys(PROJECT_STATUS) as (keyof typeof PROJECT_STATUS)[]).map((key) => ({
    label: PROJECT_STATUS[key].label,
    color: PROJECT_STATUS[key].color,
    count: p.filter((x) => x.status === key).length,
  }));

  const byService = p.reduce<Record<string, number>>((acc, x) => {
    acc[x.service] = (acc[x.service] ?? 0) + 1;
    return acc;
  }, {});
  const serviceEntries = Object.entries(byService).sort((a, b) => b[1] - a[1]);
  const maxService = Math.max(1, ...serviceEntries.map(([, c]) => c));

  const avgRating = f.length ? f.reduce((s, x) => s + x.rating, 0) / f.length : 0;
  const paidAmount = inv.filter((x) => x.status === "paid").reduce((s, x) => s + Number(x.amount), 0);
  const avgProjectProgress = p.length ? p.reduce((s, x) => s + x.progress, 0) / p.length : 0;

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const count = m.filter((x) => x.created_at.slice(0, 10) === key).length;
    return { date: key.slice(5), count };
  });
  const maxMessages = Math.max(1, ...last30.map((x) => x.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total users" value={u.length} />
        <Kpi label="Average project progress" value={`${Math.round(avgProjectProgress)}%`} />
        <Kpi label="Average rating" value={avgRating ? avgRating.toFixed(1) : "—"} />
        <Kpi label="Paid revenue" value={formatCurrency(paidAmount)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects by status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-4">
            {byStatus.map((s) => (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-sm font-medium">{s.count}</span>
                <div
                  className={`w-full rounded-t-md ${STATUS_BAR_COLOR[s.color] ?? "bg-primary"}`}
                  style={{ height: `${Math.max(4, (s.count / Math.max(1, p.length)) * 100)}%` }}
                />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects by service</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceEntries.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              <div className="space-y-2">
                {serviceEntries.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-28 text-xs capitalize truncate">{name}</span>
                    <div className="h-4 flex-1 rounded bg-muted">
                      <div className="h-full rounded bg-primary" style={{ width: `${(count / maxService) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message activity (last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-px">
              {last30.map((d) => (
                <div key={d.date} className="relative flex-1">
                  <div
                    className="rounded-t bg-primary/80"
                    style={{ height: `${(d.count / maxMessages) * 100}%` }}
                    title={`${d.date}: ${d.count}`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {m.length} messages in total · {f.length} feedback entries · {v.length} visits
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
