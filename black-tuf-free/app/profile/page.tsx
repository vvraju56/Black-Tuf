"use client";

import { useEffect } from "react";
import { ProfileShell } from "@/components/profile/profile-shell";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileCompletionCard } from "@/components/profile/profile-completion-card";
import { WorkStatusCard } from "@/components/profile/work-status-card";
import { AboutSection } from "@/components/profile/sections/about-section";
import { DomainsSection } from "@/components/profile/sections/domains-section";
import { SkillsSection } from "@/components/profile/sections/skills-section";
import { PortfolioSection } from "@/components/profile/sections/portfolio-section";
import { ExperienceSection } from "@/components/profile/sections/experience-section";
import { ReviewsSection } from "@/components/profile/sections/reviews-section";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import {
  useOwnProfile,
  useProfileCompletion,
  useProfileDomains,
  useProfileReviews,
  useMySkills,
  usePortfolioProjects,
  useExperience,
} from "@/hooks/use-profile";

export default function MyProfilePage() {
  const { user, loading } = useAuth();
  const id = user?.id ?? "";

  useRealtime(
    "profile",
    [
      { table: "profiles", queryKeys: [["profile-v2", "profile", id], ["profile-v2", "own-profile", id], ["profile", id]] },
      { table: "user_skills", queryKeys: [["profile-v2", "skills", id]] },
      { table: "profile_domains", queryKeys: [["profile-v2", "domains", id]] },
      { table: "portfolio_projects", queryKeys: [["profile-v2", "portfolio", id]] },
      { table: "experience", queryKeys: [["profile-v2", "experience", id]] },
    ]
  );

  useEffect(() => {
    if (!id) return;
    const ping = setInterval(async () => {
      try {
        await fetch("/api/profile/heartbeat");
      } catch {
        /* ignore */
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(ping);
  }, [id]);

  const profile = useOwnProfile(id);
  const completion = useProfileCompletion(id);
  const domains = useProfileDomains(id);
  const reviews = useProfileReviews(id);
  const skills = useMySkills();
  const portfolio = usePortfolioProjects(id);
  const experience = useExperience(id);

  if (loading) {
    return <ProfileShell><PageSkeleton /></ProfileShell>;
  }

  return (
    <ProfileShell>
      <div className="space-y-6">
        {profile.data ? (
          <ProfileHeader profile={profile.data} />
        ) : (
          <Skeleton className="h-72 w-full rounded-3xl" />
        )}

        <ProfileCompletionCard data={completion.data} loading={completion.isPending} />

        <WorkStatusCard />

        {profile.data && <AboutSection profile={profile.data} editable />}
        <DomainsSection domains={domains.data ?? []} editable />
        <SkillsSection skills={skills.data ?? []} editable />
        <PortfolioSection projects={portfolio.data ?? []} editable />
        <ExperienceSection items={experience.data ?? []} editable />
        <ReviewsSection summary={reviews.data ?? null} />
      </div>
    </ProfileShell>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-72 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-52 w-full rounded-2xl" />
    </div>
  );
}
