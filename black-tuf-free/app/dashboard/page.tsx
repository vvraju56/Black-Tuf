"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { useNotifications } from "@/hooks/use-notifications";
import { useVisits } from "@/hooks/use-visits";
import { useClientProposals } from "@/hooks/use-proposals";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { BlackTufProjectCard, ProjectCardSkeleton } from "@/components/dashboard/black-tuf-project-card";
import { cn, timeAgo, formatDate } from "@/lib/utils";
import { supabase } from "@/services/client";
import type { Notification, SiteVisit } from "@/types";
import { VISIT_STATUS } from "@/utils/constants";
import {
  Plus,
  ArrowRight,
  FolderKanban,
  Mail,
  Bell,
  CalendarDays,
  MessageSquare,
  LifeBuoy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  useDashboardTitle("Dashboard", "Your workspace");
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: notifications, isLoading: notifLoading } = useNotifications(user?.id ?? "");
  const { data: visits, isLoading: visitsLoading } = useVisits();
  const { data: proposals } = useClientProposals();

  useRealtime("dashboard-overview", [
    { table: "projects", queryKeys: [["projects", "list"]] },
    { table: "messages", queryKeys: [["unread-messages", user?.id ?? ""]] },
    { table: "notifications", queryKeys: [["notifications", "list", user?.id ?? ""]] },
    { table: "site_visits", queryKeys: [["visits", "list"]] },
    { table: "proposals", queryKeys: [["proposals", "client"]] },
  ]);

  const activeProjects = projects?.filter((p) => p.status !== "completed").length ?? 0;
  const hasProjects = (projects?.length ?? 0) > 0;

  if (authLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-black-tuf-fade-in">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Welcome back,</p>
            <h1 className="mt-1 text-2xl font-bold">{profile?.full_name ?? "User"}</h1>
            <p className="mt-2 max-w-md text-sm text-white/70">
              You have {activeProjects} active projects and {proposals?.length ?? 0} proposals to review.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/projects/new")}
            className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-lg transition-all hover:bg-white/90 hover:shadow-xl sm:flex"
          >
            <Plus className="h-4 w-4" />
            Post Project
          </button>
        </div>
      </div>

      {!hasProjects ? (
        /* ── Empty State: No Projects ── */
        <div className="black-tuf-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15">
            <FolderKanban className="h-9 w-9 text-primary" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">You haven&apos;t posted any projects yet.</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first project and receive proposals from verified professionals.
          </p>
          <Button className="mt-6 gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white" onClick={() => router.push("/dashboard/projects/new")}>
            <Plus className="h-4 w-4" />
            Post Project
          </Button>
          <Link href="/services" className="mt-3 text-sm font-medium text-primary hover:underline">
            Browse Services
          </Link>
        </div>
      ) : (
        /* ── Has Projects: Workspace ── */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column — Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Projects */}
            <div className="black-tuf-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">Recent Projects</h2>
                <Link href="/dashboard/projects" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {projectsLoading ? (
                <div className="space-y-3">
                  <ProjectCardSkeleton />
                  <ProjectCardSkeleton />
                </div>
              ) : (
                <div className="space-y-3">
                  {projects!.slice(0, 5).map((p) => (
                    <BlackTufProjectCard key={p.id} project={p} variant="compact" />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Messages */}
            <div className="black-tuf-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold">Recent Messages</h2>
                </div>
                <Link href="/dashboard/messages" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <RecentMessages userId={user?.id ?? ""} />
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Site Visits */}
            {visitsLoading ? (
              <div className="black-tuf-card rounded-2xl p-5">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : visits && visits.filter((v) => v.status !== "cancelled").length > 0 ? (
              <div className="black-tuf-card rounded-2xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Upcoming Visits</h2>
                  <Link href="/dashboard/visits" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    View All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {visits.filter((v) => v.status !== "cancelled").slice(0, 3).map((v) => (
                    <VisitRow key={v.id} visit={v} />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Recent Notifications */}
            {notifLoading ? (
              <div className="black-tuf-card rounded-2xl p-5">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="black-tuf-card rounded-2xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Notifications</h2>
                  <Link href="/dashboard/notifications" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    View All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {notifications.slice(0, 4).map((n) => (
                    <NotificationRow key={n.id} notification={n} />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Need Help */}
            <div className="black-tuf-card rounded-2xl bg-gradient-to-br from-primary/5 to-cyan-500/5 p-5">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">Need Help?</h2>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Our support team is here to help you.</p>
              <Link
                href="/support"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Contact Support <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Recent Messages ── */
function RecentMessages({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase()
        .from("messages")
        .select("*, sender:profiles(id, full_name, avatar_url), project:projects(id, name)")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(5);
      setMessages(data ?? []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="py-4 text-center">
        <MessageSquare className="mx-auto h-7 w-7 text-muted-foreground/40" />
        <p className="mt-2 text-xs text-muted-foreground">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((m: any) => (
        <Link key={m.id} href={`/dashboard/projects/${m.project_id}/messages`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{m.project?.name ?? "Message"}</p>
            <p className="line-clamp-1 text-[11px] text-muted-foreground">{m.content ?? m.file_name ?? "Attachment"}</p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(m.created_at)}</span>
        </Link>
      ))}
    </div>
  );
}

/* ── Notification Row ── */
function NotificationRow({ notification }: { notification: Notification }) {
  return (
    <Link
      href={notification.link || "/dashboard/notifications"}
      className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50"
    >
      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-medium">{notification.title}</p>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">{notification.body}</p>
      </div>
      <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(notification.created_at)}</span>
    </Link>
  );
}

/* ── Visit Row ── */
function VisitRow({ visit }: { visit: SiteVisit }) {
  const st = VISIT_STATUS[visit.status] ?? { label: visit.status, color: "secondary" };
  return (
    <Link href="/dashboard/visits" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <CalendarDays className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{visit.title}</p>
        <p className="text-[11px] text-muted-foreground">
          {visit.visit_date ? formatDate(visit.visit_date, { dateStyle: "medium" }) : "TBD"}
        </p>
      </div>
      <Badge variant={st.color as never} className="text-[10px]">{st.label}</Badge>
    </Link>
  );
}

/* ── Skeleton ── */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 w-full rounded-2xl bg-muted" />
      <div className="h-64 w-full rounded-2xl bg-muted" />
    </div>
  );
}
