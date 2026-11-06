'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  event?: string;
  params?: Record<string, string | number | boolean | undefined>;
  children: ReactNode;
  internal?: boolean;
}

export function TrackedLink({
  href,
  event,
  params,
  children,
  internal,
  onClick,
  ...rest
}: TrackedLinkProps) {
  const isInternal = internal ?? (href.startsWith('/') && !href.startsWith('//'));
  const handleClick = (clickEvent: React.MouseEvent<HTMLAnchorElement>) => {
    if (event) trackEvent(event, params);
    onClick?.(clickEvent);
  };

  if (isInternal) {
    return (
      <Link href={href} onClick={handleClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}
