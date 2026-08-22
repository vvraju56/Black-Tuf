"use client";

import { useAuth } from "@/hooks/use-auth";
import { useFeedback, useSubmitFeedback, feedbackKeys } from "@/hooks/use-feedback";
import { useProjects } from "@/hooks/use-projects";
import { useRealtime } from "@/hooks/use-realtime";
import { timeAgo } from "@/lib/utils";
import type { Feedback } from "@/types";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { toast } from "sonner";
import { useState } from "react";

export default function FeedbackPage() {
  useDashboardTitle("Feedback");
  const { user, profile } = useAuth();
  const { data: all, isLoading } = useFeedback();

  useRealtime("feedback-page", [
    { table: "feedback", queryKeys: [feedbackKeys.all] },
  ]);

  if (!user) return null;

  const role = profile?.role;
  const items = (all ?? []).filter((f) => {
    if (role === "client") return f.client_id === user.id;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Feedback</h2>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : items.length === 0 ? (
        <EmptyState role={role ?? "client"} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((f) => (
            <FeedbackCard key={f.id} feedback={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const st = feedback.is_approved ? "approved" : "pending";
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{feedback.project?.name ?? "—"}</CardTitle>
        <StarRating rating={feedback.rating} readOnly />
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm">
        {feedback.comment ? <p className="line-clamp-3">{feedback.comment}</p> : null}
        <div className="flex gap-4 text-xs text-muted-foreground">
          {feedback.communication != null && (
            <span>Comm: {feedback.communication}/5</span>
          )}
          {feedback.quality != null && <span>Quality: {feedback.quality}/5</span>}
          {feedback.delivery != null && <span>Delivery: {feedback.delivery}/5</span>}
          {feedback.support != null && <span>Support: {feedback.support}/5</span>}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{timeAgo(feedback.created_at)}</span>
          <Badge variant={st === "approved" ? "success" : "secondary"}>
            {st === "approved" ? "Approved" : "Pending approval"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ role }: { role: string }) {
  if (role === "client") {
    return (
      <div className="rounded-lg border border-dashed p-6">
        <h3 className="font-medium">Leave feedback for a completed project</h3>
        <SubmitFeedbackForm />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
      <Star className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No feedback yet.</p>
    </div>
  );
}

function SubmitFeedbackForm() {
  const { user } = useAuth();
  const { data: projects } = useProjects();
  const { data: existing } = useFeedback();
  const submit = useSubmitFeedback();
  const [projectId, setProjectId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!user) return null;

  const eligible = (projects ?? []).filter((p) => p.client_id === user.id);
  const completed = eligible.filter((p) => p.status === "completed");
  const feedbacked = new Set((existing ?? []).map((f) => f.project_id));
  const canSubmit = completed.filter((p) => !feedbacked.has(p.id));

  return (
    <div className="mt-4 space-y-3">
      <select
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="w-full rounded-md border border-input text-sm px-2 py-1"
        disabled={submit.isPending || canSubmit.length === 0}
      >
        <option value="">Select a completed project</option>
        {canSubmit.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <StarRating rating={rating} onRate={setRating} />
      <Textarea
        placeholder="What did we do well? What can improve?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button
        disabled={!projectId || rating < 1 || submit.isPending}
        onClick={async () => {
          try {
            await submit.mutateAsync({
              project_id: projectId,
              client_id: user.id,
              rating,
              communication: rating,
              quality: rating,
              delivery: rating,
              support: rating,
              comment,
            });
            toast.success("Feedback submitted");
            setProjectId("");
            setRating(0);
            setComment("");
          } catch (e: any) {
            toast.error("Submission failed", { description: e.message });
          }
        }}
      >
        <Send className="h-4 w-4 mr-1" />
        Submit
      </Button>
    </div>
  );
}
