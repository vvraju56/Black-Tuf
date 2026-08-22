"use client";

import { useAdminFeedback, useApproveFeedback } from "@/hooks/use-admin";
import { timeAgo } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/star-rating";
import type { Feedback } from "@/types";

export function FeedbackPanel() {
  const feedback = useAdminFeedback();
  const approve = useApproveFeedback();
  const list = feedback.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback ({list.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {feedback.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No feedback yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((f) => (
              <FeedbackCard key={f.id} feedback={f} onToggle={() => approve.mutate({ id: f.id, approved: !f.is_approved })} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FeedbackCard({ feedback, onToggle }: { feedback: Feedback; onToggle: () => void }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <p className="font-medium">{feedback.project?.name ?? "Project"}</p>
        <Badge variant={feedback.is_approved ? "success" : "secondary"}>
          {feedback.is_approved ? "Approved" : "Pending"}
        </Badge>
      </div>
      <StarRating rating={feedback.rating} readOnly size="sm" />
      {feedback.comment ? <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{feedback.comment}</p> : null}
      <p className="mt-2 text-xs text-muted-foreground">
        {feedback.client?.full_name ?? feedback.client?.email ?? "Client"} · {timeAgo(feedback.created_at)}
      </p>
      <Button size="sm" variant="outline" className="mt-2" onClick={onToggle}>
        {feedback.is_approved ? "Unapprove" : "Approve"}
      </Button>
    </div>
  );
}
