import Link from 'next/link';
import type { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'card-surface flex flex-col items-center rounded-3xl px-6 py-16 text-center sm:px-10',
        className
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.07] text-accent">
        {icon || <PackageOpen className="h-6 w-6" aria-hidden />}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}

export function ComingSoonState() {
  return (
    <EmptyState
      title="Products are coming soon."
      description="We're working on something new. Check back soon, or follow @blacktuftech for updates."
      action={
        <Link href="/support" className="btn btn-secondary">
          Contact support
        </Link>
      }
    />
  );
}
