'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function SiteChrome({
  navbar,
  footer,
  children,
}: {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      {navbar}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {footer}
    </>
  );
}
