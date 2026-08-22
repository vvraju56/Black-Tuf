"use client";

import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileCompletion } from "@/types";

export function ProfileCompletionCard({
  data,
  loading,
}: {
  data?: ProfileCompletion;
  loading?: boolean;
}) {
  return (
    <section className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Profile completion</h2>
        <span className="text-sm font-bold text-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${data?.percent ?? 0}%`}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            (data?.percent ?? 0) >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-cyan-500"
          )}
          style={{ width: `${data?.percent ?? 0}%` }}
        />
      </div>
      {data && data.percent < 100 && data.missing.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {data.missing.slice(0, 4).map((m) => (
            <li key={m} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleAlert className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              {m}
            </li>
          ))}
        </ul>
      )}
      {data && data.percent === 100 && (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-500">
          <CheckCircle2 className="h-4 w-4" /> Your profile is ready — clients can find you.
        </p>
      )}
    </section>
  );
}
