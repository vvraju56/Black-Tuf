import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CircleDollarSign,
  ExternalLink,
  Github,
  Layers,
  LifeBuoy,
  Mail,
  MessageCircle,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/PageHero';
import { ProductLogo } from '@/components/ui/ProductLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrackedLink } from '@/components/ui/TrackedLink';
import { NotifyForm } from '@/components/products/NotifyForm';
import { ScreenshotGallery } from '@/components/products/ScreenshotGallery';
import { getIcon } from '@/lib/icons';
import type { Product } from '@/lib/types';
import { formatDate, safeExternalUrl } from '@/lib/utils';

function Section({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={className} aria-labelledby={`${id}-title`}>
      <div className="mb-6">
        {eyebrow ? <span className="eyebrow mb-3">{eyebrow}</span> : null}
        <h2
          id={`${id}-title`}
          className="text-balance font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl"
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function paragraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function ProductHero({ product }: { product: Product }) {
  const website = safeExternalUrl(product.websiteUrl);
  const docs = safeExternalUrl(product.documentationUrl);
  const github = safeExternalUrl(product.githubUrl);
  const support = safeExternalUrl(product.supportUrl);

  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] pb-14 pt-10 sm:pb-16 sm:pt-14">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-[size:64px_64px] opacity-[0.16] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        aria-hidden
      />
      {product.bannerImage ? (
        <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.bannerImage}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
        </div>
      ) : null}
      <div
        className="glow-orb pointer-events-none absolute -right-24 top-0 h-72 w-72 opacity-45"
        aria-hidden
      />

      <div className="container-page relative">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.name },
          ]}
          className="mb-8"
        />

        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <ProductLogo
                name={product.name}
                src={product.logo}
                className="h-16 w-16 rounded-2xl"
                priority
              />
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={product.status} />
                <span className="badge border-white/10 bg-white/[0.04] text-ink-muted">
                  <Tag className="h-3 w-3" aria-hidden />
                  {product.categoryName}
                </span>
                {product.version ? (
                  <span className="badge border-white/10 bg-white/[0.04] text-ink-muted">
                    v{product.version}
                  </span>
                ) : null}
              </div>
            </div>

            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl lg:text-[3.6rem]">
              {product.name}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
              {product.shortDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {website ? (
                <TrackedLink
                  href={website}
                  event="external_product_click"
                  params={{ product: product.slug, target: 'website' }}
                  className="btn btn-primary group"
                >
                  Visit Product
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </TrackedLink>
              ) : (
                <Link href={`/contact?product=${product.slug}`} className="btn btn-primary group">
                  Ask about this product
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              )}
              {docs ? (
                <TrackedLink
                  href={docs}
                  event="documentation_click"
                  params={{ product: product.slug }}
                  className="btn btn-secondary"
                >
                  <BookOpen className="h-4 w-4" aria-hidden /> View Documentation
                </TrackedLink>
              ) : null}
              <Link href="/support" className="btn btn-secondary">
                <LifeBuoy className="h-4 w-4" aria-hidden /> Get Support
              </Link>
            </div>

            {product.status === 'Coming Soon' ? (
              <div className="mt-8 max-w-lg rounded-2xl border border-accent/20 bg-accent/[0.055] p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-accent" aria-hidden />
                  Coming Soon
                </p>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-muted">
                  {product.name} has not launched yet. Leave your email and we&apos;ll send a
                  launch update.
                </p>
                <div className="mt-4">
                  <NotifyForm slug={product.slug} productName={product.name} />
                </div>
              </div>
            ) : null}
          </div>

          <aside aria-label="Product at a glance" className="lg:pt-2">
            <div className="glass-strong rounded-2xl p-5">
              <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                At a glance
              </h2>
              <dl className="mt-4 space-y-3.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-ink-faint">
                    <Layers className="h-3.5 w-3.5" aria-hidden /> Category
                  </dt>
                  <dd className="text-right font-medium text-white">{product.categoryName}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-ink-faint">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> Status
                  </dt>
                  <dd>
                    <StatusBadge status={product.status} />
                  </dd>
                </div>
                {product.version ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-ink-faint">
                      <Tag className="h-3.5 w-3.5" aria-hidden /> Version
                    </dt>
                    <dd className="font-medium text-white">{product.version}</dd>
                  </div>
                ) : null}
                {product.releaseDate ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-ink-faint">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Released
                    </dt>
                    <dd className="font-medium text-white">{formatDate(product.releaseDate)}</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-ink-faint">
                    <CircleDollarSign className="h-3.5 w-3.5" aria-hidden /> Pricing
                  </dt>
                  <dd className="text-right font-medium text-white">
                    {product.pricing?.type || 'Coming soon'}
                  </dd>
                </div>
              </dl>

              {(website || docs || github || support) && (
                <div className="mt-5 grid gap-2 border-t border-white/[0.08] pt-5">
                  {website ? (
                    <TrackedLink
                      href={website}
                      event="external_product_click"
                      params={{ product: product.slug, target: 'website_secondary' }}
                      className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[0.8rem] text-ink-muted transition-colors hover:border-accent/30 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Website
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </TrackedLink>
                  ) : null}
                  {docs ? (
                    <TrackedLink
                      href={docs}
                      event="documentation_click"
                      params={{ product: product.slug }}
                      className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[0.8rem] text-ink-muted transition-colors hover:border-accent/30 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden /> Documentation
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </TrackedLink>
                  ) : null}
                  {github ? (
                    <TrackedLink
                      href={github}
                      className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[0.8rem] text-ink-muted transition-colors hover:border-accent/30 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <Github className="h-3.5 w-3.5" aria-hidden /> GitHub
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </TrackedLink>
                  ) : null}
                  {support ? (
                    <TrackedLink
                      href={support}
                      className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[0.8rem] text-ink-muted transition-colors hover:border-accent/30 hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <LifeBuoy className="h-3.5 w-3.5" aria-hidden /> Support
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </TrackedLink>
                  ) : null}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function ProductBody({ product }: { product: Product }) {
  const website = safeExternalUrl(product.websiteUrl);
  const docs = safeExternalUrl(product.documentationUrl);
  const github = safeExternalUrl(product.githubUrl);
  const support = safeExternalUrl(product.supportUrl);
  const description = paragraphs(product.description);

  const links = [
    website
      ? {
          label: 'Visit Website',
          href: website,
          icon: ExternalLink,
          event: 'external_product_click',
          primary: true,
        }
      : null,
    docs
      ? { label: 'Documentation', href: docs, icon: BookOpen, event: 'documentation_click' }
      : null,
    github ? { label: 'GitHub', href: github, icon: Github } : null,
    support ? { label: 'Support', href: support, icon: MessageCircle } : null,
    { label: 'Contact BlackTuf', href: `/contact?product=${product.slug}`, icon: Mail },
  ].filter(Boolean) as {
    label: string;
    href: string;
    icon: typeof ExternalLink;
    event?: string;
    primary?: boolean;
  }[];

  const hasPricing = Boolean(product.pricing?.type);

  return (
    <div className="container-page py-14 sm:py-16">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div className="min-w-0 space-y-16">
          <Section id="overview" eyebrow="Overview" title={`About ${product.name}`}>
            {description.length ? (
              <div className="article-body max-w-3xl">
                {description.map((paragraph) => (
                  <p key={paragraph.slice(0, 60)}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">
                A fuller overview for {product.name} is being prepared.
              </p>
            )}
          </Section>

          {product.features.length ? (
            <Section id="features" eyebrow="Features" title="What it does">
              <div className="grid gap-3 sm:grid-cols-2">
                {product.features.map((feature) => {
                  const Icon = getIcon(feature.icon);
                  return (
                    <article
                      key={feature.id}
                      className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:border-accent/25 hover:bg-white/[0.04]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.07] text-accent">
                        <Icon className="h-4 w-4" aria-hidden />
                      </div>
                      <h3 className="mt-4 text-[0.95rem] font-semibold text-white">
                        {feature.title}
                      </h3>
                      {feature.description ? (
                        <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-muted">
                          {feature.description}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {product.screenshots.length ? (
            <Section id="screenshots" eyebrow="Screenshots" title="A look inside">
              <ScreenshotGallery screenshots={product.screenshots} />
            </Section>
          ) : null}

          {product.howItWorks.length ? (
            <Section id="how-it-works" eyebrow="How it works" title="From start to finish">
              <ol className="relative space-y-6 border-l border-white/[0.1] pl-7">
                {product.howItWorks.map((step, index) => (
                  <li key={`${step.title}-${index}`} className="relative">
                    <span className="absolute -left-[2.35rem] flex h-6 w-6 items-center justify-center rounded-full border border-accent/30 bg-[#0b0b10] text-[0.66rem] font-semibold text-accent">
                      {index + 1}
                    </span>
                    <h3 className="text-[0.98rem] font-semibold text-white">{step.title}</h3>
                    {step.description ? (
                      <p className="mt-1.5 max-w-2xl text-[0.85rem] leading-relaxed text-ink-muted">
                        {step.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          {product.technologies.length ? (
            <Section id="technology" eyebrow="Technology" title="Built with">
              <ul className="flex flex-wrap gap-2">
                {product.technologies.map((technology) => (
                  <li
                    key={technology.id}
                    className="rounded-lg border border-white/[0.09] bg-white/[0.035] px-3.5 py-2 text-[0.8rem] font-medium text-ink-muted"
                  >
                    {technology.name}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section id="pricing" eyebrow="Pricing" title="What it costs">
            {hasPricing ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
                <p className="font-display text-2xl font-semibold text-white">
                  {product.pricing?.type}
                </p>
                {product.pricing?.note ? (
                  <p className="mt-2 max-w-2xl text-[0.86rem] leading-relaxed text-ink-muted">
                    {product.pricing.note}
                  </p>
                ) : (
                  <p className="mt-2 text-[0.86rem] text-ink-muted">
                    Contact BlackTuf for the details that apply to your use case.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
                <p className="text-sm text-ink-muted">Pricing information coming soon.</p>
              </div>
            )}
          </Section>

          {product.faqs.length ? (
            <Section id="faq" eyebrow="FAQ" title="Questions and answers">
              <div className="divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                {product.faqs.map((faq) => (
                  <details key={faq.id} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[0.9rem] font-medium text-white transition-colors hover:bg-white/[0.03] [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-90"
                        aria-hidden
                      />
                    </summary>
                    <div className="px-5 pb-5 text-[0.86rem] leading-relaxed text-ink-muted">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </Section>
          ) : null}

          {product.changelog.length ? (
            <Section id="changelog" eyebrow="Changelog" title="Release history">
              <ol className="space-y-5">
                {product.changelog.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 text-[0.7rem] font-semibold text-accent-soft">
                        v{entry.version}
                      </span>
                      {entry.releaseDate ? (
                        <span className="text-[0.72rem] text-ink-faint">
                          {formatDate(entry.releaseDate)}
                        </span>
                      ) : null}
                    </div>
                    {entry.notes.length ? (
                      <ul className="mt-3 space-y-1.5">
                        {entry.notes.map((note) => (
                          <li
                            key={note}
                            className="flex items-start gap-2 text-[0.84rem] leading-relaxed text-ink-muted"
                          >
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" aria-hidden />
                            {note}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          <Section id="links" eyebrow="Product links" title="Continue with this product">
            <div className="flex flex-wrap gap-2.5">
              {links.map((link) => {
                const Icon = link.icon;
                const isInternal = link.href.startsWith('/');
                const className = link.primary ? 'btn btn-primary' : 'btn btn-secondary';
                return isInternal ? (
                  <Link key={link.label} href={link.href} className={className}>
                    <Icon className="h-4 w-4" aria-hidden /> {link.label}
                  </Link>
                ) : (
                  <TrackedLink
                    key={link.label}
                    href={link.href}
                    event={link.event}
                    params={{ product: product.slug }}
                    className={className}
                  >
                    <Icon className="h-4 w-4" aria-hidden /> {link.label}
                  </TrackedLink>
                );
              })}
            </div>
            <p className="mt-4 text-[0.72rem] text-ink-faint">
              Only links configured for this product are shown.
            </p>
          </Section>
        </div>

        <aside className="hidden lg:block">
          <nav
            aria-label="On this page"
            className="sticky top-28 space-y-1 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
          >
            <p className="mb-2 px-2 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
              On this page
            </p>
            {[
              ['overview', 'Overview'],
              ...(product.features.length ? [['features', 'Features']] : []),
              ...(product.screenshots.length ? [['screenshots', 'Screenshots']] : []),
              ...(product.howItWorks.length ? [['how-it-works', 'How it works']] : []),
              ...(product.technologies.length ? [['technology', 'Technology']] : []),
              ['pricing', 'Pricing'],
              ...(product.faqs.length ? [['faq', 'FAQ']] : []),
              ...(product.changelog.length ? [['changelog', 'Changelog']] : []),
              ['links', 'Product links'],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="block rounded-lg px-2 py-1.5 text-[0.78rem] text-ink-muted transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}

export function RelatedProducts({
  products,
  currentSlug,
}: {
  products: Product[];
  currentSlug: string;
}) {
  const related = products.filter((product) => product.slug !== currentSlug).slice(0, 3);
  if (!related.length) return null;

  return (
    <section className="border-t border-white/[0.06] py-14">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow mb-3">More from BlackTuf</span>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Explore other products
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-sm font-medium text-accent-soft transition-colors hover:text-white"
          >
            All products
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                className="group flex h-full items-start gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white/[0.04]"
              >
                <ProductLogo
                  name={product.name}
                  src={product.logo}
                  className="h-11 w-11 rounded-xl"
                  imageClassName="p-1.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white group-hover:text-accent-soft">
                    {product.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.76rem] leading-relaxed text-ink-muted">
                    {product.shortDescription}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-1 h-4 w-4 shrink-0 text-white/20 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
