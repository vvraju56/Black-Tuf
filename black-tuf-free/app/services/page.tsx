import { PublicShell } from "@/features/site/shell";
import { SectionHeading } from "@/components/site/section-heading";
import { AuroraBackground } from "@/components/home/aurora-background";
import { ServicesGrid } from "@/components/services/services-grid";

export default function ServicesPage() {
  return (
    <PublicShell>
      <section className="relative overflow-hidden">
        <AuroraBackground className="opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <SectionHeading
            eyebrow="Services"
            title="Engineering Digital & Industrial Solutions"
            description="Eight specialist disciplines. One accountable marketplace. Every engagement is scoped, quoted and delivered through a transparent Black Tuf workflow."
          />
          <ServicesGrid />
        </div>
      </section>
    </PublicShell>
  );
}
