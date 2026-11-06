import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Code2, Compass, HelpCircle, Layers, LifeBuoy } from 'lucide-react';
import { DocsSearch } from '@/components/docs/DocsSearch';
import { DocsBreadcrumb, DocsSidebar, docGroups } from '@/components/docs/DocsChrome';
import { JsonLd } from '@/components/ui/JsonLd';
import { PageHero } from '@/components/ui/PageHero';
import { DOC_PAGES } from '@/lib/docs';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Documentation',
  description:
    'Documentation for the BlackTuf Technologies product hub: getting started, products, guides, API reference, FAQs, and troubleshooting.',
  path: '/docs',
  keywords: ['BlackTuf documentation', 'product docs', 'API reference', 'guides'],
});

const GROUP_ICONS: Record<string, typeof BookOpen> = {
  'Start here': Compass,
  Platform: Layers,
  Reference: Code2,
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  'Start here': 'What this site is, how the product directory works, and where to begin.',
  Platform: 'Practical guides for support routes, bug reports, and feature requests.',
  Reference: 'API endpoints, frequently asked questions, troubleshooting, and release notes.',
};

export default function DocsPage() {
  const groups = docGroups();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Documentation', path: '/docs' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'BlackTuf Documentation',
            description:
              'Documentation for the BlackTuf Technologies product hub and public API.',
            url: 'https://blacktuf.com/docs',
            hasPart: DOC_PAGES.map((page) => ({
              '@type': 'TechArticle',
              headline: page.title,
              description: page.description,
              url: `https://blacktuf.com/docs/${page.slug}`,
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Documentation"
        title={
          <>
            Everything you need to <span className="text-gradient">use this platform.</span>
          </>
        }
        description="Guides for the product hub, support routes, and the public API. Product-specific documentation is linked from each product page."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Documentation' }]}
      >
        <div className="mt-2 w-full">
          <DocsSearch />
        </div>
      </PageHero>

      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <DocsSidebar />
            </div>
          </aside>

          <div className="min-w-0">
            <DocsBreadcrumb />

            <div className="space-y-10">
              {groups.map((group) => {
                const Icon = GROUP_ICONS[group.group] || BookOpen;
                return (
                  <section key={group.group} aria-labelledby={`group-${group.group}`}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div>
                        <h2
                          id={`group-${group.group}`}
                          className="font-display text-xl font-semibold tracking-[-0.03em] text-white"
                        >
                          {group.group}
                        </h2>
                        <p className="text-[0.78rem] text-ink-muted">
                          {GROUP_DESCRIPTIONS[group.group]}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {group.items.map((item) => {
                        const page = DOC_PAGES.find((entry) => `/docs/${entry.slug}` === item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="group flex h-full flex-col rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white/[0.04]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[0.88rem] font-semibold text-white group-hover:text-accent-soft">
                                  {item.label}
                                </span>
                                <ArrowRight
                                  className="h-3.5 w-3.5 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                                  aria-hidden
                                />
                              </div>
                              {page ? (
                                <span className="mt-1 line-clamp-2 text-[0.78rem] leading-relaxed text-ink-muted">
                                  {page.description}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              <Link
                href="/support"
                className="group flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:border-accent/25 hover:bg-white/[0.04]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
                  <LifeBuoy className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.88rem] font-semibold text-white">
                    Need product support?
                  </span>
                  <span className="mt-0.5 block text-[0.78rem] leading-relaxed text-ink-muted">
                    Open a support request for a specific product.
                  </span>
                </span>
              </Link>
              <Link
                href="/contact"
                className="group flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:border-accent/25 hover:bg-white/[0.04]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
                  <HelpCircle className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.88rem] font-semibold text-white">
                    Something not covered?
                  </span>
                  <span className="mt-0.5 block text-[0.78rem] leading-relaxed text-ink-muted">
                    Send a general question to the BlackTuf team.
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
