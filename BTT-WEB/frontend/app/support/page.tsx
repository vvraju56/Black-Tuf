import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Bug,
  CircleHelp,
  Lightbulb,
  LifeBuoy,
  Mail,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { PageHero } from '@/components/ui/PageHero';
import { SupportForm } from '@/components/forms/SupportForm';
import { JsonLd } from '@/components/ui/JsonLd';
import { getAllProducts, getSiteSettings } from '@/lib/api';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Support',
  description:
    'Need help with a BlackTuf product? Get product support, read documentation, report a bug, request a feature, or ask an account question.',
  path: '/support',
  keywords: ['BlackTuf support', 'product support', 'report a bug', 'feature request'],
});

const OPTIONS = [
  {
    icon: LifeBuoy,
    title: 'Product Support',
    description: 'Usage questions, troubleshooting, and help with a specific BlackTuf product.',
    href: '/support?issue=Product+Support#support-form',
    issue: 'Product Support',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Guides, API reference, troubleshooting, and frequently asked questions.',
    href: '/docs',
    issue: null,
  },
  {
    icon: Bug,
    title: 'Report a Bug',
    description: 'Something is broken or behaves differently from what is documented.',
    href: '/support?issue=Bug+Report#support-form',
    issue: 'Bug Report',
  },
  {
    icon: Lightbulb,
    title: 'Feature Request',
    description: 'A capability you would like a BlackTuf product to have.',
    href: '/support?issue=Feature+Request#support-form',
    issue: 'Feature Request',
  },
  {
    icon: UserRound,
    title: 'Account Help',
    description: 'Questions about access, sign-in, or your account on a product.',
    href: '/support?issue=Account+Help#support-form',
    issue: 'Account Help',
  },
  {
    icon: Mail,
    title: 'General Contact',
    description: 'Anything that is not product support — enquiries, feedback, or other questions.',
    href: '/contact',
    issue: null,
  },
];

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [products, settings, params] = await Promise.all([
    getAllProducts(),
    getSiteSettings(),
    searchParams,
  ]);

  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value || '';

  const issueParam = first(params.issue);
  const productParam = first(params.product);

  const issueMap: Record<string, string> = {
    bug: 'Bug Report',
    feature: 'Feature Request',
    account: 'Account Help',
    docs: 'Documentation',
    general: 'General',
    support: 'Product Support',
  };

  const issueType = issueMap[issueParam.toLowerCase()] || issueParam || 'Product Support';
  const matchedProduct = products.find(
    (product) => product.slug === productParam || product.name === productParam
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Support', path: '/support' },
        ])}
      />
      <PageHero
        eyebrow="Support Center"
        title={
          <>
            How can we <span className="text-gradient">help?</span>
          </>
        }
        description="Need help with a BlackTuf product? We're here to help."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Support' }]}
      >
        <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-4 py-3 text-sm text-ink-muted">
          <MessageCircle className="h-4 w-4 text-accent" aria-hidden />
          Support identity:{' '}
          {settings.supportUrl ? (
            <a
              href={settings.supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-soft underline decoration-accent/30 underline-offset-4 hover:text-white"
            >
              {settings.supportHandle}
            </a>
          ) : (
            <span className="font-semibold text-white">{settings.supportHandle}</span>
          )}
        </div>
      </PageHero>

      <section className="py-14 sm:py-16" aria-labelledby="support-options">
        <div className="container-page">
          <h2 id="support-options" className="sr-only">
            Support options
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.title}
                  href={option.href}
                  className="group flex h-full flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.07] text-accent">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <ArrowRight
                      className="h-4 w-4 -translate-x-1 text-white/20 transition-all group-hover:translate-x-0 group-hover:text-accent"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-4 text-[0.95rem] font-semibold text-white">{option.title}</h3>
                  <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-muted">
                    {option.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="support-form"
        className="scroll-mt-28 border-y border-white/[0.06] py-14 sm:py-16"
        aria-labelledby="support-form-title"
      >
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <span className="eyebrow mb-4">Submit a request</span>
            <h2
              id="support-form-title"
              className="text-balance font-display text-3xl font-semibold tracking-[-0.045em] text-white"
            >
              Tell us what happened.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
              Include the product, what you expected, and what happened instead. Screenshots help.
              Do not include passwords, tokens, or private personal information.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: MessagesSquare,
                  title: 'Clear description',
                  text: 'The exact error message and the steps that reproduce it.',
                },
                {
                  icon: ShieldCheck,
                  title: 'No sensitive data',
                  text: 'Never send credentials or private records in a support request.',
                },
                {
                  icon: CircleHelp,
                  title: 'One issue per request',
                  text: 'Separate requests are easier to track and resolve.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-accent">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-[0.86rem] font-medium text-white">{item.title}</p>
                      <p className="mt-0.5 text-[0.78rem] leading-relaxed text-ink-muted">
                        {item.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Prefer another route?
              </p>
              <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-muted">
                For general enquiries, use the{' '}
                <Link
                  href="/contact"
                  className="text-white underline decoration-accent/40 underline-offset-4 hover:text-accent-soft"
                >
                  contact form
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="card-surface rounded-2xl p-5 sm:p-7">
            <SupportForm
              products={products.map((product) => ({ name: product.name, slug: product.slug }))}
              defaultProduct={matchedProduct?.name || ''}
              defaultIssue={issueType}
            />
          </div>
        </div>
      </section>
    </>
  );
}
