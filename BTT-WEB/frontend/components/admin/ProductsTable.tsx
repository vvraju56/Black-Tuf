'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { AdminEmpty, AdminNotice } from '@/components/admin/AdminUI';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { adminRequest, AdminApiError } from '@/lib/admin';
import type { Product, ProductStatus } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

type Filter = 'all' | 'published' | 'drafts' | 'featured';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'drafts', label: 'Drafts' },
  { value: 'featured', label: 'Featured' },
];

const STATUSES: ProductStatus[] = ['Active', 'Beta', 'Coming Soon', 'Maintenance', 'Archived'];

export function ProductsTable({
  initialProducts,
  initialFilter = 'all',
}: {
  initialProducts: Product[];
  initialFilter?: Filter;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      if (filter === 'published' && !product.published) return false;
      if (filter === 'drafts' && product.published) return false;
      if (filter === 'featured' && !product.featured) return false;
      if (
        q &&
        !`${product.name} ${product.slug} ${product.categoryName}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [products, filter, search]);

  const patch = async (
    product: Product,
    body: Partial<Pick<Product, 'published' | 'featured' | 'status'>>
  ) => {
    setBusy(product.id);
    setError('');
    setNotice('');
    try {
      await adminRequest(`/admin/products/${product.id}/flags`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? { ...item, ...body } : item))
      );
      setNotice(`Updated ${product.name}.`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof AdminApiError
          ? requestError.message
          : 'Could not update the product.'
      );
    } finally {
      setBusy(null);
    }
  };

  const remove = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete “${product.name}”? This removes the product, its features, screenshots, FAQs, changelog, and launch notifications. This cannot be undone.`
    );
    if (!confirmed) return;

    setBusy(product.id);
    setError('');
    setNotice('');
    try {
      await adminRequest(`/admin/products/${product.id}`, { method: 'DELETE' });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setNotice(`Deleted ${product.name}.`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof AdminApiError
          ? requestError.message
          : 'Could not delete the product.'
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:flex-row sm:items-center">
        <label className="relative flex flex-1 items-center">
          <span className="sr-only">Search products</span>
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-ink-faint"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, slug, or category…"
            className="field h-10 pl-9 text-[0.82rem]"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                'rounded-lg border px-2.5 py-1.5 text-[0.74rem] font-medium transition-colors',
                filter === item.value
                  ? 'border-accent/40 bg-accent/12 text-accent-soft'
                  : 'border-white/10 bg-white/[0.03] text-ink-muted hover:text-white'
              )}
            >
              {item.label}
              <span className="ml-1.5 text-[0.64rem] text-ink-faint">
                {item.value === 'all'
                  ? products.length
                  : item.value === 'published'
                    ? products.filter((p) => p.published).length
                    : item.value === 'drafts'
                      ? products.filter((p) => !p.published).length
                      : products.filter((p) => p.featured).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mb-4">
          <AdminNotice type="error">{error}</AdminNotice>
        </div>
      ) : null}
      {notice ? (
        <div className="mb-4">
          <AdminNotice type="success">{notice}</AdminNotice>
        </div>
      ) : null}

      {filtered.length ? (
        <div className="overflow-hidden rounded-xl border border-white/[0.08]">
          <div className="hidden grid-cols-[minmax(0,1fr)_9rem_8rem_8rem_7rem] gap-3 border-b border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint lg:grid">
            <span>Product</span>
            <span>Category</span>
            <span>Status</span>
            <span>Visibility</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-white/[0.07]">
            {filtered.map((product) => (
              <li
                key={product.id}
                className="grid gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02] lg:grid-cols-[minmax(0,1fr)_9rem_8rem_8rem_7rem] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="truncate text-[0.88rem] font-semibold text-white hover:text-accent-soft"
                    >
                      {product.name}
                    </Link>
                    {product.featured ? (
                      <Star className="h-3.5 w-3.5 text-accent" aria-label="Featured" />
                    ) : null}
                    {!product.published ? (
                      <span className="rounded border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[0.6rem] font-semibold text-amber-300">
                        Draft
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-[0.7rem] text-ink-faint">
                    /products/{product.slug} · updated {formatDate(product.updatedAt)}
                  </p>
                </div>

                <p className="text-[0.76rem] text-ink-muted">{product.categoryName}</p>

                <div>
                  <label className="sr-only" htmlFor={`status-${product.id}`}>
                    Status for {product.name}
                  </label>
                  <select
                    id={`status-${product.id}`}
                    value={product.status}
                    disabled={busy === product.id}
                    onChange={(event) =>
                      patch(product, { status: event.target.value as ProductStatus })
                    }
                    className="field h-8 cursor-pointer py-0 text-[0.72rem]"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status} className="bg-[#0b0b10]">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => patch(product, { published: !product.published })}
                    disabled={busy === product.id}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[0.68rem] font-semibold transition-colors',
                      product.published
                        ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                        : 'border-white/10 bg-white/[0.04] text-ink-muted hover:text-white'
                    )}
                    aria-label={`${product.published ? 'Unpublish' : 'Publish'} ${product.name}`}
                  >
                    {busy === product.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    ) : null}
                    {product.published ? 'Published' : 'Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => patch(product, { featured: !product.featured })}
                    disabled={busy === product.id}
                    className={cn(
                      'rounded-md border p-1.5 transition-colors',
                      product.featured
                        ? 'border-accent/35 bg-accent/12 text-accent'
                        : 'border-white/10 bg-white/[0.04] text-ink-faint hover:text-white'
                    )}
                    aria-label={`${product.featured ? 'Unfeature' : 'Feature'} ${product.name}`}
                    title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <Star className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  {product.published ? (
                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      className="rounded-md border border-white/10 bg-white/[0.04] p-1.5 text-ink-faint transition-colors hover:text-white"
                      aria-label={`View ${product.name} on the website`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="rounded-md border border-white/10 bg-white/[0.04] p-1.5 text-ink-muted transition-colors hover:text-white"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(product)}
                    disabled={busy === product.id}
                    className="rounded-md border border-red-400/20 bg-red-400/[0.06] p-1.5 text-red-300 transition-colors hover:bg-red-400/15"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>

                <div className="flex items-center gap-2 lg:hidden">
                  <StatusBadge status={product.status} />
                  <span className="text-[0.68rem] text-ink-faint">{product.categoryName}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <AdminEmpty
          title={products.length ? 'No products match this view' : 'No products yet'}
          description={
            products.length
              ? 'Change the filter or clear the search to see more products.'
              : 'Create a product to populate the public directory.'
          }
          action={
            products.length ? (
              <button
                type="button"
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
                className="btn btn-secondary"
              >
                Clear filters
              </button>
            ) : (
              <Link href="/admin/products/new" className="btn btn-primary">
                <Plus className="h-4 w-4" aria-hidden /> New product
              </Link>
            )
          }
        />
      )}
    </div>
  );
}
