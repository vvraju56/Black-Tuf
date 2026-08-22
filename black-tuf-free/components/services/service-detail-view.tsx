"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FolderOpen,
  HelpCircle,
  Rocket,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import { EmptyState } from "@/components/empty-state";
import { ProjectCard, ProjectCardSkeleton } from "@/components/projects/project-card";
import { AuroraBackground } from "@/components/home/aurora-background";
import { useFeaturedProjects } from "@/hooks/use-browse-projects";
import { useActiveServices } from "@/hooks/use-services";
import { SERVICE_BY_ID } from "@/utils/constants";
import type { ServiceId } from "@/types";

const featuresByService: Record<string, string[]> = {
  web: ["Custom web applications & portals", "CMS and admin dashboards", "E-commerce & payments", "Cloud hosting & DevOps", "Performance & SEO optimization"],
  mobile: ["Native iOS & Android apps", "Cross-platform (React Native/Flutter)", "App store deployment", "Offline-first sync", "Push notifications & analytics"],
  uiux: ["User research & personas", "Wireframes & prototypes", "Design systems", "Brand identity", "Usability testing"],
  ai: ["Custom AI agents", "ML pipelines & models", "LLM integrations", "Document intelligence", "Predictive analytics"],
  game: ["2D & 3D game development", "Unity & Unreal engines", "Multiplayer backends", "AR/VR experiences", "Game art & animation"],
  iot: ["Connected device ecosystems", "Real-time monitoring dashboards", "Edge-to-cloud pipelines", "MQTT & protocols", "Device provisioning & security"],
  plc: ["PLC programming (Siemens, AB, Mitsubishi)", "HMI/SCADA development", "Control system design", "Commissioning & testing", "Retrofit & migration"],
  electrical: ["LV panel design & assembly", "Power distribution & wiring", "Load calculations & ETAP", "Lighting & earthing design", "On-site installation & commissioning"],
};

const faqByService: Record<string, { q: string; a: string }[]> = {
  web: [
    { q: "How long does a web project take?", a: "A typical marketing site takes 2–3 weeks, a portal or web app 4–10 weeks depending on scope. You'll agree exact milestones in the contract." },
    { q: "Do you handle hosting and deployment?", a: "Yes. Deployment, hosting setup, CI/CD and ongoing support are part of our delivery workflow." },
  ],
  mobile: [
    { q: "iOS and Android at the same time?", a: "We build native or cross-platform depending on your budget and needs — cross-platform is usually faster and cheaper to launch." },
  ],
  uiux: [
    { q: "Can you redesign an existing product?", a: "Absolutely. We start with research and audits before proposing a new design system." },
  ],
  ai: [
    { q: "Do I need my own data to use AI?", a: "Not necessarily. We can build with public data, your documents, or integrate existing AI APIs." },
  ],
  game: [
    { q: "Which platforms do you target?", a: "Mobile, web, desktop and consoles depending on the engine and scope agreed with you." },
  ],
  iot: [
    { q: "Can you work with my existing hardware?", a: "Yes. We integrate with ESP32, Raspberry Pi, PLCs and most industrial controllers." },
  ],
  plc: [
    { q: "Which PLC brands do you support?", a: "Siemens (TIA Portal), Allen Bradley (Studio 5000) and Mitsubishi (GX Works)." },
  ],
  electrical: [
    { q: "Is on-site work available?", a: "Yes — electrical and industrial projects often include on-site visits, which you can request from your project workspace." },
  ],
};

export function ServiceDetailView({ slug }: { slug: string }) {
  const { services } = useActiveServices();
  const service = services.find((s) => s.id === slug) ?? null;
  const staticService = SERVICE_BY_ID[slug as ServiceId];

  const { data: projects, isLoading } = useFeaturedProjects();
  const portfolio = (projects ?? []).filter((p) => p.service === slug);

  if (!service) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <h1 className="text-3xl font-bold">Service not found</h1>
        <p className="mt-3 text-muted-foreground">The service you're looking for doesn't exist.</p>
        <Button className="mt-6" variant="secondary" asChild>
          <Link href="/services">Browse services</Link>
        </Button>
      </div>
    );
  }

  const features = featuresByService[service.id] ?? [];
  const faqs = faqByService[service.id] ?? [];
  const Icon = service.icon;

  return (
    <div className="relative">
      <AuroraBackground className="opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="glass-card overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Icon className="h-3.5 w-3.5" /> {service.short}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                <span className="text-gradient">{service.title}</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="gradient" size="lg" asChild>
                  <Link href={`/request-quote?service=${service.id}`}>
                    Request this service <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/register">
                    <Rocket className="h-4 w-4" /> Post a Project
                  </Link>
                </Button>
              </div>
            </div>
            <div className="glass rounded-3xl p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Key features
              </h2>
              <ul className="space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/20">
                      <Check className="h-3 w-3 text-success" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="glass-card rounded-3xl p-6 lg:col-span-2">
            <SectionHeading
              align="left"
              eyebrow="Portfolio"
              title="Work in this discipline"
              className="mb-6"
            />
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
              </div>
            ) : portfolio.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {portfolio.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FolderOpen}
                title="No portfolio projects yet"
                description="Completed projects in this discipline will appear here."
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Wallet className="h-4 w-4" /> Pricing
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every {service.short} project is quoted individually. Share your
                requirements and receive a fixed-price quotation with clear
                milestones.
              </p>
              <Button className="mt-4 w-full" variant="secondary" asChild>
                <Link href={`/request-quote?service=${service.id}`}>Get a quotation</Link>
              </Button>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {(staticService?.technologies ?? []).map((t) => (
                  <span key={t} className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                    {t.trim()}
                  </span>
                ))}
                {!staticService?.technologies?.length && (
                  <p className="text-sm text-muted-foreground">
                    Technology stack is scoped per project during quoting.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Common questions"
            className="mb-6"
          />
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="glass-card rounded-2xl p-5 group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> {f.q}</span>
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
