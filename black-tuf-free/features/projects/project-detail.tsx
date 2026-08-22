"use client";

import { useParams } from "next/navigation";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useProjectFiles } from "@/hooks/use-files";
import { useProjectInvoices } from "@/hooks/use-invoices";
import { useProjectFeedback, useSubmitFeedback } from "@/hooks/use-feedback";
import { useRealtime } from "@/hooks/use-realtime";
import { ChatView } from "@/features/chat/chat-view";
import {
  OverviewTab,
  FilesTab,
  InvoicesTab,
  FeedbackTab,
} from "@/features/projects/project-detail-tabs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_BY_ID } from "@/utils/constants";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";

const realtimeKeys = ["projects"];

export function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, profile } = useAuth();
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject(id);
  const files = useProjectFiles(id);
  const invoices = useProjectInvoices(id);
  const feedback = useProjectFeedback(id);
  const submitFeedback = useSubmitFeedback();

  useDashboardTitle(project?.name ?? "Project");

  const canManage = profile?.role === "admin" || profile?.role === "engineer";
  const canFeedback = profile?.role === "client" && project?.client_id === user?.id;

  useRealtime("project-detail-" + id, [
    { table: "projects", queryKeys: [realtimeKeys] },
    { table: "messages", queryKeys: [["messages", "project", id]] },
    { table: "project_files", queryKeys: [["project-files", "list", id]] },
    { table: "invoices", queryKeys: [["invoices", "project", id]] },
    { table: "feedback", queryKeys: [["feedback", "project", id]] },
  ]);

  if (isLoading) return <DashboardTitleFallback title="Project" subtitle="Loading…" />;

  if (!project) {
    return <p className="text-center py-12 text-muted-foreground">Project not found.</p>;
  }

  const svc = SERVICE_BY_ID[project.service as keyof typeof SERVICE_BY_ID];

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="files">Files ({files.data?.length ?? 0})</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="invoices">Invoices ({invoices.data?.length ?? 0})</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab project={project} canManage={canManage} onUpdate={updateProject} svc={svc} />
      </TabsContent>

      <TabsContent value="files">
        <FilesTab projectId={id} files={files} canManage={canManage} />
      </TabsContent>

      <TabsContent value="messages">
        <Card>
          <CardContent className="p-4">
            <ChatView projectId={id} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invoices">
        <InvoicesTab invoices={invoices} />
      </TabsContent>

      <TabsContent value="feedback">
        <FeedbackTab
          projectId={id}
          feedback={feedback}
          canFeedback={canFeedback}
          submitFeedback={submitFeedback}
          userId={user?.id ?? ""}
        />
      </TabsContent>
    </Tabs>
  );
}

function DashboardTitleFallback({ title, subtitle }: { title: string; subtitle?: string }) {
  useDashboardTitle(title, subtitle);
  return <Skeleton className="h-64 w-full" />;
}
