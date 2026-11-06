'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Search, X } from 'lucide-react';
import { DOC_PAGES, docText } from '@/lib/docs';
import { cn } from '@/lib/utils';

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function DocsSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return DOC_PAGES.filter((page) => normalize(docText(page)).includes(q)).slice(0, 8);
  }, [query]);

  return (
    <div className={cn('relative', compact ? '' : 'mx-auto w-full max-w-xl')}>
      <label className="relative flex items-center">
        <span className="sr-only">Search documentation</span>
        <Search
          className="pointer-events-none absolute left-4 h-4 w-4 text-ink-faint"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search documentation…"
          className="field h-12 pl-11 pr-11 text-[0.9rem]"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear documentation search"
            className="absolute right-3 rounded-md p-1.5 text-ink-faint transition-colors hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </label>

      {query ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0b0b10] shadow-2xl shadow-black/60">
          {results.length ? (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {results.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/docs/${page.slug}`}
                    onClick={() => setQuery('')}
                    className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent/80" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.84rem] font-medium text-white group-hover:text-accent-soft">
                        {page.title}
                      </span>
                      <span className="mt-0.5 block line-clamp-2 text-[0.74rem] leading-relaxed text-ink-muted">
                        {page.description}
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-accent"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-[0.82rem] text-ink-muted">
              No documentation matches “{query}”.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
