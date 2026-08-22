"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { useLatestMessages, messageKeys } from "@/hooks/use-messages";
import { useRealtime } from "@/hooks/use-realtime";
import { SERVICE_BY_ID, PROJECT_STATUS } from "@/utils/constants";
import { timeAgo } from "@/lib/utils";
import type { Message, Project, Profile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { MessageCircle } from "lucide-react";

interface Conversation {
  project: Project;
  latest: Message | null;
  unread: number;
}

export function MessagesView({ title = "Messages" }: { title?: string }) {
  useDashboardTitle(title);
  const { user, profile } = useAuth();
  const { data: projects } = useProjects();
  const { data: messages } = useLatestMessages();

  useRealtime("messages-view", [
    { table: "messages", queryKeys: [messageKeys.all] },
    { table: "projects", queryKeys: [["projects"]] },
  ]);

  if (!user) return null;

  const convoList: Conversation[] = (projects ?? [])
    .filter((p) => p.client_id === user.id || p.engineer_id === user.id || profile?.role === "admin")
    .map((project) => {
      const projectMessages = (messages ?? []).filter((m) => m.project_id === project.id);
      const latest = projectMessages.length ? projectMessages[0] : null;
      const unread = projectMessages.filter((m) => !m.read && m.sender_id !== user.id).length;
      return { project, latest, unread };
    });

  if (!projects) return <Skeleton className="h-96 w-full" />;

  const hasConversations = convoList.length > 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="md:col-span-1 xl:col-span-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Link href="/dashboard/projects" className="text-sm text-primary hover:underline">
            + New project
          </Link>
        </div>
        {hasConversations ? (
          <ul className="divide-y overflow-hidden rounded-lg border">
            {convoList.map(({ project, latest, unread }) => (
              <ConversationRow
                key={project.id}
                project={project}
                latest={latest}
                unread={unread}
              />
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </div>

      <div className="hidden md:col-span-1 md:block xl:col-span-2">
        <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
}

function ConversationRow({
  project,
  latest,
  unread,
}: {
  project: Project;
  latest: Message | null;
  unread: number;
}) {
  const svc = SERVICE_BY_ID[project.service as keyof typeof SERVICE_BY_ID];
  const st = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS] ?? PROJECT_STATUS.pending;
  const sender: Profile | null = latest?.sender ?? null;

  return (
    <li>
      <Link
        href={`/dashboard/projects/${project.id}?tab=messages`}
        className="block p-3 hover:bg-accent"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={sender?.avatar_url ?? undefined} />
            <AvatarFallback>
              {sender?.full_name?.[0] ?? sender?.email?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">{project.name}</p>
              <span className="text-xs text-muted-foreground">
                {latest ? timeAgo(latest.created_at) : ""}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {latest ? latest.content ?? `${latest.file_name ?? "📎 attachment"}` : "No messages yet"}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="capitalize">{project.project_type}</Badge>
              <span className="capitalize">{svc?.short ?? project.service}</span>
              <Badge variant={st.color as any}>{st.label}</Badge>
            </div>
          </div>
          {unread > 0 ? (
            <Badge className="ml-auto">{unread}</Badge>
          ) : null}
        </div>
      </Link>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
      <MessageCircle className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No conversations yet.</p>
      <Link href="/dashboard/projects/new">
        <Badge className="mt-2">Create a project to start messaging</Badge>
      </Link>
    </div>
  );
}
