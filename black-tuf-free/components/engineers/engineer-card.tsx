"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Briefcase, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFallback } from "@/components/ui/avatar";
import type { EngineerWithProfile } from "@/services/engineers";

const availabilityLabel: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  busy: "Busy",
};

export function EngineerCard({
  engineer,
  index = 0,
}: {
  engineer: EngineerWithProfile;
  index?: number;
}) {
  const e = engineer;
  const p = engineer.profile;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Link
        href={`/engineers/${e.user_id}`}
        className="glass-card group flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:glass-ring"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AvatarWithFallback src={p.avatar_url} name={p.full_name} email={p.email} size="lg" />
            <div>
              <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                {p.full_name ?? "Engineer"}
              </h3>
              <p className="text-sm text-muted-foreground">{e.title || "Professional Engineer"}</p>
            </div>
          </div>
          {e.is_available ? (
            <Badge variant="success">{availabilityLabel[e.availability] ?? "Available"}</Badge>
          ) : (
            <Badge variant="secondary">Busy</Badge>
          )}
        </div>

        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{e.bio}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {e.skills.slice(0, 4).map((s) => (
            <span key={s} className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground">
              {s}
            </span>
          ))}
          {e.skills.length > 4 && (
            <span className="rounded-full px-2 py-0.5 text-xs text-muted-foreground">
              +{e.skills.length - 4}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {e.experience_years} yrs
            </span>
            {e.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {e.location}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {e.rating != null && (
              <span className="inline-flex items-center gap-1 text-foreground">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {e.rating}
              </span>
            )}
            {e.hourly_rate != null && (
              <span className="font-semibold text-foreground">₹{e.hourly_rate}/hr</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function EngineerCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
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
    </div>
  );
}

export function TopEngineerBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-primary">
      <Award className="h-3.5 w-3.5" /> Top Engineer
    </span>
  );
}
