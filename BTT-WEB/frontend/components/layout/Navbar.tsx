'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, Search } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { NAV_LINKS } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { Product, Service } from '@/lib/types';
import { CommandPalette, type SearchDoc } from './CommandPalette';
import { MobileMenu } from './MobileMenu';

export function Navbar({
  products,
  services,
  docs,
  supportHandle,
  supportUrl,
}: {
  products: Product[];
  services: Service[];
  docs: SearchDoc[];
  supportHandle: string;
  supportUrl: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b transition-all duration-300',
          scrolled
            ? 'border-white/[0.08] bg-[#060608]/80 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        )}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
          <Logo compact className="shrink-0" />

          <nav aria-label="Primary navigation" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative inline-flex h-9 items-center rounded-lg px-3 text-[0.82rem] font-medium transition-colors',
                        active
                          ? 'text-white'
                          : 'text-ink-muted hover:bg-white/[0.045] hover:text-white'
                      )}
                    >
                      {link.label}
                      {active ? (
                        <span
                          className="absolute inset-x-3 -bottom-[0.9rem] h-px bg-gradient-to-r from-transparent via-accent to-transparent"
                          aria-hidden
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group hidden h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[0.78rem] text-ink-faint transition-all hover:border-accent/30 hover:bg-white/[0.05] hover:text-white xl:flex"
              aria-label="Search products, documentation, and pages"
            >
              <Search className="h-3.5 w-3.5 text-accent" aria-hidden />
              <span>Search</span>
              <kbd className="ml-2 rounded border border-white/10 bg-black/20 px-1.5 py-0.5 text-[0.6rem] font-medium text-ink-faint">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="icon-button xl:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>

            <Link
              href="/contact"
              className="btn btn-primary hidden h-9 min-h-0 px-4 text-[0.8rem] md:inline-flex"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="icon-button lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="h-[1.15rem] w-[1.15rem]" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-navigation">
        <MobileMenu
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onSearch={() => setSearchOpen(true)}
          links={NAV_LINKS}
          supportHandle={supportHandle}
          supportUrl={supportUrl}
          activePath={pathname}
        />
      </div>

      <CommandPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        products={products}
        services={services}
        docs={docs}
      />
    </>
  );
}
