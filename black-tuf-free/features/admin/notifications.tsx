"use client";

import { useAdminNotifications } from "@/hooks/use-admin";
import { timeAgo } from "@/lib/utils";
import type { NotificationType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABEL: Record<NotificationType, string> = {
  project_update: "Project",
  message: "Message",
  payment: "Payment",
  visit: "Visit",
  system: "System",
};

export function NotificationsPanel() {
  const notifications = useAdminNotifications();
  const list = notifications.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No notifications.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-3">Type</th>
                  <th className="pb-2 pr-3">Title</th>
                  <th className="pb-2 pr-3">Recipient</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 60).map((n) => (
                  <tr key={n.id} className="border-b last:border-0">
                    <td className="py-2 pr-3"><Badge variant="secondary">{TYPE_LABEL[n.type] ?? n.type}</Badge></td>
                    <td className="py-2 pr-3">
                      <p className="font-medium">{n.title}</p>
                      {n.body ? <p className="text-xs text-muted-foreground truncate max-w-72">{n.body}</p> : null}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{n.user?.full_name ?? n.user?.email ?? "—"}</td>
                    <td className="py-2 pr-3">{n.seen ? <span className="text-muted-foreground">Seen</span> : <Badge>Unread</Badge>}</td>
                    <td className="py-2 text-muted-foreground whitespace-nowrap">{timeAgo(n.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
