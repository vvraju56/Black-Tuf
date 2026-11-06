import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Compass,
  Github,
  Globe2,
  Layers,
  Linkedin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wrench,
} from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Motion';
import { JsonLd } from '@/components/ui/JsonLd';
import { getAllProducts, getServices, getSiteSettings } from '@/lib/api';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'About BlackTuf Technologies',
  description:
    'BlackTuf Technologies is a technology-focused enterprise building software products, digital platforms, developer tools, and technology solutions.',
  path: '/about',
  keywords: ['BlackTuf Technologies', 'about', 'software company', 'technology enterprise'],
});

const PRINCIPLES = [
  {
    icon: Target,
    title: 'Build with purpose',
    description:
      'Every product starts with a real problem worth solving. Features follow the problem, not the other way around.',
  },
  {
    icon: Wrench,
    title: 'Keep technology practical',
    description:
      'Choose tools that fit the work and can be maintained after launch. Simplicity is an engineering decision.',
  },
  {
    icon: Users,
    title: 'Focus on users',
    description:
      'Clear language, sensible defaults, and paths that do not require a manual to understand.',
  },
  {
    icon: RefreshCw,
    title: 'Continuous improvement',
    description:
      'Ship the useful version, learn from real use, and make the next version meaningfully better.',
  },
  {
    icon: ShieldCheck,
    title: 'Security and reliability',
    description:
      'Validate input, protect credentials, and design for failure where the consequences matter.',
  },
  {
    icon: Sparkles,
    title: 'Simple experiences',
    description:
      'Reduce noise. Keep the important interaction obvious and everything else out of the way.',
  },
];

export default async function AboutPage() {
  const [settings, products, services] = await Promise.all([
    getSiteSettings(),
    getAllProducts(),
    getServices(),
  ]);

  const business = settings.business;
  const socials = [
    settings.socialWebsite
      ? { href: settings.socialWebsite, label: 'Website', icon: Globe2 }
      : null,
    settings.socialGithub ? { href: settings.socialGithub, label: 'GitHub', icon: Github } : null,
    settings.socialLinkedin
      ? { href: settings.socialLinkedin, label: 'LinkedIn', icon: Linkedin }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: typeof Globe2 }[];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
      <PageHero
        eyebrow="About BlackTuf Technologies"
        title={
          <>
            A technology company built around <span className="text-gradient">useful software.</span>
          </>
        }
        description="BlackTuf Technologies is a technology-focused enterprise building software products, digital platforms, developer tools, and technology solutions."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      <section className="py-14 sm:py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow mb-4">Who we are</span>
            <h2 className="text-balance font-display text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-4xl">
              Independent, product-led, and deliberate about what we ship.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="article-body">
              <p>
                BlackTuf Technologies builds and operates its own software products and takes on
                focused technology work. The company is an independent, product-led enterprise
                rather than an agency presenting a portfolio of other people&apos;s work.
              </p>
              <p>
                This website is the central directory for every product we publish. Each product
                has a dedicated page, a configured status, and links to wherever it lives. The
                catalogue is stored in a database, so a new product appears across the site as soon
                as it is published — without a redesign.
              </p>
              <p>
                We publish only what is real: no invented customers, awards, usage numbers, or
                certifications. Where information does not exist yet, the site says so.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn btn-primary group">
                Explore products
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
              <Link href="/services" className="btn btn-secondary">
                Our services
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/[0.06] py-14 sm:py-16" aria-labelledby="what-we-build">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow mb-4">What we build</span>
            <h2
              id="what-we-build"
              className="text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl"
            >
              Products first, services in support of them.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
              The catalogue is the clearest picture of what we do. Services describe the engineering
              behind it.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Reveal className="h-full">
              <Link
                href="/products"
                className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-all duration-300 hover:border-accent/25 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.07] text-accent">
                    <Layers className="h-5 w-5" aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-white/20 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">
                  Software products
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Web platforms, mobile applications, and developer tools built and operated by
                  BlackTuf.
                </p>
                <p className="mt-5 text-[0.72rem] font-medium text-accent-soft">
                  {products.length
                    ? `${products.length} published ${products.length === 1 ? 'product' : 'products'}`
                    : 'Catalogue coming soon'}
                </p>
              </Link>
            </Reveal>

            <Reveal delay={0.06} className="h-full">
              <Link
                href="/services"
                className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-all duration-300 hover:border-accent/25 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.07] text-accent">
                    <Compass className="h-5 w-5" aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-white/20 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">
                  Technology services
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Web and application development, APIs and backends, AI automation, and interface
                  engineering.
                </p>
                <p className="mt-5 text-[0.72rem] font-medium text-accent-soft">
                  {services.length
                    ? `${services.length} service ${services.length === 1 ? 'area' : 'areas'}`
                    : 'Services coming soon'}
                </p>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20" aria-labelledby="approach-title">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow mb-4">Our approach</span>
            <h2
              id="approach-title"
              className="text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl"
            >
              Principles before promises.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
              How we decide what to build and how to build it.
            </p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {PRINCIPLES.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <Reveal
                  key={principle.title}
                  delay={index * 0.04}
                  className="bg-[#070709] p-6 transition-colors hover:bg-[#0a0a0f]"
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

      {business.showBusinessInfo ? (
        <section className="border-t border-white/[0.06] py-14 sm:py-16" aria-labelledby="business-info">
          <div className="container-page">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <span className="eyebrow mb-4">Business Information</span>
                <h2
                  id="business-info"
                  className="text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white"
                >
                  Company registration details
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                  Only non-sensitive official information is published here.
                </p>
              </div>
              <div>
                <dl className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-2">
                  {[
                    {
                      icon: Building2,
                      label: 'Enterprise',
                      value: business.enterpriseName || settings.companyName,
                    },
                    { icon: Layers, label: 'Business type', value: business.businessType },
                    { icon: Compass, label: 'Major activity', value: business.majorActivity },
                    { icon: Wrench, label: 'Industry', value: business.industry },
                  ]
                    .filter((item) => Boolean(item.value))
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="bg-[#070709] p-5">
                          <dt className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                            <Icon className="h-3.5 w-3.5 text-accent/80" aria-hidden />
                            {item.label}
                          </dt>
                          <dd className="mt-2 text-sm font-medium leading-snug text-white">
                            {item.value}
                          </dd>
                        </div>
                      );
                    })}
                </dl>
                {business.registrationNote ? (
                  <p className="mt-3 text-[0.7rem] leading-relaxed text-ink-faint">
                    {business.registrationNote}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {socials.length ? (
        <section className="border-t border-white/[0.06] py-12">
          <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-xl font-semibold text-white">Find us online</h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                Links configured for the company. Support is handled at{' '}
                <span className="text-white">{settings.supportHandle}</span>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[0.8rem] text-ink-muted transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-accent" aria-hidden />
                    {social.label}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,121,238,0.06))] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(255,121,238,0.16), transparent 48%)',
              }}
              aria-hidden
            />
            <div className="relative mx-auto max-w-xl">
              <h2 className="text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                Have an idea? Let&apos;s build it.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Explore what already exists, or start a conversation about what comes next.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/products" className="btn btn-primary">
                  Explore Products
                </Link>
                <Link href="/contact" className="btn btn-secondary">
                  Contact BlackTuf
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
