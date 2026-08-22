"use client";

import Link from "next/link";
import { useAdminMessages } from "@/hooks/use-admin";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function MessagesPanel() {
  const messages = useAdminMessages();
  const list = messages.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          <div className="space-y-3">
            {list.slice(0, 40).map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/projects/${m.project_id}?tab=messages`}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={m.sender?.avatar_url ?? undefined} />
                  <AvatarFallback>{m.sender?.full_name?.[0] ?? m.sender?.email?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">
                      {m.sender?.full_name ?? m.sender?.email ?? "User"}
                      <span className="text-muted-foreground font-normal"> → {m.project?.name ?? "project"}</span>
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(m.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {m.content ?? (m.file_path ? `📎 ${m.file_name ?? "attachment"}` : "")}
                  </p>
                  {!m.read && <p className="text-xs text-primary mt-0.5">Unread</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
