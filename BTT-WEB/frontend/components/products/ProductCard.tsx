import { ArrowUpRight, Sparkles } from 'lucide-react';
import { TrackedLink } from '@/components/ui/TrackedLink';
import { ProductLogo } from '@/components/ui/ProductLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const keyFeature =
    product.features[0]?.title ||
    product.technologies[0]?.name ||
    'Product details';

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(165deg,rgba(255,255,255,0.055),rgba(255,255,255,0.022)_52%,rgba(255,121,238,0.025))] shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-glow',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <ProductLogo
          name={product.name}
          src={product.logo}
          className="h-14 w-14 rounded-2xl"
          priority={priority}
        />
        <StatusBadge status={product.status} />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-0 sm:px-6">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-accent-soft/80">
          {product.categoryName}
        </p>
        <h3 className="mt-2.5 font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.035em] text-white">
          <TrackedLink
            href={`/products/${product.slug}`}
            event="product_click"
            params={{ product: product.slug, source: 'product_card' }}
            className="rounded-sm after:absolute after:inset-0 after:z-10 after:content-['']"
          >
            {product.name}
          </TrackedLink>
        </h3>
        <p className="mt-2.5 line-clamp-3 text-[0.875rem] leading-relaxed text-ink-muted">
          {product.shortDescription}
        </p>
        <div className="mt-auto pt-5">
          <p className="flex items-center gap-2 text-[0.73rem] font-medium text-ink-faint">
            <Sparkles className="h-3.5 w-3.5 text-accent/70" aria-hidden />
            <span className="line-clamp-1">{keyFeature}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] px-5 py-3.5 text-[0.76rem] font-medium sm:px-6">
        <span className="text-ink-faint">
          {product.version ? `v${product.version}` : 'Product'}
        </span>
        <span className="inline-flex items-center gap-1.5 text-white transition-colors group-hover:text-accent-soft">
          Explore Product
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
    </article>
  );
}
