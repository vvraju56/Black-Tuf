'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { BrandImage } from '@/components/ui/BrandImage';
import type { ProductScreenshot } from '@/lib/types';

export function ScreenshotGallery({ screenshots }: { screenshots: ProductScreenshot[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((current) => (current === null ? null : (current + 1) % screenshots.length)),
    [screenshots.length]
  );
  const prev = useCallback(
    () =>
      setIndex((current) =>
        current === null ? null : (current - 1 + screenshots.length) % screenshots.length
      ),
    [screenshots.length]
  );

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [open, close, next, prev]);

  if (!screenshots.length) return null;
  const active = index === null ? null : screenshots[index];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {screenshots.map((shot, shotIndex) => (
          <button
            key={shot.id}
            type="button"
            onClick={() => setIndex(shotIndex)}
            className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.03] text-left transition-all duration-300 hover:border-accent/30"
            aria-label={`Open screenshot ${shotIndex + 1}${shot.caption ? `: ${shot.caption}` : ''}`}
          >
            <BrandImage
              src={shot.url}
              alt={shot.alt || `${shot.caption || 'Product screenshot'}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
              <span className="text-[0.78rem] font-medium text-white drop-shadow">
                {shot.caption || shot.alt || `Screenshot ${shotIndex + 1}`}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-white backdrop-blur transition-colors group-hover:border-accent/50 group-hover:text-accent-soft">
                <Expand className="h-3.5 w-3.5" aria-hidden />
              </span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && active ? (
          <motion.div
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label="Close screenshot"
              onClick={close}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              tabIndex={-1}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={active.caption || active.alt || 'Product screenshot'}
              className="relative w-full max-w-5xl"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-sm text-ink-muted">
                  {active.caption || active.alt || 'Screenshot'}
                  <span className="ml-2 text-ink-faint">
                    {index + 1} / {screenshots.length}
                  </span>
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="icon-button bg-black/50"
                  aria-label="Close screenshot"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0e]"
              >
                <BrandImage
                  src={active.url}
                  alt={active.alt || active.caption || 'Product screenshot'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                  priority
                />
                <div className="relative aspect-[16/10] w-full" aria-hidden />
              </motion.div>

              {screenshots.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="icon-button absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 sm:-left-14"
                    aria-label="Previous screenshot"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="icon-button absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 sm:-right-14"
                    aria-label="Next screenshot"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
