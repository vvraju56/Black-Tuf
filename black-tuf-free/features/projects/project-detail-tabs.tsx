"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useProjectFiles } from "@/hooks/use-files";
import { useProjectInvoices } from "@/hooks/use-invoices";
import { useProjectFeedback, useSubmitFeedback } from "@/hooks/use-feedback";
import { useMessages } from "@/hooks/use-messages";
import { getUsersByRole } from "@/services/profile";
import { uploadFile, getPublicUrl } from "@/services/storage";
import { addProjectFile } from "@/services/files";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/star-rating";
import { formatDate, timeAgo } from "@/lib/utils";
import { PROJECT_STATUS, INVOICE_STATUS } from "@/utils/constants";
import { FileText, Download, ExternalLink, Upload, Save, Calendar, Clock, MessageSquare, Star } from "lucide-react";
import type { Project, Profile } from "@/types";
import type { ServiceMeta } from "@/utils/constants";

export function OverviewTab({
  project,
  canManage,
  onUpdate,
  svc,
}: {
  project: Project;
  canManage: boolean;
  onUpdate: { mutateAsync: (vars: any) => Promise<any>; isPending: boolean };
  svc?: ServiceMeta;
}) {
  const st = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS] ?? PROJECT_STATUS.pending;
  const [status, setStatus] = useState(project.status);
  const [engineer, setEngineer] = useState(project.engineer_id ?? "");
  const [saving, setSaving] = useState(false);

  const engineers: Profile[] = useEngineers();
  const files = useProjectFiles(project.id);
  const messages = useMessages(project.id);
  const feedback = useProjectFeedback(project.id);

  const activity: { at: string; type: string; label: string; detail?: string }[] = [
    { at: project.created_at, type: "created", label: "Project created" },
    ...(files.data ?? []).map((f) => ({
      at: f.created_at,
      type: "file",
      label: "File uploaded",
      detail: f.name,
    })),
    ...(messages.data ?? []).map((m) => ({
      at: m.created_at,
      type: "message",
      label: "Message sent",
      detail: m.content ?? m.file_name ?? "",
    })),
    ...(feedback.data
      ? [
          {
            at: feedback.data.created_at,
            type: "feedback" as const,
            label: `Feedback (${feedback.data.rating}/5)`,
            detail: feedback.data.comment ?? "",
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate.mutateAsync({ status, engineer_id: engineer || null });
      toast.success("Project updated");
    } catch (e: any) {
      toast.error("Update failed", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
          <div><p className="text-xs text-muted-foreground">Service</p><p className="font-medium">{svc?.title ?? project.service}</p></div>
          <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium capitalize">{project.project_type.replace("_", " ")}</p></div>
          {project.project_type === "on_site" && project.address ? (
            <div className="sm:col-span-2"><p className="text-xs text-muted-foreground">Address</p><p className="font-medium">{project.address}</p></div>
          ) : null}
          <div>
            <p className="text-xs text-muted-foreground">Priority</p>
            <Badge
              variant={
                project.priority === "high"
                  ? "destructive"
                  : project.priority === "medium"
                  ? "warning"
                  : "secondary"
              }
              className="capitalize mt-1"
            >
              {project.priority}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-medium">{project.budget != null ? `₹${project.budget.toLocaleString("en-IN")}` : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Deadline</p>
            <p className="font-medium">{project.deadline ? new Date(project.deadline).toLocaleDateString("en-IN") : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            {canManage ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Project["status"])}
                className="mt-1 w-full rounded-md border border-input bg-background text-sm px-2 py-1"
              >
                {Object.entries(PROJECT_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            ) : (
              <Badge variant={st.color as "secondary" | "success" | "warning" | "destructive" | "default" | "outline"}>{st.label}</Badge>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={project.progress} className="h-2 flex-1" />
              <span className="text-sm font-medium w-12 text-right">{project.progress}%</span>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">Engineer</label>
            {canManage && engineers.length > 0 ? (
              <select
                value={engineer}
                onChange={(e) => setEngineer(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background text-sm px-2 py-1"
              >
                <option value="">Unassigned</option>
                {engineers.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name || e.email}</option>
                ))}
              </select>
            ) : (
              <p className="font-medium">{project.engineer ? (project.engineer.full_name || project.engineer.email) : "Unassigned"}</p>
            )}
          </div>

          {canManage ? (
            <div className="sm:col-span-2">
              <Button onClick={save} disabled={saving || onUpdate.isPending} size="sm">
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline</h3>
          <ul className="space-y-3 text-sm">
            {activity.slice(0, 15).map((a, i) => (
              <li key={`${a.type}-${a.at}-${i}`} className="flex items-start gap-2">
                {a.type === "file" ? <FileText className="h-4 w-4 text-muted-foreground mt-0.5" /> : null}
                {a.type === "message" ? <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" /> : null}
                {a.type === "feedback" ? <Star className="h-4 w-4 text-muted-foreground mt-0.5" /> : null}
                {a.type === "created" ? <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" /> : null}
                <div className="min-w-0">
                  <p>{a.label}</p>
                  {a.detail ? <p className="text-xs text-muted-foreground truncate">{a.detail}</p> : null}
                  <p className="text-xs text-muted-foreground">{timeAgo(a.at)} · {formatDate(a.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function useEngineers(): Profile[] {
  const { data } = useQuery<Profile[]>({ queryKey: ["engineers"], queryFn: () => getUsersByRole("engineer") });
  return data ?? [];
}

export function FilesTab({
  projectId,
  files,
  canManage,
}: {
  projectId: string;
  files: ReturnType<typeof useProjectFiles>;
  canManage: boolean;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files;
    if (!fl?.length || !user) return;
    try {
      const folder = `projects/${projectId}`;
      for (const file of Array.from(fl)) {
        const path = await uploadFile("projectFiles", folder, file);
        await addProjectFile({
          project_id: projectId,
          uploaded_by: user.id,
          name: file.name,
          file_type: file.type || "file",
          size: file.size,
          storage_path: path,
        });
      }
      qc.invalidateQueries({ queryKey: ["project-files", "list", projectId] });
      toast.success("Files uploaded");
    } catch (e: any) {
      toast.error("Upload failed", { description: e.message });
    }
  };

  return (
    <div className="space-y-4">
      {canManage ? (
        <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed p-6 cursor-pointer hover:bg-accent">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Upload files</span>
          <input type="file" multiple className="hidden" onChange={upload} />
        </label>
      ) : null}

      {files.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !files.data || files.data.length === 0 ? (
        <p className="text-center py-8 text-sm text-muted-foreground">No files shared yet.</p>
      ) : (
        <div className="space-y-2">
          {files.data.map((f: any) => {
            const url = getPublicUrl("projectFiles", f.storage_path);
            return (
              <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{Math.round(f.size / 1024)} KB</p>
                  </div>
                </div>
                {f.storage_path ? (
                  <a href={url} target="_blank" rel="noreferrer" download className="text-sm text-primary">
                    <Download className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InvoicesTab({
  invoices,
}: {
  invoices: ReturnType<typeof useProjectInvoices>;
}) {
  if (invoices.isLoading) return <Skeleton className="h-40 w-full" />;
  if (!invoices.data || invoices.data.length === 0)
    return <p className="text-center py-8 text-sm text-muted-foreground">No invoices for this project.</p>;

  return (
    <div className="space-y-3">
      {invoices.data.map((inv: any) => {
        const st = INVOICE_STATUS[inv.status as keyof typeof INVOICE_STATUS] ?? INVOICE_STATUS.pending;
        return (
          <Card key={inv.id}>
            <CardContent className="flex items-center justify-between pt-4">
              <div>
                <p className="font-medium">{inv.invoice_number}</p>
                <p className="text-sm text-muted-foreground">{inv.description}</p>
                <p className="text-xs text-muted-foreground">Due {formatDate(inv.due_date)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{currency(inv.amount)}</p>
                <Badge variant={st.color as "secondary" | "success" | "warning" | "destructive" | "default" | "outline"}>{st.label}</Badge>
                {inv.file_path ? (
                  <a href={inv.file_path} target="_blank" rel="noreferrer" className="ml-2 text-sm text-primary">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function FeedbackTab({
  projectId,
  feedback,
  canFeedback,
  submitFeedback,
  userId,
}: {
  projectId: string;
  feedback: ReturnType<typeof useProjectFeedback>;
  canFeedback: boolean;
  submitFeedback: ReturnType<typeof useSubmitFeedback>;
  userId: string;
}) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const onSubmit = async () => {
    if (!canFeedback) return;
    try {
      await submitFeedback.mutateAsync({
        project_id: projectId,
        client_id: userId,
        rating,
        communication: rating,
        quality: rating,
        delivery: rating,
        support: rating,
        comment,
      });
      toast.success("Feedback submitted");
    } catch (e: any) {
      toast.error("Could not submit feedback", { description: e.message });
    }
  };

  if (feedback.isLoading) return <Skeleton className="h-40 w-full" />;

  const existing = feedback.data;

  return (
    <div className="space-y-6">
      {existing ? (
        <Card>
          <CardContent className="pt-6">
            <p className="font-medium">Your feedback</p>
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={existing.rating} readOnly size="sm" />
              <span className="text-sm text-muted-foreground">{existing.rating}/5</span>
            </div>
            <p className="mt-2 text-sm">{existing.comment}</p>
          </CardContent>
        </Card>
      ) : canFeedback ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="font-medium">Leave feedback</p>
            <StarRating rating={rating} onRate={setRating} size="lg" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was good? What can we improve?"
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
            <Button onClick={onSubmit} disabled={submitFeedback.isPending}>
              {submitFeedback.isPending ? "Submitting…" : "Submit feedback"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">No feedback yet.</p>
      )}
    </div>
  );
}

function currency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
