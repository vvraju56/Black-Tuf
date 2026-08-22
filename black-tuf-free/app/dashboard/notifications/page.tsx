"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications, useMarkAllNotifications, notificationKeys } from "@/hooks/use-notifications";
import { useRealtime } from "@/hooks/use-realtime";
import { timeAgo } from "@/lib/utils";
import type { NotificationType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, ExternalLink, CheckCheck } from "lucide-react";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";

const TYPE_ICON: Record<NotificationType, string> = {
  project_update: "📁",
  message: "💬",
  payment: "💰",
  visit: "📍",
  system: "🔔",
};

export default function NotificationsPage() {
  useDashboardTitle("Notifications");
  const { user } = useAuth();
  const result = useNotifications(user?.id);
  const markAll = useMarkAllNotifications(user?.id);
  const { data: list = [], isLoading } = result;
  const unseenCount = list.filter((n) => !n.seen).length;
  const userId = user?.id ?? "";

  useRealtime("notifications-page", [
    { table: "notifications", queryKeys: [notificationKeys.list(userId)] },
  ]);

  if (!user) return null;

  const handleMarkAll = () => {
    if (unseenCount > 0) markAll.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex items-center gap-2">
          {unseenCount > 0 ? (
            <Badge variant="secondary">{unseenCount} unread</Badge>
          ) : null}
          <button
            onClick={handleMarkAll}
            disabled={unseenCount === 0 || markAll.isPending}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : list.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="divide-y rounded-lg border">
          {list.map((n) => (
            <li
              key={n.id}
              className={
                n.seen
                  ? "bg-background text-muted-foreground"
                  : "bg-accent/30"
              }
            >
              <Link
                href={n.link ?? "#"}
                className="flex items-start gap-3 p-3 hover:underline"
              >
                <span className="text-lg">{TYPE_ICON[n.type]}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.title}</p>
                  {n.body ? (
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                {!n.seen ? <Badge>Unread</Badge> : null}
                {n.link ? <ExternalLink className="h-4 w-4 mt-0.5" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
      <Bell className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No notifications yet.</p>
    </div>
  );
}
