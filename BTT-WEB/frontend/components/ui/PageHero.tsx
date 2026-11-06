import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-[0.76rem] text-ink-faint', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight className="h-3 w-3 text-white/20" aria-hidden /> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="rounded transition-colors hover:text-accent-soft focus-visible:text-accent-soft"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  breadcrumbs,
  align = 'left',
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  align?: 'left' | 'center';
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] pb-16 pt-14 sm:pb-20 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-grid-fade bg-[size:64px_64px] opacity-[0.18] [mask-image:radial-gradient(ellipse_at_top,black,transparent_68%)]" aria-hidden />
      <div
        className="glow-orb pointer-events-none absolute -right-20 -top-24 h-72 w-72 opacity-50"
        aria-hidden
      />
      <div className="container-page relative">
        {breadcrumbs ? (
          <Breadcrumbs items={breadcrumbs} className="mb-8" />
        ) : null}
        <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
          <span className={cn('eyebrow mb-5', align === 'center' && 'justify-center')}>
            {eyebrow}
          </span>
          <h1 className="text-balance text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
