"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarClock, FileText, Globe, MapPin, MessageSquare, Wallet, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFallback } from "@/components/ui/avatar";
import type { Project } from "@/types";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { useActiveServices } from "@/hooks/use-services";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const { services } = useActiveServices();
  const serviceById = useMemo(
    () => Object.fromEntries(services.map((s) => [s.id, s])),
    [services]
  );
  const domainIds = (project.domains ?? [])
    .map((d) => d.domain_id)
    .filter((id) => id in serviceById);

  const displayDomains = domainIds.length
    ? domainIds.slice(0, 3)
    : ([project.service] as string[]).filter((id) => id in serviceById);
  const extraDomains = domainIds.length - 3;
  const service = displayDomains.length ? serviceById[displayDomains[0]] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Link
        href={`/projects/${project.id}`}
        className="glass-card group flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:glass-ring"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              {service ? <service.icon className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{service?.title ?? project.service}</p>
              <p className="text-[11px] text-muted-foreground/70">{timeAgo(project.created_at)}</p>
            </div>
          </div>
          {project.status === "pending" ? (
            <Badge variant="warning" className="shrink-0">Open</Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0">{project.status}</Badge>
          )}
        </div>

        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>

        {(domainIds.length > 0 || project.skills?.length) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {displayDomains.map((id) => {
              const s = serviceById[id];
              const Icon = s?.icon;
              return (
                <span key={id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary">
                  {Icon && <Icon className="h-3 w-3" />}
                  {s?.short ?? id}
                </span>
              );
            })}
            {extraDomains > 0 && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                +{extraDomains} more
              </span>
            )}
            {project.skills?.slice(0, 2).map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                <Wrench className="h-3 w-3" />
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {project.budget != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-success">
              <Wallet className="h-3 w-3" />
              {formatCurrency(project.budget)}
            </span>
          )}
          {project.deadline && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <CalendarClock className="h-3 w-3" />
              {formatDate(project.deadline, { dateStyle: "medium" })}
            </span>
          )}
          {project.project_type === "on_site" && project.city ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <MapPin className="h-3 w-3" />
              {project.city}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <Globe className="h-3 w-3" />
              Online
            </span>
          )}
          {typeof project.proposal_count === "number" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
              <MessageSquare className="h-3 w-3" />
              {project.proposal_count} proposal{project.proposal_count === 1 ? "" : "s"}
            </span>
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
            <span />
          )}
          <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View project →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-5/6" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}
