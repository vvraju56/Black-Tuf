"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { useFeedback } from "@/hooks/use-feedback";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { Star, ThumbsUp } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function EngineerReviewsPage() {
  useDashboardTitle("Reviews", "Feedback from clients");
  const { user } = useAuth();
  const { data: feedback, isLoading } = useFeedback();

  useRealtime("engineer-reviews", [
    { table: "feedback", queryKeys: [["feedback"]] },
  ]);

  const myReviews = useMemo(
    () => (feedback ?? []).filter((f) => f.is_approved && f.project?.engineer_id === user?.id),
    [feedback, user]
  );

  const avg =
    myReviews.length > 0
      ? Math.round((myReviews.reduce((s, f) => s + f.rating, 0) / myReviews.length) * 10) / 10
      : null;

  return (
    <div className="space-y-6">
      {avg != null && (
        <div className="glass-card flex items-center gap-4 rounded-2xl p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary">
            {avg}
          </div>
          <div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(avg) ? "fill-warning text-warning" : "text-muted"}`}
                />
              ))}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on {myReviews.length} review{myReviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : myReviews.length === 0 ? (
        <EmptyState
          icon={ThumbsUp}
          title="No Reviews Yet"
          description="Approved client reviews will show up here after projects are completed."
        />
      ) : (
        <div className="space-y-3">
          {myReviews.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AvatarWithFallback src={f.client?.avatar_url} name={f.client?.full_name} email={f.client?.email} />
                  <div>
                    <p className="font-semibold">{f.client?.full_name ?? "Client"}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.project?.name ?? "Project"} · {timeAgo(f.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant="warning" className="gap-1">
                  <Star className="h-3 w-3 fill-warning" /> {f.rating}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.comment}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {f.communication != null && <Badge variant="outline">Communication {f.communication}/5</Badge>}
                {f.quality != null && <Badge variant="outline">Quality {f.quality}/5</Badge>}
                {f.delivery != null && <Badge variant="outline">Delivery {f.delivery}/5</Badge>}
                {f.support != null && <Badge variant="outline">Support {f.support}/5</Badge>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
