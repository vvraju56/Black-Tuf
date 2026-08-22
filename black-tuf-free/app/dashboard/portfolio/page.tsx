"use client";

import Link from "next/link";
import { Briefcase, Plus, MapPin, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMyEngineerProfile } from "@/hooks/use-engineers";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PortfolioPage() {
  useDashboardTitle("Portfolio", "Showcase your work and skills");
  const { user } = useAuth();
  const { data: profile } = useMyEngineerProfile();

  return (
    <div className="space-y-6 animate-black-tuf-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Showcase your work and skills.</p>
        </div>
      </div>

      <div className="black-tuf-card rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-xl font-bold text-white">
            {user?.email?.slice(0, 1).toUpperCase() ?? "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User"}</h2>
            <p className="text-sm text-muted-foreground">{profile?.title ?? "Professional"}</p>
            {profile?.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />{profile.location}
              </p>
            )}
          </div>
        </div>

        {profile?.bio && <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>}

        {profile?.skills && profile.skills.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-lg font-bold">{profile?.completed_jobs ?? 0}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="flex items-center justify-center gap-1 text-lg font-bold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {profile?.rating?.toFixed(1) ?? "0.0"}
            </p>
            <p className="text-[10px] text-muted-foreground">Rating</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-lg font-bold">{profile?.experience_years ?? 0}+</p>
            <p className="text-[10px] text-muted-foreground">Years Exp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
