"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionCard({
  id,
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("glass-card scroll-mt-24 rounded-2xl p-5 sm:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-4.5 w-4.5" />
            </span>
          )}
          <div>
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  message,
  hint,
  action,
}: {
  message: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-10 text-center">
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      {hint && <p className="max-w-sm text-xs text-muted-foreground/70">{hint}</p>}
      {action}
    </div>
  );
}
