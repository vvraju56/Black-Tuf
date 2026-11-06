'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Building2,
  FolderTree,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  UserRound,
  Wrench,
  X,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import type { Admin } from '@/lib/types';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3, exact: true },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Messages', href: '/admin/messages', icon: Mail },
  { label: 'Support', href: '/admin/support', icon: LifeBuoy },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Company', href: '/admin/company', icon: Building2 },
  { label: 'Account', href: '/admin/account', icon: UserRound },
];

export function AdminShell({ admin, children }: { admin: Admin; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/backend/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[4.5rem] items-center justify-between border-b border-white/[0.07] px-5">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo compact />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="icon-button h-9 w-9 lg:hidden"
          aria-label="Close admin menu"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Manage
        </p>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.82rem] font-medium transition-colors',
                    active
                      ? 'bg-accent/12 text-accent-soft'
                      : 'text-ink-muted hover:bg-white/[0.045] hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-white/[0.07] pt-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.82rem] text-ink-muted transition-colors hover:bg-white/[0.045] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            View website
          </Link>
        </div>
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-[0.72rem] font-bold text-accent-soft">
            {admin.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.78rem] font-semibold text-white">{admin.name}</p>
            <p className="truncate text-[0.68rem] text-ink-faint">{admin.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-white/[0.05] hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.07] bg-[#070709] lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-white/[0.08] bg-[#070709] shadow-2xl">
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between gap-4 border-b border-white/[0.07] bg-[#060608]/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="icon-button lg:hidden"
              aria-label="Open admin menu"
              aria-expanded={open}
            >
              <Menu className="h-4 w-4" aria-hidden />
            </button>
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                Admin
              </p>
              <p className="text-[0.84rem] font-medium text-white">BlackTuf Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 text-[0.64rem] font-semibold text-emerald-300 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              Signed in
            </span>
            <Link href="/admin/company" className="icon-button" aria-label="Company settings">
              <Settings className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
