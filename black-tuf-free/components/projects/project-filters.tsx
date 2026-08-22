"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Globe, MapPin, Search, SlidersHorizontal, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard, ProjectCardSkeleton } from "@/components/projects/project-card";
import { useBrowseProjects } from "@/hooks/use-browse-projects";
import { useActiveServices } from "@/hooks/use-services";
import type { BrowseFilters } from "@/services/projects";

export function ProjectFilters({
  onFilters,
}: {
  onFilters: (f: BrowseFilters) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") ?? "";
  const { services } = useActiveServices();
  const serviceById = useMemo(
    () => Object.fromEntries(services.map((s) => [s.id, s])),
    [services]
  );

  const [query, setQuery] = useState(initialQ);
  const [service, setService] = useState("");
  const [projectType, setProjectType] = useState<"" | "online" | "on_site">("");
  const [budgetMax, setBudgetMax] = useState<number | null>(null);
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState<BrowseFilters["sort"]>("newest");

  const apply = () => {
    onFilters({ query, service, project_type: projectType, budgetMax, deadline, location, sort });
    if (query) router.replace(`/projects?q=${encodeURIComponent(query)}`, { scroll: false });
    else router.replace("/projects", { scroll: false });
  };

  const clearAll = () => {
    setQuery("");
    setService("");
    setProjectType("");
    setBudgetMax(null);
    setDeadline("");
    setLocation("");
    setSort("newest");
    onFilters({});
  };

  const activeCount =
    (query ? 1 : 0) +
    (service ? 1 : 0) +
    (projectType ? 1 : 0) +
    (budgetMax ? 1 : 0) +
    (deadline ? 1 : 0) +
    (location ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4"
    >
      <div className="flex flex-col gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            apply();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="pl-9"
            />
          </div>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={projectType} onValueChange={(v) => setProjectType(v as never)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="on_site">On-Site</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" variant="gradient">Apply</Button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-44">
            <Wallet className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              min={0}
              value={budgetMax ?? ""}
              onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : null)}
              placeholder="Max budget (₹)"
              className="h-9 pl-8 text-sm"
            />
          </div>
          <div className="relative w-40">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
          <div className="relative w-44">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="h-9 pl-8 text-sm"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as never)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="budget_high">Budget: high to low</SelectItem>
              <SelectItem value="budget_low">Budget: low to high</SelectItem>
              <SelectItem value="deadline">Earliest deadline</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={clearAll} className="ml-auto">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Clear{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 pt-3"
          >
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {query && (
              <Badge variant="secondary" className="gap-1">
                {query}
                <button onClick={() => setQuery("")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {service && (
              <Badge variant="secondary" className="gap-1">
                {serviceById[service]?.title ?? service}
                <button onClick={() => setService("")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {projectType && (
              <Badge variant="secondary" className="gap-1">
                {projectType === "online" ? "Online" : "On-Site"}
                <button onClick={() => setProjectType("")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {budgetMax && (
              <Badge variant="secondary" className="gap-1">
                ≤ ₹{budgetMax}
                <button onClick={() => setBudgetMax(null)}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {deadline && (
              <Badge variant="secondary" className="gap-1">
                Due {deadline}
                <button onClick={() => setDeadline("")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function BrowseGrid({ filters }: { filters: BrowseFilters }) {
  const { data, isLoading, isFetching } = useBrowseProjects(filters);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading projects…" : `${data?.length ?? 0} open projects`}
        </p>
        {isFetching && <span className="text-xs text-muted-foreground">Syncing…</span>}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Globe}
          title="No Projects Found"
          description="Try adjusting your filters, or post this project yourself so engineers come to you."
          action={
            <Button variant="gradient" size="sm" asChild>
              <a href="/register">Request a Project</a>
            </Button>
          }
        />
      )}
    </div>
  );
}
