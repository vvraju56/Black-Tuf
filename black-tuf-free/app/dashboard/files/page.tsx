"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAllFiles, useDeleteProjectFile, useAddProjectFile, fileKeys } from "@/hooks/use-files";
import { useProjects } from "@/hooks/use-projects";
import { useRealtime } from "@/hooks/use-realtime";
import { getPublicUrl, uploadFile } from "@/services/storage";
import { fileKind } from "@/services/files";
import { timeAgo, formatBytes } from "@/lib/utils";
import type { ProjectFile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Trash2, Download } from "lucide-react";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export default function FilesPage() {
  useDashboardTitle("Files");
  const { user, profile } = useAuth();
  const { data: files, isLoading } = useAllFiles();
  const { data: projects } = useProjects();
  const del = useDeleteProjectFile("");
  const queryClient = useQueryClient();

  useRealtime("files-page", [{ table: "project_files", queryKeys: [fileKeys.allList()] }]);

  if (!user) return null;

  const role = profile?.role;
  const myFiles = (files ?? []).filter((f) => {
    if (role === "client") return f.project?.client_id === user.id;
    return true;
  });

  const handleDelete = async (f: ProjectFile) => {
    await del.mutateAsync({ id: f.id, storagePath: f.storage_path });
    queryClient.invalidateQueries({ queryKey: fileKeys.allList() });
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Files</h2>
        <UploadSection
          userId={user.id}
          projects={(projects ?? []).filter((p) => {
            if (role === "client") return p.client_id === user.id;
            return true;
          })}
        />
      </div>

      {myFiles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {myFiles.map((f) => (
            <FileCard key={f.id} file={f} onDelete={() => handleDelete(f)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileCard({ file, onDelete }: { file: ProjectFile; onDelete: () => void }) {
  const kind = fileKind(file.file_type);
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm break-all">{file.name}</CardTitle>
        <span className="text-xs text-muted-foreground uppercase">{kind}</span>
      </CardHeader>
      <CardContent className="flex-1 space-y-1 text-sm">
        <p className="text-xs text-muted-foreground">Size: {formatBytes(file.size)}</p>
        <p className="text-xs text-muted-foreground">{timeAgo(file.created_at)}</p>
      </CardContent>
      <div className="flex items-center gap-2 p-3 pt-0">
        {file.storage_path ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(getPublicUrl("projectFiles", file.storage_path as string), "_blank")}
          >
            <Download className="h-4 w-4" />
          </Button>
        ) : null}
        <Button size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function UploadSection({
  userId,
  projects,
}: {
  userId: string;
  projects: { id: string; name: string }[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const addFile = useAddProjectFile(projectId);
  const qc = useQueryClient();

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Project</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-md border border-input text-sm px-2 py-1"
        >
          <option value="">Choose…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">File</label>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <div className="grid gap-1">
        <label className="text-xs text-muted-foreground">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="overrides filename"
          className="rounded-md border border-input text-sm px-2 py-1 w-40"
        />
      </div>
      <Button
        size="sm"
        disabled={!projectId || !file || addFile.isPending}
        onClick={async () => {
          if (!file || !projectId) return;
          try {
            const path = await uploadFile("projectFiles", `projects/${projectId}`, file);
            await addFile.mutateAsync({
              project_id: projectId,
              uploaded_by: userId,
              name: name || file.name,
              file_type: file.type || "application/octet-stream",
              size: file.size,
              storage_path: path,
            });
            setFile(null);
            setName("");
            qc.invalidateQueries({ queryKey: fileKeys.allList() });
            toast.success("File uploaded");
          } catch (e: any) {
            toast.error("Upload failed", { description: e.message });
          }
        }}
      >
        {addFile.isPending ? "Uploading…" : "Upload"}
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
      <FolderOpen className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No files yet.</p>
    </div>
  );
}
