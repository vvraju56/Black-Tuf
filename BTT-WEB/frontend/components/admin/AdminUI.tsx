import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminPageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? (
          <p className="mb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-accent-soft">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[0.84rem] leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6',
        className
      )}
    >
      {title ? (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[0.95rem] font-semibold text-white">{title}</h2>
            {description ? (
              <p className="mt-1 text-[0.78rem] text-ink-muted">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="group flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition-colors hover:border-accent/25 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {label}
        </span>
        {icon ? <span className="text-accent/80">{icon}</span> : null}
      </div>
      <div className="mt-4">
        <p className="font-display text-2xl font-semibold text-white">{value}</p>
        {hint ? <p className="mt-0.5 text-[0.7rem] text-ink-faint">{hint}</p> : null}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

export function AdminEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.015] px-5 py-10 text-center">
      <p className="text-[0.9rem] font-medium text-white">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-sm text-[0.8rem] leading-relaxed text-ink-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function AdminNotice({
  type = 'success',
  children,
}: {
  type?: 'success' | 'error' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    success: 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200',
    error: 'border-red-400/25 bg-red-400/[0.07] text-red-200',
    info: 'border-sky-400/25 bg-sky-400/[0.07] text-sky-200',
  };
  return (
    <p
      role={type === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border px-3.5 py-2.5 text-[0.8rem]', styles[type])}
    >
      {children}
    </p>
  );
}

export function AdminLinkButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link href={href} className={variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'}>
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
