import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Package } from 'lucide-react';
import { DOC_PAGES, getDocNav, getDocNeighbours, type DocPage } from '@/lib/docs';
import { cn } from '@/lib/utils';

export function DocsSidebar({ activeSlug }: { activeSlug?: string }) {
  const nav = getDocNav();
  return (
    <nav aria-label="Documentation navigation" className="space-y-6">
      {nav.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            {group.group}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = activeSlug === item.href.replace('/docs/', '');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-lg px-2 py-1.5 text-[0.82rem] transition-colors',
                      active
                        ? 'bg-accent/10 font-medium text-accent-soft'
                        : 'text-ink-muted hover:bg-white/[0.04] hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="border-t border-white/[0.07] pt-5">
        <p className="mb-2 px-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Product pages
        </p>
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.82rem] text-ink-muted transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <Package className="h-3.5 w-3.5 text-accent/70" aria-hidden />
          Browse products
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.82rem] text-ink-muted transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <BookOpen className="h-3.5 w-3.5 text-accent/70" aria-hidden />
          Get support
        </Link>
      </div>
    </nav>
  );
}

export function DocsMobileNav({ activeSlug }: { activeSlug?: string }) {
  return (
    <details className="mb-8 rounded-xl border border-white/[0.08] bg-white/[0.025] lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">
        Documentation menu
        <span aria-hidden className="text-ink-faint">
          ▾
        </span>
      </summary>
      <div className="border-t border-white/[0.07] px-3 py-3">
        <DocsSidebar activeSlug={activeSlug} />
      </div>
    </details>
  );
}

export function DocPager({ slug }: { slug: string }) {
  const { previous, next } = getDocNeighbours(slug);
  if (!previous && !next) return null;

  return (
    <nav aria-label="Documentation pagination" className="mt-14 grid gap-3 border-t border-white/[0.07] pt-6 sm:grid-cols-2">
      {previous ? (
        <Link
          href={`/docs/${previous.slug}`}
          className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-colors hover:border-accent/25 hover:bg-white/[0.04]"
        >
          <span className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            <ArrowLeft className="h-3 w-3" aria-hidden /> Previous
          </span>
          <span className="mt-1 text-[0.86rem] font-medium text-white group-hover:text-accent-soft">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-right transition-colors hover:border-accent/25 hover:bg-white/[0.04] sm:col-start-2"
        >
          <span className="flex items-center justify-end gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Next <ArrowRight className="h-3 w-3" aria-hidden />
          </span>
          <span className="mt-1 text-[0.86rem] font-medium text-white group-hover:text-accent-soft">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}

export function DocTableOfContents({ page }: { page: DocPage }) {
  if (!page.sections.length) return null;
  return (
    <nav aria-label="On this page" className="sticky top-28">
      <p className="mb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-white/[0.08]">
        {page.sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="-ml-px block border-l border-transparent py-1 pl-3 text-[0.78rem] text-ink-muted transition-colors hover:border-accent/60 hover:text-white"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DocsBreadcrumb({ page }: { page?: DocPage }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-[0.72rem] text-ink-faint">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-accent-soft">
            Home
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link href="/docs" className="hover:text-accent-soft">
            Documentation
          </Link>
        </li>
        {page ? (
          <>
            <li aria-hidden>/</li>
            <li className="text-ink-muted">{page.title}</li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

export function docGroups() {
  return getDocNav();
}

export const DOC_COUNT = DOC_PAGES.length;
