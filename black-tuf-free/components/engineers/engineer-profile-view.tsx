"use client";

import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CalendarClock,
  Globe,
  Languages,
  Mail,
  MapPin,
  Medal,
  MessageSquare,
  Star,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { useEngineer } from "@/hooks/use-engineers";
import { useAuth } from "@/hooks/use-auth";
import {
  useIsEngineerSaved,
  useSaveEngineer,
  useUnsaveEngineer,
} from "@/hooks/use-saved-engineers";
import { useRouter } from "next/navigation";
import { formatDate, timeAgo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getEngineerRating } from "@/services/engineers";

const availabilityLabel: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  busy: "Busy",
};

export function EngineerProfileView({ userId }: { userId: string }) {
  const { data: engineer, isLoading } = useEngineer(userId);
  const { user, profile } = useAuth();
  const router = useRouter();

  const { data: ratingInfo } = useQuery({
    queryKey: ["engineer-rating", userId],
    queryFn: () => getEngineerRating(userId),
    enabled: !!userId,
  });

  const { data: saved } = useIsEngineerSaved(userId);
  const save = useSaveEngineer(userId);
  const unsave = useUnsaveEngineer(userId);

  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="mt-6 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-5/6" />
      </div>
    );
  }

  if (!engineer) {
    return (
      <EmptyState
        icon={Award}
        title="Engineer not found"
        description="This engineer profile is not available or has been hidden."
        action={
          <Button variant="secondary" asChild>
            <Link href="/engineers">Browse engineers</Link>
          </Button>
        }
      />
    );
  }

  const e = engineer;
  const p = engineer.profile;
  const isOwn = user?.id === e.user_id;
  const isClient = profile?.role === "client";

  const toggleSave = () => {
    if (!user) {
      router.push("/login?next=/engineers/" + userId);
      return;
    }
    if (saved) unsave.mutate();
    else save.mutate();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="glass-card rounded-3xl p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <AvatarWithFallback src={p.avatar_url} name={p.full_name} email={p.email} size="lg" className="h-20 w-20" />
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                  {p.full_name ?? "Engineer"}
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </h1>
                <p className="text-muted-foreground">{e.title || "Professional Engineer"}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={e.is_available ? "success" : "secondary"}>
                    {availabilityLabel[e.availability] ?? (e.is_available ? "Available" : "Busy")}
                  </Badge>
                  {ratingInfo?.rating != null && (
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {ratingInfo.rating}
                      <span className="text-muted-foreground">({ratingInfo.count})</span>
                    </Badge>
                  )}
                  {e.experience_years > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Briefcase className="h-3 w-3" /> {e.experience_years} yrs exp
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              {isClient && !isOwn && (
                <Button
                  variant={saved ? "secondary" : "gradient"}
                  size="sm"
                  onClick={toggleSave}
                  disabled={save.isPending || unsave.isPending}
                >
                  {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {saved ? "Saved" : "Save Engineer"}
                </Button>
              )}
              {isOwn && (
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/engineer/settings">Edit Profile</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => router.push("/contact")}>
                <MessageSquare className="h-4 w-4" /> Contact
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {e.bio || "This engineer hasn't added a bio yet."}
            </p>
          </div>

          {e.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {e.skills.map((s) => (
                  <span key={s} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {e.certificates.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Medal className="h-4 w-4" /> Certificates
              </h2>
              <div className="flex flex-wrap gap-2">
                {e.certificates.map((c) => (
                  <span key={c} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {e.portfolio_links.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Portfolio
              </h2>
              <div className="flex flex-wrap gap-2">
                {e.portfolio_links.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-primary hover:bg-accent/60"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {new URL(link).hostname}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Details
          </h2>
          <dl className="space-y-3 text-sm">
            {e.hourly_rate != null && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /> Hourly rate</dt>
                <dd className="font-semibold">₹{e.hourly_rate}/hr</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Location</dt>
              <dd>{e.location ?? "—"}</dd>
            </div>
            {e.languages.length > 0 && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-muted-foreground"><Languages className="h-4 w-4" /> Languages</dt>
                <dd>{e.languages.join(", ")}</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground"><CalendarClock className="h-4 w-4" /> Joined</dt>
              <dd>{p.created_at ? formatDate(p.created_at) : "—"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> Member</dt>
              <dd className="text-xs">{timeAgo(p.created_at)}</dd>
            </div>
          </dl>
        </div>

        {isClient && !isOwn && (
          <Button className="w-full" variant="gradient" asChild>
            <Link href="/register?role=client">
              <MessageSquare className="h-4 w-4" /> Hire {p.full_name?.split(" ")[0] ?? "this engineer"}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
