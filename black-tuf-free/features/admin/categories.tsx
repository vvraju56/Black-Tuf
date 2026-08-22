"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useAdminServices } from "@/hooks/use-admin";
import { Layers } from "lucide-react";
import type { Service } from "@/types";

export function CategoriesPanel() {
  const { data: services, isLoading } = useAdminServices();

  const groups = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services ?? []) {
      const key = s.icon?.trim() || "default";
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [services]);

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  if (!services || services.length === 0) {
    return <EmptyState icon={Layers} title="No Services" description="Add services first to see category groups." />;
  }

  return (
    <div className="space-y-6">
      {groups.map(([icon, items]) => (
        <div key={icon} className="rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Layers className="h-4 w-4" />
            </span>
            <p className="font-medium capitalize">{icon === "default" ? "General" : icon}</p>
            <Badge variant="secondary">{items.length}</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-accent"
              >
                <span>{s.name}</span>
                {!s.is_active && <Badge variant="outline">Disabled</Badge>}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
