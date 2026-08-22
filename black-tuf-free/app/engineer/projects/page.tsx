"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard, ProjectCardSkeleton } from "@/components/projects/project-card";
import { useBrowseProjects } from "@/hooks/use-browse-projects";
import { useMyProposals } from "@/hooks/use-proposals";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { Compass, Search, SlidersHorizontal, X } from "lucide-react";
import { useActiveServices } from "@/hooks/use-services";
import { cn } from "@/lib/utils";
import type { BrowseFilters } from "@/services/projects";

const EXPERIENCE_OPTIONS = [
  { value: "", label: "Any experience" },
  { value: "0-1", label: "0-1 yrs" },
  { value: "1-3", label: "1-3 yrs" },
  { value: "3-5", label: "3-5 yrs" },
  { value: "5+", label: "5+ yrs" },
];

export default function EngineerBrowseProjectsPage() {
  useDashboardTitle("Global Projects", "Browse every open project on the marketplace");
  const { services } = useActiveServices();
  const [search, setSearch] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [experience, setExperience] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectType, setProjectType] = useState<"" | "online" | "on_site">("");

  const filters = useMemo<BrowseFilters>(() => ({}), []);
  const { data: projects, isLoading, isFetching } = useBrowseProjects(filters);
  const { data: myProposals } = useMyProposals();

  useRealtime("engineer-browse", [
    { table: "projects", queryKeys: [["browse-projects"]] },
    { table: "project_domains", queryKeys: [["browse-projects"]] },
    { table: "proposals", queryKeys: [["proposals"]] },
  ]);

  const appliedIds = useMemo(
    () => new Set((myProposals ?? []).map((p) => p.project_id)),
    [myProposals]
  );

  const toggleDomain = (id: string) => {
    setDomains((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const experienceFilter = (exp: string, p: { experience_required: number | null }) => {
    if (!exp || p.experience_required == null) return true;
    switch (exp) {
      case "0-1": return p.experience_required <= 1;
      case "1-3": return p.experience_required <= 3;
      case "3-5": return p.experience_required <= 5;
      case "5+": return p.experience_required >= 5;
      default: return true;
    }
  };

  const filtered = useMemo(() => {
    if (!projects) return [];
    const q = search.trim().toLowerCase();
    const budget = budgetMax ? Number(budgetMax) : null;
    return projects.filter((p) => {
      if (q) {
        const inName = p.name.toLowerCase().includes(q);
        const inDesc = (p.description ?? "").toLowerCase().includes(q);
        const inService = (p.service ?? "").toLowerCase().includes(q);
        const inCity = (p.city ?? "").toLowerCase().includes(q);
        const inDomains = (p.domains ?? []).some((d) =>
          (d.domain?.name ?? "").toLowerCase().includes(q)
        );
        if (!(inName || inDesc || inService || inCity || inDomains)) return false;
      }
      if (domains.length > 0) {
        const projectDomains = (p.domains ?? []).map((d) => d.domain_id);
        if (!projectDomains.some((d) => domains.includes(d))) return false;
      }
      if (budget != null && p.budget != null && p.budget > budget) return false;
      if (deadline && p.deadline && p.deadline > deadline) return false;
      if (projectType && p.project_type !== projectType) return false;
      if (!experienceFilter(experience, p)) return false;
      return true;
    });
  }, [projects, search, domains, budgetMax, deadline, projectType, experience]);

  const clearAll = () => {
    setSearch("");
    setDomains([]);
    setBudgetMax("");
    setExperience("");
    setDeadline("");
    setProjectType("");
  };

  const activeCount =
    (search ? 1 : 0) +
    domains.length +
    (budgetMax ? 1 : 0) +
    (experience ? 1 : 0) +
    (deadline ? 1 : 0) +
    (projectType ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="glass-card space-y-4 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects, domains, skills…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Domains
          </p>
          <div className="flex flex-wrap gap-1.5">
            {services.map((s) => {
              const active = domains.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleDomain(s.id)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <s.icon className="h-3 w-3" />
                  {s.short}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Max budget (₹)</label>
            <Input
              type="number"
              min={0}
              placeholder="Any"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Experience required</label>
            <select
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Deadline before</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Project type</label>
            <select
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as never)}
            >
              <option value="">All</option>
              <option value="online">Online</option>
              <option value="on_site">On-Site</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Loading…" : `${filtered.length} project${filtered.length === 1 ? "" : "s"} found`}
            {isFetching ? " · syncing…" : ""}
          </p>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Clear ({activeCount})
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={activeCount ? "No Projects Match Your Filters" : "No Projects Found"}
          description={
            activeCount
              ? "Try widening your filters, or clear them to see every open project."
              : "Check back soon — new projects are posted regularly."
          }
          action={
            activeCount ? (
              <Button variant="gradient" size="sm" onClick={clearAll}>
                <X className="h-4 w-4" /> Clear all filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id}>
              <ProjectCard project={p} index={i} />
              {appliedIds.has(p.id) && (
                <p className="mt-1 text-center text-xs text-primary">
                  ✓ You've submitted a proposal for this project
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
