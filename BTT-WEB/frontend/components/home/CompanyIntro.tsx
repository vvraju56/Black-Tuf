import Link from 'next/link';
import { ArrowRight, Building2, Layers3, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/ui/Motion';
import type { SiteSettings } from '@/lib/types';

export function CompanyIntro({ settings }: { settings: SiteSettings }) {
  const business = settings.business;
  const facts = [
    {
      icon: Building2,
      label: 'Enterprise',
      value: business.businessType || 'Micro Enterprise',
    },
    {
      icon: Layers3,
      label: 'Major activity',
      value: business.majorActivity || 'Services',
    },
    {
      icon: ShieldCheck,
      label: 'Industry',
      value: business.industry || 'Computer programming / consultancy',
    },
  ];

  return (
    <section className="relative border-y border-white/[0.06] py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 15% 20%, rgba(59,130,246,0.055), transparent 40%)',
        }}
        aria-hidden
      />
      <div className="container-page relative">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow mb-4">BlackTuf Technologies</span>
            <h2 className="text-balance font-display text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-4xl">
              An independent product company, built around useful software.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-xl text-pretty text-[0.98rem] leading-relaxed text-ink-muted">
              BlackTuf Technologies is a technology-focused enterprise building software products,
              digital platforms, and technology solutions. The work is practical by design: find a
              real problem, build the clearest useful version, and keep improving it.
            </p>
            <p className="mt-4 max-w-xl text-pretty text-[0.98rem] leading-relaxed text-ink-muted">
              This site is the central home for every product we publish — one directory, one
              standard for documentation and support, and one place to see what is being built.
            </p>
            <Link
              href="/about"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-soft transition-colors hover:text-white"
            >
              More about BlackTuf
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-3">
          {facts.map((fact, index) => {
            const Icon = fact.icon;
            return (
              <Reveal
                key={fact.label}
                delay={0.05 * index}
                className="bg-[#070709] px-5 py-6 sm:px-6"
              >
                <div className="flex items-center gap-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                  <Icon className="h-3.5 w-3.5 text-accent/80" aria-hidden />
                  {fact.label}
                </div>
                <p className="mt-2.5 text-sm font-medium leading-snug text-white">{fact.value}</p>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-3 text-[0.68rem] text-ink-faint">
          Business information is published only where appropriate and is based on official
          company registration details.
        </p>
      </div>
    </section>
  );
}
