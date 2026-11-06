'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  CornerDownLeft,
  FileText,
  Search,
  Wrench,
} from 'lucide-react';
import type { Product, Service } from '@/lib/types';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';

export interface SearchDoc {
  title: string;
  slug: string;
  description: string;
  keywords: string;
}

type ResultGroup = 'Products' | 'Documentation' | 'Services' | 'Pages';

interface SearchResult {
  id: string;
  group: ResultGroup;
  title: string;
  subtitle: string;
  href: string;
  searchText: string;
  icon: React.ReactNode;
}

const PAGES: { title: string; subtitle: string; href: string; keywords: string }[] = [
  { title: 'Home', subtitle: 'BlackTuf Technologies', href: '/', keywords: 'home start company blacktuf' },
  { title: 'Products', subtitle: 'All BlackTuf products', href: '/products', keywords: 'products catalogue directory software apps' },
  { title: 'Services', subtitle: 'Technology services', href: '/services', keywords: 'services development web app api ai ui ux backend' },
  { title: 'About', subtitle: 'About BlackTuf Technologies', href: '/about', keywords: 'about company business information' },
  { title: 'Documentation', subtitle: 'Guides and reference', href: '/docs', keywords: 'docs documentation guides api reference' },
  { title: 'Support', subtitle: 'Get help with a product', href: '/support', keywords: 'support help bug report feature request account' },
  { title: 'Contact', subtitle: 'Start a conversation', href: '/contact', keywords: 'contact email message project enquiry' },
  { title: 'Privacy', subtitle: 'Privacy policy', href: '/privacy', keywords: 'privacy data cookies legal' },
  { title: 'Terms', subtitle: 'Terms of use', href: '/terms', keywords: 'terms legal conditions' },
  { title: 'Cookies', subtitle: 'Cookie policy', href: '/cookies', keywords: 'cookies tracking analytics legal' },
];

const GROUP_ICONS: Record<ResultGroup, React.ReactNode> = {
  Products: <Boxes className="h-4 w-4" aria-hidden />,
  Documentation: <BookOpen className="h-4 w-4" aria-hidden />,
  Services: <Wrench className="h-4 w-4" aria-hidden />,
  Pages: <FileText className="h-4 w-4" aria-hidden />,
};

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function CommandPalette({
  open,
  onOpenChange,
  products,
  services,
  docs,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  services: Service[];
  docs: SearchDoc[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    previousFocus.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      previousFocus.current?.focus?.();
    };
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = normalize(query);
    const matches = (text: string) => !q || normalize(text).includes(q);

    const productResults: SearchResult[] = products
      .map((product) => {
        const searchText = [
          product.name,
          product.shortDescription,
          product.categoryName,
          product.status,
          ...product.technologies.map((tech) => tech.name),
          ...product.features.map((feature) => feature.title),
        ].join(' ');
        return {
          id: `product-${product.id}`,
          group: 'Products' as const,
          title: product.name,
          subtitle: `${product.categoryName} · ${product.status}`,
          href: `/products/${product.slug}`,
          searchText,
          icon: GROUP_ICONS.Products,
        };
      })
      .filter((item) => matches(item.searchText))
      .sort((a, b) => {
        const aStarts = normalize(a.title).startsWith(q) ? 0 : 1;
        const bStarts = normalize(b.title).startsWith(q) ? 0 : 1;
        return aStarts - bStarts;
      })
      .slice(0, q ? 5 : 4);

    const docResults: SearchResult[] = docs
      .map((doc) => ({
        id: `doc-${doc.slug}`,
        group: 'Documentation' as const,
        title: doc.title,
        subtitle: doc.description,
        href: `/docs/${doc.slug}`,
        searchText: `${doc.title} ${doc.description} ${doc.keywords}`,
        icon: GROUP_ICONS.Documentation,
      }))
      .filter((item) => matches(item.searchText))
      .slice(0, q ? 4 : 3);

    const serviceResults: SearchResult[] = services
      .map((service) => ({
        id: `service-${service.id}`,
        group: 'Services' as const,
        title: service.title,
        subtitle: service.shortDescription,
        href: `/services#${service.slug}`,
        searchText: `${service.title} ${service.shortDescription} ${service.features.join(' ')}`,
        icon: GROUP_ICONS.Services,
      }))
      .filter((item) => matches(item.searchText))
      .slice(0, q ? 4 : 2);

    const pageResults: SearchResult[] = PAGES.map((page) => ({
      id: `page-${page.href}`,
      group: 'Pages' as const,
      title: page.title,
      subtitle: page.subtitle,
      href: page.href,
      searchText: `${page.title} ${page.subtitle} ${page.keywords}`,
      icon: GROUP_ICONS.Pages,
    }))
      .filter((item) => matches(item.searchText))
      .slice(0, q ? 4 : 3);

    return [
      ...productResults,
      ...docResults,
      ...serviceResults,
      ...pageResults,
    ];
  }, [query, products, services, docs]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const selected = document.getElementById(`palette-result-${activeIndex}`);
    selected?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const grouped = useMemo(() => {
    const order: ResultGroup[] = ['Products', 'Documentation', 'Services', 'Pages'];
    return order
      .map((group) => ({ group, items: results.filter((item) => item.group === group) }))
      .filter((section) => section.items.length > 0);
  }, [results]);

  const close = () => onOpenChange(false);

  const go = (result: SearchResult) => {
    trackEvent(result.group === 'Products' ? 'product_click' : 'search_result_click', {
      group: result.group,
      title: result.title,
      href: result.href,
    });
    close();
    router.push(result.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        results.length ? (index - 1 + results.length) % results.length : 0
      );
      return;
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault();
      go(results[activeIndex]);
      return;
    }
    if (event.key === 'Tab') {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const list = Array.from(focusables).filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex >= 0
      );
      const first = list[0];
      const last = list[list.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center px-3 pt-[9vh] sm:px-4 sm:pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onKeyDown={handleKeyDown}
        >
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={close}
            tabIndex={-1}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="palette-title"
            aria-describedby="palette-description"
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/12 bg-[#0a0a0e]/95 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: -12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.22 }}
          >
            <h2 id="palette-title" className="sr-only">
              Search BlackTuf
            </h2>
            <p id="palette-description" className="sr-only">
              Search products, documentation, services, and pages. Use the arrow keys to navigate
              and Enter to open a result.
            </p>
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-5">
              <Search className="h-5 w-5 shrink-0 text-accent" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={
                  results[activeIndex] ? `palette-result-${activeIndex}` : undefined
                }
                autoComplete="off"
                spellCheck={false}
                placeholder="Search products, docs, services…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[0.98rem] text-white placeholder:text-ink-faint focus:outline-none"
              />
              <button
                type="button"
                onClick={close}
                className="hidden rounded-md border border-white/10 px-1.5 py-0.5 text-[0.64rem] font-medium text-ink-faint sm:block"
              >
                ESC
              </button>
            </div>

            <div
              id="palette-results"
              role="listbox"
              aria-label="Search results"
              className="max-h-[58vh] overflow-y-auto overscroll-contain p-2 sm:max-h-[60vh]"
            >
              {grouped.length ? (
                grouped.map((section) => (
                  <div key={section.group} className="mb-1.5 last:mb-0">
                    <p className="px-2.5 pb-1 pt-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                      {section.group}
                    </p>
                    {section.items.map((item) => {
                      const index = results.findIndex((result) => result.id === item.id);
                      const active = index === activeIndex;
                      return (
                        <button
                          key={item.id}
                          id={`palette-result-${index}`}
                          role="option"
                          aria-selected={active}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => go(item)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
                            active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                              active
                                ? 'border-accent/30 bg-accent/10 text-accent'
                                : 'border-white/10 bg-white/[0.03] text-ink-muted'
                            )}
                          >
                            {item.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white">
                              {item.title}
                            </span>
                            <span className="block truncate text-xs text-ink-faint">
                              {item.subtitle}
                            </span>
                          </span>
                          <ArrowRight
                            className={cn(
                              'h-4 w-4 shrink-0 transition-transform',
                              active ? 'translate-x-0 text-accent' : '-translate-x-1 text-white/20'
                            )}
                            aria-hidden
                          />
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <Search className="mb-3 h-6 w-6 text-ink-faint" aria-hidden />
                  <p className="text-sm font-medium text-white">No results for “{query}”</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    Try a product name, “documentation”, “support”, or “API”.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-2.5 text-[0.68rem] text-ink-faint">
              <span className="flex items-center gap-1.5">
                <CornerDownLeft className="h-3 w-3" aria-hidden /> open
                <span className="mx-1 text-white/15">·</span>
                <span aria-hidden>↑</span>
                <span aria-hidden>↓</span> navigate
              </span>
              <span className="hidden sm:inline">Search BlackTuf</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
