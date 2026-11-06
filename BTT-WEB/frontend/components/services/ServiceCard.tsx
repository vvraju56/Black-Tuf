import { ArrowUpRight } from 'lucide-react';
import { getIcon } from '@/lib/icons';
import type { Service } from '@/lib/types';

export function ServiceCard({ service }: { service: Service }) {
  const Icon = getIcon(service.icon);
  return (
    <article
      id={service.slug}
      className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.028] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:bg-white/[0.045]"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.07] text-accent transition-all duration-300 group-hover:border-accent/40 group-hover:bg-accent/[0.12] group-hover:shadow-glow-sm">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-white/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold tracking-[-0.025em] text-white">
        {service.title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{service.shortDescription}</p>
      {service.features.length ? (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {service.features.slice(0, 4).map((feature) => (
            <li
              key={feature}
              className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[0.66rem] text-ink-faint"
            >
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
