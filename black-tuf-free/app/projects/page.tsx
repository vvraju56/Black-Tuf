"use client";

import { Suspense, useState } from "react";
import { AuroraBackground } from "@/components/home/aurora-background";
import { BrowseGrid, ProjectFilters } from "@/components/projects/project-filters";
import type { BrowseFilters } from "@/services/projects";

export default function ProjectsPage() {
  const [filters, setFilters] = useState<BrowseFilters>({});

  return (
    <div className="relative min-h-screen">
      <AuroraBackground className="opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Browse <span className="text-gradient">open projects</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Real projects posted by clients. Filter by category, budget, location
            and deadline to find the right engagement.
          </p>
        </div>

        <Suspense fallback={null}>
          <ProjectFilters onFilters={setFilters} />
        </Suspense>

        <div className="mt-8">
          <BrowseGrid filters={filters} />
        </div>
      </div>
    </div>
  );
}
