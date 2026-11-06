import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DocSections } from '@/components/docs/DocBlocks';
import {
  DocPager,
  DocTableOfContents,
  DocsBreadcrumb,
  DocsMobileNav,
  DocsSidebar,
} from '@/components/docs/DocsChrome';
import { DocsSearch } from '@/components/docs/DocsSearch';
import { JsonLd } from '@/components/ui/JsonLd';
import { DOC_PAGES, getDocPage } from '@/lib/docs';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return DOC_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocPage(slug);

  if (!page) {
    return createMetadata({
      title: 'Documentation page not found',
      description: 'This documentation page does not exist.',
      path: `/docs/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${page.title} — Documentation`,
    description: page.description,
    path: `/docs/${page.slug}`,
    type: 'article',
    keywords: ['BlackTuf docs', page.title, page.group],
  });
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) notFound();

  const index = DOC_PAGES.findIndex((entry) => entry.slug === page.slug);
  const previous = index > 0 ? DOC_PAGES[index - 1] : null;
  const next = index >= 0 && index < DOC_PAGES.length - 1 ? DOC_PAGES[index + 1] : null;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Documentation', path: '/docs' },
            { name: page.title, path: `/docs/${page.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: page.title,
            description: page.description,
            articleSection: page.group,
            url: `https://blacktuf.com/docs/${page.slug}`,
            publisher: {
              '@type': 'Organization',
              name: 'BlackTuf Technologies',
              url: 'https://blacktuf.com',
            },
          },
        ]}
      />

      <div className="container-page py-10 sm:py-14">
        <DocsBreadcrumb page={page} />
        <DocsMobileNav activeSlug={page.slug} />

        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)_12rem] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <DocsSidebar activeSlug={page.slug} />
            </div>
          </aside>

          <article className="min-w-0">
            <header className="border-b border-white/[0.07] pb-8">
              <span className="eyebrow mb-3">{page.eyebrow}</span>
              <h1 className="text-balance font-display text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-4xl">
                {page.title}
              </h1>
              <p className="mt-4 max-w-2xl text-[0.96rem] leading-relaxed text-ink-muted">
                {page.description}
              </p>
            </header>

            <div className="mt-9">
              <DocSections sections={page.sections} />
            </div>

            <DocPager slug={page.slug} />

            <nav
              aria-label="Documentation quick actions"
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/docs" className="btn btn-secondary">
                <ArrowLeft className="h-4 w-4" aria-hidden /> All documentation
              </Link>
              <Link href="/support" className="btn btn-secondary">
                Get support <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </nav>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <DocTableOfContents page={page} />
              <DocsSearch compact />
              {previous ? (
                <Link
                  href={`/docs/${previous.slug}`}
                  className="block rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-[0.76rem] text-ink-muted transition-colors hover:border-accent/25 hover:text-white"
                >
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Previous
                  </span>
                  <span className="mt-1 block font-medium">{previous.title}</span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={`/docs/${next.slug}`}
                  className="block rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-[0.76rem] text-ink-muted transition-colors hover:border-accent/25 hover:text-white"
                >
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                    Next
                  </span>
                  <span className="mt-1 block font-medium">{next.title}</span>
                </Link>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
