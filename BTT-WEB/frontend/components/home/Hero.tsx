import Link from 'next/link';
import { ArrowRight, BookOpen, Boxes, LifeBuoy, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/ui/Motion';
import type { Product } from '@/lib/types';
import { HeroVisual } from './HeroVisual';

export function Hero({ products }: { products: Product[] }) {
  return (
    <section className="relative overflow-hidden pb-20 pt-14 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-[size:72px_72px] opacity-[0.22] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]"
        aria-hidden
      />
      <div
        className="glow-orb absolute -right-24 top-4 h-80 w-80 opacity-50 sm:h-96 sm:w-96"
        aria-hidden
      />
      <div
        className="glow-orb absolute -left-40 top-1/2 h-72 w-72 opacity-25"
        aria-hidden
      />

      <div className="container-page relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 xl:gap-16">
          <div>
            <Reveal y={14}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.09] bg-white/[0.035] py-1.5 pl-2 pr-3.5 backdrop-blur">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Sparkles className="h-3 w-3" aria-hidden />
                </span>
                <span className="text-[0.68rem] font-medium tracking-[0.02em] text-ink-muted">
                  Software products & technology services
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-7 max-w-2xl text-balance font-display text-[2.65rem] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.15rem]">
                Building Technology That{' '}
                <span className="text-gradient">Moves Ideas Forward.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-[1.05rem]">
                BlackTuf Technologies builds modern software products, digital platforms,
                developer tools, and technology solutions designed to solve real-world problems.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/products" className="btn btn-primary group">
                  Explore Products
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link href="/about" className="btn btn-secondary">
                  About BlackTuf
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.06] pt-6 text-[0.72rem] text-ink-faint">
                <span className="inline-flex items-center gap-2">
                  <Boxes className="h-3.5 w-3.5 text-accent/80" aria-hidden />
                  One product directory
                </span>
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-accent/80" aria-hidden />
                  Documentation
                </span>
                <span className="inline-flex items-center gap-2">
                  <LifeBuoy className="h-3.5 w-3.5 text-accent/80" aria-hidden />
                  Support at @blacktuftech
                </span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={26}>
            <HeroVisual products={products} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
