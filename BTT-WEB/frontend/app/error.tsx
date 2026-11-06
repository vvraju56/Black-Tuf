'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface unexpected client errors in the browser console for debugging.
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/25 bg-red-400/[0.08] text-red-300">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
            Something went wrong.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-muted">
            An unexpected error stopped this page from loading. You can try again, or go back home.
            If it keeps happening, please let us know.
          </p>
          {error.digest ? (
            <p className="mt-4 font-mono text-[0.68rem] text-ink-faint">Reference: {error.digest}</p>
          ) : null}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="btn btn-primary">
              <RefreshCw className="h-4 w-4" aria-hidden /> Try again
            </button>
            <Link href="/" className="btn btn-secondary">
              <Home className="h-4 w-4" aria-hidden /> Back home
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Report the problem
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
