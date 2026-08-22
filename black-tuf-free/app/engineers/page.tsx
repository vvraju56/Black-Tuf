"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AuroraBackground } from "@/components/home/aurora-background";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { EngineerCard, EngineerCardSkeleton } from "@/components/engineers/engineer-card";
import { useEngineers } from "@/hooks/use-engineers";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EngineersPage() {
  const { data, isLoading } = useEngineers();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"experience" | "rate_low" | "rate_high" | "name">("experience");

  const filtered = (data ?? [])
    .filter((e) => {
      const p = e.profile;
      const haystack = [
        p.full_name,
        e.title,
        e.bio,
        e.skills.join(" "),
        e.location,
      ].join(" ").toLowerCase();
      return haystack.includes(query.toLowerCase());
    })
    .sort((a, b) => {
      switch (sort) {
        case "rate_low":
          return (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0);
        case "rate_high":
          return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0);
        case "name":
          return (a.profile.full_name ?? "").localeCompare(b.profile.full_name ?? "");
        default:
          return b.experience_years - a.experience_years;
      }
    });

  return (
    <div className="relative min-h-screen">
      <AuroraBackground className="opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Find <span className="text-gradient">your engineer</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Vetted Black Tuf professionals across software and industrial
              engineering, with verified skills and client ratings.
            </p>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or skill…"
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as never)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="experience">Most experienced</SelectItem>
                <SelectItem value="rate_low">Rate: low to high</SelectItem>
                <SelectItem value="rate_high">Rate: high to low</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EngineerCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e, i) => (
              <EngineerCard key={e.user_id} engineer={e} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No engineers found"
            description="No engineers match your search yet. Check back soon or become an engineer."
          />
        )}
      </div>
    </div>
  );
}
