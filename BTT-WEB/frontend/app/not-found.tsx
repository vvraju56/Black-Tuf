import Link from 'next/link';
import { ArrowRight, Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-[size:64px_64px] opacity-[0.14] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        aria-hidden
      />
      <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-display text-[5rem] font-semibold leading-none tracking-[-0.08em] text-white/10 sm:text-[7rem]">
            404
          </span>
          <span className="eyebrow -mt-4 mb-4 justify-center">Page not found</span>
          <h1 className="text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
            This page doesn&apos;t exist.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-muted">
            The link may be outdated, or the page may have moved. Try the product directory, or head
            back home.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              <Home className="h-4 w-4" aria-hidden /> Back home
            </Link>
            <Link href="/products" className="btn btn-secondary">
              <Compass className="h-4 w-4" aria-hidden /> Browse products
            </Link>
          </div>
          <p className="mt-7 inline-flex items-center gap-2 text-[0.78rem] text-ink-faint">
            <Search className="h-3.5 w-3.5" aria-hidden />
            Tip: press{' '}
            <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.68rem] text-ink-muted">
              Ctrl
            </kbd>{' '}
            +{' '}
            <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.68rem] text-ink-muted">
              K
            </kbd>{' '}
            to search the whole site.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-[0.78rem] text-ink-muted">
            <Link href="/support" className="inline-flex items-center gap-1 hover:text-accent-soft">
              Support <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
            <Link href="/docs" className="inline-flex items-center gap-1 hover:text-accent-soft">
              Documentation <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-1 hover:text-accent-soft">
              Contact <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
