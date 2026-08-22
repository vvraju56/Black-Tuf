"use client";

import { Star, MessageSquareQuote } from "lucide-react";
import { SectionCard, EmptyState } from "@/components/profile/sections/section-card";
import { AvatarWithFallback } from "@/components/ui/avatar";
import type { ProfileReviewSummary } from "@/services/profile-v2";
import { cn, formatDate } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({
  summary,
  compact,
}: {
  summary?: ProfileReviewSummary | null;
  compact?: boolean;
}) {
  const rating = summary?.rating ?? null;
  const count = summary?.count ?? 0;
  const reviews = summary?.reviews ?? [];

  return (
    <SectionCard
      id="reviews"
      title="Reviews"
      description={count > 0 ? `Based on ${count} review${count === 1 ? "" : "s"}` : undefined}
      icon={MessageSquareQuote}
    >
      {count === 0 ? (
        <EmptyState
          message="No reviews yet"
          hint="Complete projects and receive feedback to build your reputation."
        />
      ) : (
        <div className="space-y-4">
          {!compact && rating != null && (
            <div className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
              <span className="text-3xl font-extrabold">{rating}</span>
              <div>
                <Stars rating={rating} />
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {count} review{count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarWithFallback src={r.reviewer_avatar} name={r.reviewer_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{r.reviewer_name || "Anonymous"}</p>
                    {r.project_name && <p className="text-xs text-muted-foreground">{r.project_name}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Stars rating={r.rating} />
                  <span className="text-[11px] text-muted-foreground">{formatDate(r.created_at)}</span>
                </div>
              </div>
              {r.comment && <p className="mt-2 text-sm text-foreground/85">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
