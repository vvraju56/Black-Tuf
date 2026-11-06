import { cn, initials } from '@/lib/utils';
import { BrandImage } from './BrandImage';

export function ProductLogo({
  name,
  src,
  className,
  imageClassName,
  priority = false,
}: {
  name: string;
  src?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,121,238,0.06))]',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 25% 15%, rgba(255,121,238,0.22), transparent 55%)',
        }}
        aria-hidden
      />
      {src ? (
        <BrandImage
          src={src}
          alt={`${name} logo`}
          fill
          sizes="160px"
          priority={priority}
          className={cn('relative z-[1] object-contain p-2.5', imageClassName)}
        />
      ) : (
        <span className="relative z-[1] font-display text-xl font-semibold tracking-[-0.05em] text-white/90">
          {initials(name)}
        </span>
      )}
    </div>
  );
}
