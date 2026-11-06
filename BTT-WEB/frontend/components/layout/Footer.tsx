import Link from 'next/link';
import { ArrowUpRight, Github, Globe2, Linkedin, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { FOOTER_LINKS } from '@/lib/site';
import type { Product, SiteSettings } from '@/lib/types';

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="glass group flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent/10 hover:text-accent-soft"
    >
      {children}
    </a>
  );
}

export function Footer({
  products,
  settings,
}: {
  products: Product[];
  settings: SiteSettings;
}) {
  const year = new Date().getFullYear();
  const footerProducts = products.slice(0, 5);

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/[0.07]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 0%, rgba(59,130,246,0.08), transparent 32%), linear-gradient(180deg, #080808, #050505)',
        }}
        aria-hidden
      />
      <div className="container-page relative py-14 sm:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-12 md:gap-x-10">
          <div className="col-span-2 md:col-span-4 lg:col-span-3">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">
              Building modern software products, digital platforms, and technology solutions.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              <SocialLink href={settings.socialWebsite} label="Personal / company website">
                <Globe2 className="h-4 w-4" aria-hidden />
              </SocialLink>
              <SocialLink href={settings.socialGithub} label="GitHub">
                <Github className="h-4 w-4" aria-hidden />
              </SocialLink>
              <SocialLink href={settings.socialLinkedin} label="LinkedIn">
                <Linkedin className="h-4 w-4" aria-hidden />
              </SocialLink>
              {settings.supportUrl ? (
                <SocialLink href={settings.supportUrl} label={`Support ${settings.supportHandle}`}>
                  <MessageCircle className="h-4 w-4" aria-hidden />
                </SocialLink>
              ) : null}
            </div>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
              Micro Enterprise · Services
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white">
              Products
            </h2>
            <ul className="mt-4 space-y-2.5 text-[0.83rem]">
              {footerProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group inline-flex items-center gap-1 text-ink-muted transition-colors hover:text-accent-soft"
                  >
                    <span className="max-w-[11rem] truncate">{product.name}</span>
                    <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="font-medium text-accent-soft transition-colors hover:text-white"
                >
                  View All Products
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white">
              Features / Tools
            </h2>
            <ul className="mt-4 space-y-2.5 text-[0.83rem]">
              {FOOTER_LINKS.features.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ink-muted transition-colors hover:text-accent-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white">
              Resources
            </h2>
            <ul className="mt-4 space-y-2.5 text-[0.83rem]">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ink-muted transition-colors hover:text-accent-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white">
              Support
            </h2>
            <ul className="mt-4 space-y-2.5 text-[0.83rem]">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ink-muted transition-colors hover:text-accent-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                {settings.supportUrl ? (
                  <a
                    href={settings.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-soft underline decoration-accent/30 underline-offset-4 transition-colors hover:text-white"
                  >
                    {settings.supportHandle}
                  </a>
                ) : (
                  <span className="text-ink-muted">{settings.supportHandle}</span>
                )}
              </li>
            </ul>
            <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-soft">
                Need help?
              </p>
              <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-faint">
                Contact{' '}
                {settings.supportUrl ? (
                  <a
                    href={settings.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline decoration-accent/40 underline-offset-4"
                  >
                    {settings.supportHandle}
                  </a>
                ) : (
                  <span className="text-ink-muted">{settings.supportHandle}</span>
                )}{' '}
                for product support and assistance.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.07] pt-6 text-[0.74rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.companyName}. All rights reserved. Made with{' '}
            <span aria-label="love">❤️</span> by <span className="font-semibold text-accent">VV</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin" className="transition-colors hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
