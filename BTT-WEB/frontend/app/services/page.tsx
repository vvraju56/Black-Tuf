import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, LifeBuoy, MessagesSquare, Rocket } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { ServiceCard } from '@/components/services/ServiceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Reveal } from '@/components/ui/Motion';
import { JsonLd } from '@/components/ui/JsonLd';
import { getServices } from '@/lib/api';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Technology Services',
  description:
    'Software development, web development, application development, API and backend systems, AI and automation, and UI/UX development from BlackTuf Technologies.',
  path: '/services',
  keywords: [
    'software development',
    'web development',
    'application development',
    'API development',
    'AI automation',
    'UI UX',
  ],
});

const PROCESS = [
  {
    icon: MessagesSquare,
    title: 'Understand the problem',
    description:
      'Start with the workflow, the constraints, and the outcome that matters. No solution before the problem is clear.',
  },
  {
    icon: Rocket,
    title: 'Build the useful version',
    description:
      'Design the data model, interface, and release path together so the first version is genuinely usable.',
  },
  {
    icon: Check,
    title: 'Improve with real use',
    description:
      'Ship, observe, and refine. The roadmap follows evidence from how the product is actually used.',
  },
  {
    icon: LifeBuoy,
    title: 'Support what ships',
    description:
      'Documentation, support routes, and clear links so people can get help without guessing.',
  },
];

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'BlackTuf Technologies services',
            itemListElement: services.map((service, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: service.title,
              description: service.shortDescription,
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Technology Services"
        title={
          <>
            Engineering that turns an idea into <span className="text-gradient">something real.</span>
          </>
        }
        description="BlackTuf Technologies builds and maintains software products, web applications, backend systems, and automation. These are the areas we work in."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/contact" className="btn btn-primary group">
            Discuss a project
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link href="/products" className="btn btn-secondary">
            See our products
          </Link>
        </div>
      </PageHero>

      <section className="py-14 sm:py-16" aria-labelledby="services-list-title">
        <div className="container-page">
          <h2 id="services-list-title" className="sr-only">
            Services
          </h2>
          {services.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Reveal key={service.id} delay={index * 0.05} className="h-full">
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Services information is coming soon."
              description="The services catalogue is being prepared. In the meantime, you can get in touch directly."
              action={
                <Link href="/contact" className="btn btn-secondary">
                  Contact BlackTuf
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section className="border-y border-white/[0.06] py-16 sm:py-20" aria-labelledby="process-title">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="eyebrow mb-4">How we work</span>
            <h2
              id="process-title"
              className="text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl"
            >
              A practical process, not a pitch deck.
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-muted">
              The same approach applies whether the work is a new product, a focused feature, or a
              backend that needs to hold up.
            </p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={index * 0.05} className="bg-[#070709] p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-[0.66rem] font-semibold text-ink-faint">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[0.95rem] font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(59,130,246,0.06))] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.16), transparent 48%)',
              }}
              aria-hidden
            />
            <div className="relative mx-auto max-w-xl">
              <h2 className="text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                Have a problem worth solving?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Tell us what you are trying to build. We&apos;ll tell you honestly whether it fits
                what we do.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/contact" className="btn btn-primary">
                  Contact BlackTuf
                </Link>
                <Link href="/support" className="btn btn-secondary">
                  Get support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
