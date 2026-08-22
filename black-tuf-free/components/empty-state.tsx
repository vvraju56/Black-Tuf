import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = (p) => <svg {...p} />, // fallback; prefer passing icon
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted/50 p-3 text-muted-foreground">
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function EmptyInline({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-sm text-muted-foreground py-6">{children}</p>;
}

export function StatCard({
  value,
  label,
  icon: Icon,
}: {
  value: number | string;
  label: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="glass p-5">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass p-5">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded bg-muted" />
        <div className="space-y-1">
          <div className="h-6 w-12 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
