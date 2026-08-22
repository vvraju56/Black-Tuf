"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Clock, Handshake, MessageSquare, FolderKanban, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AboutSection } from "@/components/profile/sections/about-section";
import { DomainsSection } from "@/components/profile/sections/domains-section";
import { SkillsSection } from "@/components/profile/sections/skills-section";
import { PortfolioSection } from "@/components/profile/sections/portfolio-section";
import { ExperienceSection } from "@/components/profile/sections/experience-section";
import { ReviewsSection } from "@/components/profile/sections/reviews-section";
import {
  usePublicProfileByUsername,
  useProfileDomains,
  useProfileReviews,
  usePublicSkills,
  usePortfolioProjects,
  useExperience,
} from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/utils";

function dashboardHref(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "engineer") return "/engineer";
  return "/dashboard";
}

function currencySymbol(code?: string | null) {
  const symbols: Record<string, string> = {
    USD: "$", INR: "₹", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$",
    JPY: "¥", AED: "د.إ", SAR: "﷼", SGD: "S$", NGN: "₦", KES: "KSh", BRL: "R$",
  };
  return symbols[code ?? "USD"] ?? `${code ?? "USD"} `;
}

const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Switzerland: "🇨🇭",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Japan: "🇯🇵",
  China: "🇨🇳",
  Singapore: "🇸🇬",
  "United Arab Emirates": "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  Nigeria: "🇳🇬",
  Kenya: "🇰🇪",
  Brazil: "🇧🇷",
  Mexico: "🇲🇽",
};

function countryFlag(country?: string | null) {
  if (!country) return null;
  return COUNTRY_FLAGS[country] ?? "🌐";
}

function localTime(timezone?: string | null) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
  }
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { user, profile: viewer } = useAuth();
  const username = typeof params?.username === "string" ? params.username : "";

  const { data: profile, isLoading, error } = usePublicProfileByUsername(username);
  const id = profile?.id ?? "";

  const domains = useProfileDomains(id);
  const reviews = useProfileReviews(id);
  const skills = usePublicSkills(id);
  const portfolio = usePortfolioProjects(id);
  const experience = useExperience(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="text-sm text-muted-foreground">This profile doesn't exist or is no longer available.</p>
        <Button onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const isSelf = user?.id === profile.id;
  const verified = profile.verification_badge || profile.email_verified || false;
  const online = profile.last_seen_at
    ? Date.now() - new Date(profile.last_seen_at).getTime() < 5 * 60 * 1000
    : false;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
      {/* Header */}
      <section className="glass-card relative overflow-hidden rounded-3xl">
        <div className="relative h-40 sm:h-48">
          {profile.cover_url ? (
            <img src={profile.cover_url} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-600/40 via-violet-600/30 to-cyan-500/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>
        <div className="relative -mt-12 px-5 pb-5 sm:-mt-14 sm:px-8 sm:pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl sm:h-28 sm:w-28">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? "avatar"} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xl">
                  {initials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-2xl font-extrabold tracking-tight">{profile.full_name || "@" + (profile.username ?? "user")}</h1>
                  {verified && <BadgeCheck className="h-6 w-6 shrink-0 text-cyan-400" />}
                  <span
                    className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${online ? "bg-emerald-500" : "bg-zinc-500"}`}
                    title={online ? "Online" : "Offline"}
                  />
                </div>
                {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                {profile.headline && <p className="mt-1 text-sm font-medium text-foreground/90 sm:text-base">{profile.headline}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {profile.country && (
                    <span className="inline-flex items-center gap-1.5">
                      <span>{countryFlag(profile.country)}</span>
                      {profile.country}
                      {profile.city ? ` · ${profile.city}` : ""}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {localTime(profile.timezone)}
                  </span>
                  {profile.hourly_rate != null && profile.hourly_rate > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      {currencySymbol(profile.hourly_currency)}{profile.hourly_rate} / hour
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {profile.available_for_work ? (
                <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-500">
                  Available for Work
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-muted-foreground/40 text-muted-foreground">
                  Not Available
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <Button size="sm" asChild>
              <Link href="/dashboard/projects/new">
                <Handshake className="h-4 w-4" /> Hire
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/projects/new">
                <FolderKanban className="h-4 w-4" /> Invite to Project
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={isSelf ? "/profile" : `${dashboardHref(viewer?.role)}/messages`}>
                <MessageSquare className="h-4 w-4" /> Send Message
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })}>
              View Portfolio <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {profile.bio && <AboutSection profile={profile} />}
      {domains.data && domains.data.length > 0 && <DomainsSection domains={domains.data} />}
      {skills.data && skills.data.length > 0 && <SkillsSection skills={skills.data} />}
      {portfolio.data && portfolio.data.length > 0 && <PortfolioSection projects={portfolio.data} />}
      {experience.data && experience.data.length > 0 && <ExperienceSection items={experience.data} />}
      <ReviewsSection summary={reviews.data ?? null} />
    </div>
  );
}
