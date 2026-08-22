"use client";

import { useModuleFlags } from "@/hooks/use-modules";
import { HOMEPAGE_MODULES } from "@/utils/modules";
import { TrustStats } from "@/components/home/trust-stats";
import { PopularServices } from "@/components/home/categories";
import { HowItWorks } from "@/components/home/how-it-works";
import { WhyChoose } from "@/components/home/why-choose";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { TopEngineers } from "@/components/home/top-engineers";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import { CTASection } from "@/components/home/cta";

export function HomeSections() {
  const { data: flags } = useModuleFlags();
  const enabled = (section: string) => flags?.[HOMEPAGE_MODULES.find((h) => h.section === section)?.module as never] ?? true;

  return (
    <>
      <TrustStats />
      {enabled("PopularServices") && <PopularServices />}
      {enabled("HowItWorks") && <HowItWorks />}
      <WhyChoose />
      {enabled("FeaturedProjects") && <FeaturedProjects />}
      {enabled("TopEngineers") && <TopEngineers />}
      {enabled("Testimonials") && <Testimonials />}
      <FAQ />
      <CTASection />
    </>
  );
}
