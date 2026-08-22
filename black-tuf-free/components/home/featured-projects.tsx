"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FolderOpen, MapPin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { useFeaturedProjects } from "@/hooks/use-browse-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import type { Project } from "@/types";
import { SERVICE_BY_ID } from "@/utils/constants";
import { formatCurrency } from "@/lib/utils";

function FeaturedProjectCard({ project, index }: { project: Project; index: number }) {
  const service = SERVICE_BY_ID[project.service as keyof typeof SERVICE_BY_ID];
  const tech = service?.technologies.slice(0, 3) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.4) }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="glass-card group flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:glass-ring"
      >
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-indigo-600/40 via-violet-600/30 to-cyan-500/30">
          <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background/70 backdrop-blur text-primary">
            {service ? <service.icon className="h-5 w-5" /> : <FolderOpen className="h-5 w-5" />}
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur">
            {service?.title ?? project.service}
          </span>
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <span key={t} className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 font-bold leading-snug transition-colors group-hover:text-primary">
            {project.name}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {project.budget != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-success">
                <Wallet className="h-3 w-3" />
                {formatCurrency(project.budget)}
              </span>
            )}
            {project.project_type === "on_site" && project.city ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <MapPin className="h-3 w-3" />
                {project.city}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">Remote</span>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
            {project.client ? (
              <div className="flex items-center gap-2">
                <AvatarWithFallback
                  src={project.client.avatar_url}
                  name={project.client.full_name}
                  size="sm"
                />
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {project.client.full_name ?? "Client"}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Completed project</span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              View Details
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedProjectSkeleton() {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedProjects() {
  const { data, isLoading } = useFeaturedProjects();
  const items = (data ?? []).slice(0, 8);

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Featured Projects"
          title="Recent work delivered on Black Tuf"
          description="A selection of completed projects shipped by our verified engineers."
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <FeaturedProjectSkeleton key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p, i) => (
              <FeaturedProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="No featured projects available."
            description="Completed projects will appear here once clients finish their first engagements."
          />
        )}

        <div className="mt-10 text-center">
          <Button variant="secondary" asChild>
            <Link href="/projects">
              Browse all open projects <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
