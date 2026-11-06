import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        align === 'center' && 'items-center text-center',
        action && 'md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? <span className="eyebrow mb-4">{eyebrow}</span> : null}
        <h2 className="text-balance text-3xl font-semibold leading-[1.08] text-white sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-pretty text-[0.98rem] leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
