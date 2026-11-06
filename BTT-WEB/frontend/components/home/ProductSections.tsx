import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Motion';
import { getIcon } from '@/lib/icons';
import type { Product, Service } from '@/lib/types';

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="relative py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Featured products"
          title="Built to be used, not just announced."
          description="Selected products from the BlackTuf catalogue."
          action={
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 text-sm font-medium text-accent-soft transition-colors hover:text-white"
            >
              Explore all products
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          }
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.07} className="h-full">
              <ProductCard product={product} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductDirectoryPreview({ products }: { products: Product[] }) {
  return (
    <section className="relative border-y border-white/[0.06] py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 85% 15%, rgba(255,121,238,0.06), transparent 35%)',
        }}
        aria-hidden
      />
      <div className="container-page relative">
        <SectionHeading
          eyebrow="Our Products"
          title="The BlackTuf product directory."
          description="Explore products built by BlackTuf Technologies."
          action={
            <Link href="/products" className="btn btn-secondary group">
              View All Products
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          }
        />

        {products.length ? (
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08]">
            {products.slice(0, 8).map((product, index) => (
              <Reveal key={product.id} delay={index * 0.035} y={12}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/[0.06] bg-white/[0.02] px-4 py-4 transition-colors last:border-b-0 hover:bg-white/[0.045] sm:grid-cols-[auto_1.4fr_1fr_auto_auto] sm:px-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                    {product.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.logo}
                        alt=""
                        className="h-full w-full object-contain p-1.5"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="font-display text-xs font-semibold text-accent-soft">
                        {product.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white transition-colors group-hover:text-accent-soft">
                      {product.name}
                    </p>
                    <p className="truncate text-[0.7rem] text-ink-faint sm:hidden">
                      {product.categoryName}
                    </p>
                  </div>
                  <p className="hidden truncate text-[0.76rem] text-ink-muted sm:block">
                    {product.categoryName}
                  </p>
                  <p className="hidden text-[0.68rem] text-ink-faint sm:block">
                    {product.features[0]?.title || product.technologies[0]?.name || ''}
                  </p>
                  <span className="flex items-center gap-2 text-[0.68rem] font-medium text-ink-muted">
                    <span className="hidden items-center gap-1.5 sm:inline-flex">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          product.status === 'Active'
                            ? 'bg-emerald-400'
                            : product.status === 'Beta'
                              ? 'bg-sky-400'
                              : product.status === 'Coming Soon'
                                ? 'bg-accent'
                                : 'bg-white/30'
                        }`}
                        aria-hidden
                      />
                      {product.status}
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 text-white/20 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      aria-hidden
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.025] px-6 py-14 text-center">
            <p className="font-display text-xl font-semibold text-white">
              Products are coming soon.
            </p>
            <p className="mt-2 text-sm text-ink-muted">We&apos;re working on something new.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function WhatWeBuild({ services }: { services: Service[] }) {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="What we build"
          title="Software, platforms, and the systems behind them."
          description="Capabilities drawn from the work behind our products and services."
          action={
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 text-sm font-medium text-accent-soft transition-colors hover:text-white"
            >
              Explore services
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          }
        />
        {services.length ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, index) => {
              const Icon = getIcon(service.icon);
              return (
                <Reveal key={service.id} delay={index * 0.05} className="h-full">
                  <Link
                    href={`/services#${service.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white/[0.04]"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.07] text-accent">
                      <Icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                    </span>
                    <h3 className="mt-4 text-[0.98rem] font-semibold text-white">{service.title}</h3>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-muted">
                      {service.shortDescription}
                    </p>
                    <span className="mt-auto flex items-center gap-1.5 pt-4 text-[0.7rem] font-medium text-accent-soft opacity-0 transition-opacity group-hover:opacity-100">
                      See service <ArrowRight className="h-3 w-3" aria-hidden />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <p className="mt-8 text-sm text-ink-muted">Services information is coming soon.</p>
        )}
      </div>
    </section>
  );
}
