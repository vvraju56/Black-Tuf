'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Boxes, LifeBuoy, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProductLogo } from '@/components/ui/ProductLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Product } from '@/lib/types';

export function HeroVisual({ products }: { products: Product[] }) {
  const preview = products.slice(0, 3);
  const technologies = Array.from(
    new Set(products.flatMap((product) => product.technologies.map((tech) => tech.name)))
  ).slice(0, 5);

  return (
    <div className="relative mx-auto aspect-[1.03/1] w-full max-w-[34rem] lg:ml-auto">
      <div
        className="absolute inset-0 rounded-[3rem] border border-white/[0.06] bg-[radial-gradient(circle_at_50%_35%,rgba(255,121,238,0.10),transparent_58%)]"
        aria-hidden
      />
      <div className="absolute inset-6 rounded-[2.5rem] border border-white/[0.05]" aria-hidden />
      <div
        className="glow-orb absolute right-4 top-10 h-48 w-48 opacity-60"
        aria-hidden
      />

      <motion.div
        className="absolute left-1/2 top-1/2 w-[82%] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#0b0b10]/85 shadow-[0_35px_90px_-25px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent/80" />
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-faint">
                Product hub
              </span>
            </div>
            <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[0.55rem] text-ink-faint">
              Live
            </span>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {preview.length ? (
              preview.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.035]"
                >
                  <ProductLogo
                    name={product.name}
                    src={product.logo}
                    className="h-9 w-9 rounded-lg"
                    imageClassName="p-1"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8rem] font-medium text-white">
                      {product.name}
                    </span>
                    <span className="block truncate text-[0.64rem] text-ink-faint">
                      {product.categoryName}
                    </span>
                  </span>
                  <StatusBadge status={product.status} className="hidden sm:inline-flex" />
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-white/20 transition-all group-hover:text-accent"
                    aria-hidden
                  />
                </Link>
              ))
            ) : (
              <div className="px-4 py-10 text-center">
                <Boxes className="mx-auto h-6 w-6 text-accent/60" aria-hidden />
                <p className="mt-3 text-sm font-medium text-white">Products coming soon</p>
                <p className="mt-1 text-xs text-ink-faint">We&apos;re working on something new.</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[0.6rem] text-ink-faint">
            <span>One place for every product</span>
            <Link href="/products" className="text-accent-soft hover:text-white">
              Explore all →
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -left-2 top-[13%] hidden w-40 sm:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 text-accent-soft">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em]">Docs</span>
          </div>
          <p className="mt-2 text-[0.7rem] leading-snug text-ink-muted">
            Guides, API reference, troubleshooting.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-1 bottom-[14%] hidden w-44 sm:block"
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      >
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 text-accent-soft">
            <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em]">Support</span>
          </div>
          <p className="mt-2 text-[0.7rem] leading-snug text-ink-muted">
            Need help? <span className="text-white">@blacktuftech</span>
          </p>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-2 left-[7%] hidden w-52 md:block"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="glass flex items-center gap-3 rounded-xl px-3 py-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <div className="flex min-w-0 flex-wrap gap-1">
            {(technologies.length ? technologies : ['Product engineering']).map((tech) => (
              <span
                key={tech}
                className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.58rem] text-ink-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
