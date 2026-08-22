"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, CheckCircle2, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { useEngineers } from "@/hooks/use-engineers";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import type { EngineerWithProfile } from "@/services/engineers";

function EngineerProfileCard({ engineer, index }: { engineer: EngineerWithProfile; index: number }) {
  const e = engineer;
  const p = engineer.profile;
  const rating = e.rating ?? null;
  const completed = e.completed_jobs ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.4) }}
      className="glass-card group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:glass-ring"
    >
      <div className="flex items-center gap-3">
        <AvatarWithFallback src={p.avatar_url} name={p.full_name} email={p.email} size="lg" />
        <div className="min-w-0">
          <h3 className="truncate font-bold leading-tight transition-colors group-hover:text-primary">
            {p.full_name ?? "Engineer"}
          </h3>
          <p className="truncate text-sm text-muted-foreground">{e.title || "Professional Engineer"}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        {rating != null ? (
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {rating}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 text-muted-foreground/40" />
            New
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          {e.experience_years} yrs
        </span>
        {completed > 0 && (
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-success" />
            {completed} done
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{e.bio}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {e.skills.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground">
            {s}
          </span>
        ))}
        {e.skills.length > 4 && (
          <span className="rounded-full px-2 py-0.5 text-xs text-muted-foreground">+{e.skills.length - 4}</span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        {e.location ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {e.location}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Remote</span>
        )}
        {e.hourly_rate != null && (
          <span className="text-sm font-bold">₹{e.hourly_rate}/hr</span>
        )}
      </div>

      <Button className="mt-4 w-full" variant="gradient" asChild>
        <Link href={`/engineers/${e.user_id}`}>
          Hire
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  );
}

function EngineerProfileSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-4/5" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="mt-4 h-10 w-full rounded-xl" />
    </div>
  );
}

export function TopEngineers() {
  const { data, isLoading } = useEngineers();
  const top = (data ?? []).slice(0, 8);

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Top Engineers"
          title="Engineers trusted by Black Tuf clients"
          description="Verified skills, real client ratings and a track record that speaks for itself."
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <EngineerProfileSkeleton key={i} />
            ))}
          </div>
        ) : top.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((e, i) => (
              <EngineerProfileCard key={e.user_id} engineer={e} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No engineers available."
            description="Engineer profiles will appear here once professionals join the marketplace."
          />
        )}

        <div className="mt-10 text-center">
          <Button variant="secondary" asChild>
            <Link href="/engineers">
              Browse all engineers <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
