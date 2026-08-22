"use client";

import { useMemo, useState } from "react";
import { useActiveServices } from "@/hooks/use-services";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export function PortfolioGrid({ projects }: { projects: Project[] }) {
  const { services } = useActiveServices();
  const [cat, setCat] = useState("all");
  const serviceById = useMemo(
    () => Object.fromEntries(services.map((s) => [s.id, s])),
    [services]
  );
  const categories = useMemo(
    () => [
      { value: "all", label: "All Projects" },
      ...services.map((s) => ({ value: s.id, label: s.title })),
    ],
    [services]
  );
  const filtered = cat === "all" ? projects : projects.filter((p) => p.service === cat);

  return (
    <div className="mt-12">
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCat(c.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              cat === c.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={FolderKanban}
            title="No projects in this category"
            description="Published case studies will appear here as we finish them."
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const svc = serviceById[p.service];
            return (
              <div key={p.id} className="group overflow-hidden rounded-xl border glass p-4 transition-colors hover:border-primary/40">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {svc ? <svc.icon className="h-6 w-6 text-primary" /> : <FolderKanban className="h-6 w-6 text-primary" />}
                </div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                {svc ? <p className="text-sm text-muted-foreground">{svc.title}</p> : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{p.project_type === "on_site" ? "On-site" : "Online"}</Badge>
                  <Badge variant="outline">Completed</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
