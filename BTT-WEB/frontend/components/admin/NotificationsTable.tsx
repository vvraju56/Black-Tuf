'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Copy, Download, Search } from 'lucide-react';
import { AdminEmpty, AdminNotice } from '@/components/admin/AdminUI';
import type { ProductNotificationItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

function toCsv(rows: ProductNotificationItem[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const header = ['Email', 'Product', 'Product slug', 'Signed up'];
  const lines = rows.map((row) =>
    [row.email, row.productName, row.productSlug, formatDate(row.createdAt)]
      .map((value) => escape(String(value || '')))
      .join(',')
  );
  return [header.join(','), ...lines].join('\r\n');
}

export function NotificationsTable({ notifications }: { notifications: ProductNotificationItem[] }) {
  const [search, setSearch] = useState('');
  const [product, setProduct] = useState('all');
  const [notice, setNotice] = useState('');

  const products = useMemo(() => {
    const unique = new Map<string, string>();
    for (const item of notifications) {
      if (item.productSlug) unique.set(item.productSlug, item.productName);
    }
    return [...unique.entries()].map(([slug, name]) => ({ slug, name }));
  }, [notifications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((item) => {
      if (product !== 'all' && item.productSlug !== product) return false;
      if (q && !`${item.email} ${item.productName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notifications, product, search]);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const download = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blacktuf-launch-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    if (!filtered.length) return;
    try {
      await navigator.clipboard.writeText(filtered.map((item) => item.email).join(', '));
      flash(`Copied ${filtered.length} email address${filtered.length === 1 ? '' : 'es'}.`);
    } catch {
      flash('Your browser blocked clipboard access.');
    }
  };

  return (
    <div>
      {notice ? (
        <div className="mb-4">
          <AdminNotice type="success">{notice}</AdminNotice>
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:flex-row sm:items-center">
        <label className="relative flex flex-1 items-center">
          <span className="sr-only">Search signups</span>
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-ink-faint"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email or product…"
            className="field h-10 pl-9 text-[0.82rem]"
          />
        </label>
        <label className="sm:w-56">
          <span className="sr-only">Filter by product</span>
          <select
            value={product}
            onChange={(event) => setProduct(event.target.value)}
            className="field h-10 cursor-pointer text-[0.8rem]"
          >
            <option value="all" className="bg-[#0b0b10]">
              All products
            </option>
            {products.map((entry) => (
              <option key={entry.slug} value={entry.slug} className="bg-[#0b0b10]">
                {entry.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={copyAll}
            disabled={!filtered.length}
            className="btn btn-secondary h-10 px-3 py-0 text-[0.76rem]"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden /> Copy emails
          </button>
          <button
            type="button"
            onClick={download}
            disabled={!filtered.length}
            className="btn btn-secondary h-10 px-3 py-0 text-[0.76rem]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden /> CSV
          </button>
        </div>
      </div>

      {filtered.length ? (
        <div className="overflow-hidden rounded-xl border border-white/[0.08]">
          <div className="hidden grid-cols-[minmax(0,1fr)_12rem_9rem] gap-3 border-b border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint sm:grid">
            <span>Email</span>
            <span>Product</span>
            <span className="text-right">Signed up</span>
          </div>
          <ul className="divide-y divide-white/[0.07]">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="grid gap-1 px-4 py-3 transition-colors hover:bg-white/[0.02] sm:grid-cols-[minmax(0,1fr)_12rem_9rem] sm:items-center sm:gap-3"
              >
                <a
                  href={`mailto:${item.email}`}
                  className="truncate text-[0.84rem] font-medium text-white hover:text-accent-soft"
                >
                  {item.email}
                </a>
                <div className="min-w-0">
                  {item.productSlug ? (
                    <Link
                      href={`/products/${item.productSlug}`}
                      target="_blank"
                      className="truncate text-[0.78rem] text-ink-muted hover:text-accent-soft"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <span className="text-[0.78rem] text-ink-muted">{item.productName}</span>
                  )}
                </div>
                <p className="text-[0.7rem] text-ink-faint sm:text-right">
                  {formatDate(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <AdminEmpty
          title={notifications.length ? 'No signups match this view' : 'No launch signups yet'}
          description={
            notifications.length
              ? 'Change the product filter or clear the search.'
              : 'Visitors can request launch updates from a product that is marked “Coming Soon”.'
          }
          action={
            notifications.length ? (
              <button
                type="button"
                onClick={() => {
                  setProduct('all');
                  setSearch('');
                }}
                className="btn btn-secondary"
              >
                Clear filters
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 text-[0.76rem] text-ink-faint">
                <Bell className="h-4 w-4" aria-hidden /> Waiting for the first signup
              </span>
            )
          }
        />
      )}

      <p className="mt-4 text-[0.72rem] text-ink-faint">
        {filtered.length} of {notifications.length} signups shown. Notifications are read-only and
        are removed automatically when the related product is deleted.
      </p>
    </div>
  );
}
