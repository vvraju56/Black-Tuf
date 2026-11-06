import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  Globe2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Wrench,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Motion';
import type { Product, ProductUpdate } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function Capabilities({ products }: { products: Product[] }) {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const technology of product.technologies) {
      counts.set(technology.name, (counts.get(technology.name) || 0) + 1);
    }
  }
  const technologies = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name)
    .slice(0, 16);

  if (!technologies.length) return null;

  const capabilities = [
    {
      icon: Globe2,
      title: 'Web products',
      text: 'Server-rendered interfaces, product hubs, and responsive web applications.',
    },
    {
      icon: Smartphone,
      title: 'Mobile applications',
      text: 'Android experiences with native playback, local-first data, and media controls.',
    },
    {
      icon: Code2,
      title: 'APIs & backends',
      text: 'REST services, authentication, data modelling, and validation.',
    },
    {
      icon: Bot,
      title: 'AI & automation',
      text: 'Agent workflows and tool integrations that handle repetitive conversations.',
    },
  ];

  return (
    <section className="relative border-y border-white/[0.06] py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 60%, rgba(255,121,238,0.055), transparent 38%)',
        }}
        aria-hidden
      />
      <div className="container-page relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Technology & capabilities"
            title="The stack is shaped by the products."
            description="These are the technologies configured across current BlackTuf products — not a list of everything that exists."
          />
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-lg border border-white/[0.09] bg-white/[0.035] px-3 py-1.5 text-[0.76rem] font-medium text-ink-muted transition-colors hover:border-accent/25 hover:text-white"
                >
                  {technology}
                </span>
              ))}
            </div>
            <p className="mt-5 text-[0.72rem] text-ink-faint">
              Technology tags come directly from each product&apos;s configuration.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <Reveal key={capability.title} delay={index * 0.06} className="h-full">
                <div className="group h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:border-accent/25 hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-accent">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{capability.title}</h3>
                  <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-muted">
                    {capability.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const PRINCIPLES = [
  {
    icon: Target,
    title: 'Build with purpose',
    description: 'Every product starts with a real problem worth solving, not a feature checklist.',
  },
  {
    icon: Wrench,
    title: 'Keep technology practical',
    description: 'Choose tools that fit the work and can be maintained after launch.',
  },
  {
    icon: Users,
    title: 'Focus on users',
    description: 'Clear language, sensible defaults, and paths that do not need a manual.',
  },
  {
    icon: RefreshCw,
    title: 'Continuous improvement',
    description: 'Ship the useful version, learn from real use, then make it better.',
  },
  {
    icon: ShieldCheck,
    title: 'Security and reliability',
    description: 'Validate input, protect credentials, and design for failure where it matters.',
  },
  {
    icon: Sparkles,
    title: 'Simple experiences',
    description: 'Reduce noise. Keep the important interaction obvious and the rest out of the way.',
  },
];

export function WhyBlackTuf() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why BlackTuf"
          title="Principles before promises."
          description="How we approach the products and the engineering behind them."
        />
        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <Reveal
                key={principle.title}
                delay={index * 0.04}
                className="group bg-[#070709] p-6 transition-colors hover:bg-[#0a0a0f]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/15 bg-accent/[0.06] text-accent">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <h3 className="text-[0.95rem] font-semibold text-white">{principle.title}</h3>
                </div>
                <p className="mt-3 text-[0.84rem] leading-relaxed text-ink-muted">
                  {principle.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LatestUpdates({ updates }: { updates: ProductUpdate[] }) {
  if (!updates.length) return null;
  const hasChangelog = updates.some((update) => update.isChangelog);

  return (
    <section className="border-t border-white/[0.06] py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow={hasChangelog ? 'Latest product updates' : 'Recently added'}
          title={hasChangelog ? 'What changed, from the source.' : 'New in the product directory.'}
          description={
            hasChangelog
              ? 'Release notes are shown only when a product has real changelog data configured.'
              : 'The newest products added to the BlackTuf catalogue.'
          }
          action={
            hasChangelog ? (
              <Link
                href="/docs/changelog"
                className="group inline-flex items-center gap-2 text-sm font-medium text-accent-soft transition-colors hover:text-white"
              >
                Platform changelog
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ) : undefined
          }
        />
        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          {updates.map((update, index) => (
            <Reveal key={update.id} delay={index * 0.05}>
              <Link
                href={`/products/${update.productSlug}`}
                className="group flex items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:border-accent/25 hover:bg-white/[0.04]"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <p className="text-sm font-semibold text-white">{update.productName}</p>
                    {update.version ? (
                      <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.62rem] font-medium text-ink-muted">
                        v{update.version}
                      </span>
                    ) : null}
                    {update.releaseDate ? (
                      <span className="text-[0.66rem] text-ink-faint">
                        {formatDate(update.releaseDate)}
                      </span>
                    ) : null}
                  </div>
                  {update.isChangelog && update.notes.length ? (
                    <ul className="mt-2 space-y-1">
                      {update.notes.slice(0, 3).map((note) => (
                        <li
                          key={note}
                          className="flex items-start gap-1.5 text-[0.78rem] leading-relaxed text-ink-muted"
                        >
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent/70" aria-hidden />
                          {note}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-[0.78rem] text-ink-muted">
                      Added to the product directory. Open the product for details.
                    </p>
                  )}
                </div>
                <ArrowRight
                  className="mt-1 h-4 w-4 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeCTA() {
  return (
    <section className="pb-24 pt-8 sm:pb-28">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,121,238,0.06))] px-6 py-14 text-center sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(255,121,238,0.18), transparent 45%)',
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-grid-fade bg-[size:52px_52px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl">
              <span className="eyebrow mb-5 justify-center">Start a conversation</span>
              <h2 className="text-balance font-display text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">
                Have an idea? <span className="text-gradient">Let&apos;s build it.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
                Explore what we have already built, or tell us what you are trying to make.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/products" className="btn btn-primary group">
                  Explore Products
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  Contact BlackTuf
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
