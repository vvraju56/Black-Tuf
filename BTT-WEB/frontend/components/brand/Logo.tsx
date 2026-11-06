import Link from 'next/link';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 44"
      role="img"
      aria-label="BlackTuf mark"
      className={cn('h-9 w-9', className)}
    >
      <defs>
        <linearGradient id="btt-mark-stroke" x1="0" y1="0" x2="44" y2="44">
          <stop offset="0%" stopColor="#ff79ee" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#ff79ee" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="btt-mark-fill" x1="12" y1="10" x2="32" y2="34">
          <stop offset="0%" stopColor="#ffe4fb" />
          <stop offset="55%" stopColor="#ff79ee" />
          <stop offset="100%" stopColor="#b92ea5" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="42"
        height="42"
        rx="12"
        fill="#0a0a0f"
        stroke="url(#btt-mark-stroke)"
        strokeWidth="1.2"
      />
      <path
        d="M12.5 11.5h19v5.2H25.3V33h-5.9V16.7H12.5z"
        fill="url(#btt-mark-fill)"
      />
      <path d="M31.2 11.5 35 15.3l-3.8 3.8v-7.6Z" fill="#ff79ee" opacity="0.55" />
      <circle cx="31.4" cy="31.6" r="2.1" fill="#ff79ee" />
    </svg>
  );
}

export function Logo({
  href = '/',
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="BlackTuf Technologies — home"
      className={cn(
        'group inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-4 focus-visible:ring-offset-background',
        className
      )}
    >
      <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105" />
      <span className={cn('flex flex-col leading-none', compact && 'hidden sm:flex')}>
        <span className="font-display text-[1.15rem] font-semibold tracking-[-0.04em] text-white">
          Black<span className="text-accent">Tuf</span>
        </span>
        <span className="mt-1 text-[0.56rem] font-semibold uppercase tracking-[0.34em] text-ink-faint">
          Technologies
        </span>
      </span>
    </Link>
  );
}
