"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
import { useNotifications } from "@/hooks/use-notifications";
import { useVisits } from "@/hooks/use-visits";
import { useModuleFlags } from "@/hooks/use-modules";
import { timeAgo, formatDate } from "@/lib/utils";
import { Calendar, Bell, HelpCircle, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export function BlackTufRightSidebar() {
  const { profile, user } = useAuth();
  const { notifications } = useUnreadCounts();
  const { data: notifs } = useNotifications(user?.id ?? "");
  const { data: visits } = useVisits();
  const { data: flags } = useModuleFlags();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Derived from real profile data — never hardcoded.
  const completion = Math.min(
    100,
    ((profile?.full_name ? 40 : 0) +
      (profile?.avatar_url ? 30 : 0) +
      (profile?.email ? 15 : 0) +
      (profile?.phone ? 15 : 0)) || 0
  );

  const showVisits = flags?.site_visits !== false;
  const showNotifications = flags?.notifications !== false;
  const upcomingVisits = showVisits
    ? (visits?.filter((v) => v.status !== "cancelled").slice(0, 3) ?? [])
    : [];
  const recentNotifs = showNotifications ? (notifs?.slice(0, 4) ?? []) : [];

  return (
    <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-border/50 bg-muted/20 p-4 xl:block black-tuf-scrollbar">
      <div className="space-y-4">
        {/* Profile */}
        <div className="black-tuf-card rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {getInitials(profile?.full_name ?? null)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{profile?.full_name ?? "User"}</p>
              <p className="text-xs capitalize text-muted-foreground">{profile?.role ?? "client"}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Profile completion</span>
              <span className="font-semibold text-primary">{completion}%</span>
            </div>
            <Progress value={completion} className="mt-2 h-1.5" />
          </div>
        </div>

        {/* Upcoming Visits */}
        {showVisits && (
          <div className="black-tuf-card rounded-2xl p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Upcoming Visits
            </h3>
            {upcomingVisits.length === 0 ? (
              <p className="py-2 text-center text-xs text-muted-foreground">No upcoming visits</p>
            ) : (
              <div className="space-y-2">
                {upcomingVisits.map((visit) => (
                  <Link
                    key={visit.id}
                    href="/dashboard/visits"
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{visit.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {visit.visit_date ? formatDate(visit.visit_date) : "TBD"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Notifications */}
        {showNotifications && (
          <div className="black-tuf-card rounded-2xl p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Bell className="h-3.5 w-3.5" />
              Recent
            </h3>
            {recentNotifs.length === 0 ? (
              <p className="py-2 text-center text-xs text-muted-foreground">No notifications</p>
            ) : (
              <div className="space-y-2">
                {recentNotifs.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link ?? "/dashboard/notifications"}
                    className="flex items-start gap-2 rounded-xl p-2 transition-colors hover:bg-accent/50"
                  >
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-xs font-medium">{notif.title}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(notif.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Support Card */}
        <div className="black-tuf-card black-tuf-gradient rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            <h3 className="text-sm font-semibold">Need Help?</h3>
          </div>
          <p className="mt-2 text-xs text-white/80">
            Our support team is here to help you with any questions.
          </p>
          <Link
            href="/support"
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/30"
          >
            Contact Support
          </Link>
        </div>

        {/* Empty placeholder so the sidebar stays balanced on wide screens */}
        {!showVisits && !showNotifications && (
          <div className="black-tuf-card rounded-2xl p-4 text-center">
            <CheckCircle2 className="mx-auto h-6 w-6 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">
              {notifications === 0 ? "You're all caught up" : "Manage widgets in Settings"}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
