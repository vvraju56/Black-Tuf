"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSavedEngineers, useUnsaveEngineer } from "@/hooks/use-saved-engineers";
import { useRealtime } from "@/hooks/use-realtime";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";
import { Users, Heart, Star, Briefcase, Mail, MapPin } from "lucide-react";

export default function SavedEngineersPage() {
  useDashboardTitle("Saved Engineers", "Engineers you've shortlisted");
  const { user } = useAuth();
  const { data: saved, isLoading } = useSavedEngineers();

  useRealtime("saved-engineers-list", [
    { table: "saved_engineers", queryKeys: [["saved-engineers"]] },
  ]);

  return (
    <div className="space-y-6">
      {!user || user.role !== "client" ? (
        <EmptyState
          icon={Heart}
          title="Client Feature"
          description="Saved engineers are available to client accounts."
        />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      ) : !saved || saved.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Saved Engineers"
          description="Browse the engineer marketplace and tap the heart icon to save engineers you like."
          action={
            <Button variant="gradient" size="sm" asChild>
              <Link href="/engineers">Browse Engineers</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((s, i) => (
            <motion.div
              key={s.engineer_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card flex flex-col rounded-2xl p-5"
            >
              <div className="flex items-start justify-between">
                <AvatarWithFallback
                  src={s.engineer?.avatar_url}
                  name={s.engineer?.full_name}
                  email={s.engineer?.email}
                  size="lg"
                />
                <UnsaveButton engineerId={s.engineer_id} />
              </div>

              <Link href={`/engineers/${s.engineer_id}`} className="mt-3">
                <p className="font-semibold hover:text-primary">
                  {s.engineer?.full_name ?? "Engineer"}
                </p>
              </Link>
              <p className="text-sm text-muted-foreground">{s.engineer_profile?.title ?? "Engineer"}</p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {(s.engineer_profile?.skills ?? []).slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-[10px]">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                {s.engineer_profile?.rating != null && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {s.engineer_profile.rating}
                  </span>
                )}
                {s.engineer_profile?.experience_years != null && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {s.engineer_profile.experience_years}y
                  </span>
                )}
                {s.engineer_profile?.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.engineer_profile.location}
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-2 border-t border-border/60 pt-3">
                <Button size="sm" variant="gradient" className="flex-1" asChild>
                  <Link href={`/engineers/${s.engineer_id}`}>View Profile</Link>
                </Button>
                <Button size="sm" variant="secondary" className="flex-1" asChild>
                  <Link href={`mailto:${s.engineer?.email ?? ""}`}>
                    <Mail className="h-4 w-4" /> Contact
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function UnsaveButton({ engineerId }: { engineerId: string }) {
  const unsave = useUnsaveEngineer(engineerId);
  return (
    <Button
      size="icon"
      variant="ghost"
      className="text-destructive"
      onClick={() =>
        unsave.mutate(undefined, {
          onSuccess: () => toast.success("Removed from saved engineers."),
        })
      }
    >
      <Heart className="h-4 w-4 fill-destructive" />
    </Button>
  );
}
