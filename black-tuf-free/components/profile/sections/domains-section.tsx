"use client";

import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionCard, EmptyState } from "@/components/profile/sections/section-card";
import { useDomains, useSetProfileDomains } from "@/hooks/use-profile";
import type { ProfileDomain } from "@/types";
import { toast } from "sonner";

export function DomainsSection({
  domains = [],
  editable,
}: {
  domains?: ProfileDomain[];
  editable?: boolean;
}) {
  const { data: catalog = [] } = useDomains();
  const setDomains = useSetProfileDomains();

  const selected = new Set(domains.map((d) => d.domain_id));

  const toggle = (id: string) => {
    const next = [...selected];
    if (selected.has(id)) {
      next.splice(next.indexOf(id), 1);
    } else {
      next.push(id);
    }
    setDomains.mutate(next, {
      onError: (e) => toast.error(e.message ?? "Failed to update domains"),
    });
  };

  return (
    <SectionCard
      id="domains"
      title="Service Domains"
      description="Used to match you with relevant projects"
      icon={Layers}
    >
      {editable && (
        <p className="mb-3 text-sm text-muted-foreground">
          Select the domains you serve. You'll receive matching project recommendations from these
          domains.
        </p>
      )}
      {catalog.length === 0 ? (
        <EmptyState message="No service domains available yet" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {catalog.map((d) => {
            const active = selected.has(d.id);
            return (
              <button
                key={d.id}
                type="button"
                disabled={!editable}
                onClick={() => toggle(d.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50",
                  !editable && "cursor-default"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", active ? "bg-primary" : "bg-muted-foreground/40")} />
                {d.name}
              </button>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
