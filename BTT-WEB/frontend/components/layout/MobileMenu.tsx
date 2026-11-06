'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileMenu({
  open,
  onClose,
  onSearch,
  links,
  supportHandle,
  supportUrl,
  activePath,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  links: readonly { label: string; href: string }[];
  supportHandle: string;
  supportUrl: string;
  activePath: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>('a, button');
        if (!focusables?.length) return;
        const list = Array.from(focusables).filter((element) => element.tabIndex >= 0);
        const first = list[0];
        const last = list[list.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-[#060608]/95 backdrop-blur-2xl" aria-hidden />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="relative flex h-full flex-col overflow-y-auto"
          >
            <div className="container-page flex items-center justify-between py-5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSearch();
                }}
                className="glass flex h-11 flex-1 items-center gap-3 rounded-xl px-4 text-sm text-ink-faint transition-colors hover:border-accent/30 hover:text-white"
              >
                <Search className="h-4 w-4 text-accent" aria-hidden />
                Search products, docs, services…
                <kbd className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-[0.6rem]">
                  Ctrl K
                </kbd>
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="icon-button ml-3"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="container-page pb-4">
              <ul className="divide-y divide-white/[0.06]">
                {links.map((link, index) => {
                  const active =
                    link.href === '/'
                      ? activePath === '/'
                      : activePath === link.href || activePath.startsWith(`${link.href}/`);
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * index, duration: 0.35 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group flex items-center justify-between py-4 font-display text-2xl font-medium tracking-[-0.04em] transition-colors',
                          active ? 'text-accent-soft' : 'text-white hover:text-accent-soft'
                        )}
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="text-[0.6rem] font-sans font-medium tracking-[0.15em] text-ink-faint">
                            0{index + 1}
                          </span>
                          {link.label}
                        </span>
                        <ArrowRight
                          className="h-4 w-4 -translate-x-1 text-white/20 transition-all group-hover:translate-x-0 group-hover:text-accent"
                          aria-hidden
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            <div className="container-page mt-auto pb-8 pt-6">
              <Link href="/contact" onClick={onClose} className="btn btn-primary w-full">
                Get Started <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <p className="mt-5 text-center text-xs text-ink-faint">
                Need help?{' '}
                {supportUrl ? (
                  <a
                    href={supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-soft underline underline-offset-4"
                  >
                    {supportHandle}
                  </a>
                ) : (
                  <span className="text-ink-muted">{supportHandle}</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
