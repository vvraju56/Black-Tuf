import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Globe2, LifeBuoy, Mail, MessageCircle, Sparkles } from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { ContactForm } from '@/components/forms/ContactForm';
import { JsonLd } from '@/components/ui/JsonLd';
import { getAllProducts, getSiteSettings } from '@/lib/api';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Contact',
  description:
    'Contact BlackTuf Technologies about a product, a project, or a general enquiry. Tell us what you are trying to build.',
  path: '/contact',
  keywords: ['contact BlackTuf', 'BlackTuf Technologies contact', 'software project enquiry'],
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [products, settings, params] = await Promise.all([
    getAllProducts(),
    getSiteSettings(),
    searchParams,
  ]);

  const productParam = Array.isArray(params.product) ? params.product[0] : params.product || '';
  const matched = products.find(
    (product) => product.slug === productParam || product.name === productParam
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Start a <span className="text-gradient">conversation.</span>
          </>
        }
        description="Have a product question, a project in mind, or something else to discuss? Send a message and we'll get back to you."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className="py-14 sm:py-16" aria-labelledby="contact-form-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="card-surface rounded-2xl p-5 sm:p-7">
            <h2
              id="contact-form-title"
              className="font-display text-xl font-semibold tracking-[-0.03em] text-white"
            >
              Send a message
            </h2>
            <p className="mt-1.5 text-[0.82rem] text-ink-muted">
              Fields marked <span className="text-accent">*</span> are required.
            </p>
            <div className="mt-6">
              <ContactForm
                products={products.map((product) => ({ name: product.name, slug: product.slug }))}
                defaultProduct={matched?.name || ''}
              />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                Other ways to reach us
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link
                    href="/support"
                    className="group flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-colors hover:border-accent/25 hover:bg-white/[0.04]"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
                      <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.84rem] font-medium text-white">
                        Product support
                      </span>
                      <span className="block text-[0.74rem] text-ink-muted">
                        Need help with a product? Start here.
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-3.5 w-3.5 shrink-0 text-white/20 transition-all group-hover:text-accent"
                      aria-hidden
                    />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="group flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition-colors hover:border-accent/25 hover:bg-white/[0.04]"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.07] text-accent">
                      <BookOpen className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.84rem] font-medium text-white">
                        Documentation
                      </span>
                      <span className="block text-[0.74rem] text-ink-muted">
                        Guides, API reference, and troubleshooting.
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-3.5 w-3.5 shrink-0 text-white/20 transition-all group-hover:text-accent"
                      aria-hidden
                    />
                  </Link>
                </li>
              </ul>

              <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-soft">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  Support identity
                </p>
                <p className="mt-1.5 text-[0.84rem] text-white">
                  {settings.supportUrl ? (
                    <a
                      href={settings.supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-accent/40 underline-offset-4 hover:text-accent-soft"
                    >
                      {settings.supportHandle}
                    </a>
                  ) : (
                    settings.supportHandle
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <h2 className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden />
                Before you send
              </h2>
              <ul className="mt-3 space-y-2 text-[0.78rem] leading-relaxed text-ink-muted">
                <li>Say what you are trying to build or solve.</li>
                <li>Include the product name if the question is product-specific.</li>
                <li>Share links or references that add context.</li>
                <li>Never include passwords, tokens, or private records.</li>
              </ul>
            </div>

            {settings.socialWebsite ? (
              <a
                href={settings.socialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[0.82rem] text-ink-muted transition-colors hover:border-accent/30 hover:text-white"
              >
                <Globe2 className="h-4 w-4 text-accent" aria-hidden />
                Personal / company website
                <ArrowRight className="ml-auto h-3.5 w-3.5" aria-hidden />
              </a>
            ) : null}

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <p className="flex items-center gap-2 text-[0.78rem] font-medium text-white">
                <Mail className="h-4 w-4 text-accent" aria-hidden /> What happens next
              </p>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-muted">
                Your message is stored securely and reviewed by the BlackTuf team. We reply using
                the email address you provide. Messages are rate limited to prevent spam.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
