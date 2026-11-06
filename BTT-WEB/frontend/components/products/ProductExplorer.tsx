'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Category, Product, ProductStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUSES: ProductStatus[] = [
  'Active',
  'Beta',
  'Coming Soon',
  'Maintenance',
  'Archived',
];

const SORTS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name (A–Z)' },
] as const;

type SortValue = (typeof SORTS)[number]['value'];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function productHaystack(product: Product) {
  return normalize(
    [
      product.name,
      product.shortDescription,
      product.description,
      product.categoryName,
      product.status,
      ...product.technologies.map((tech) => tech.name),
      ...product.features.flatMap((feature) => [feature.title, feature.description]),
    ].join(' ')
  );
}

export function ProductExplorer({
  products,
  categories,
  initialSearch = '',
  initialCategory = '',
  initialStatus = '',
  initialFeatured = false,
  initialSort = 'featured',
}: {
  products: Product[];
  categories: Category[];
  initialSearch?: string;
  initialCategory?: string;
  initialStatus?: string;
  initialFeatured?: boolean;
  initialSort?: SortValue;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);
  const [featuredOnly, setFeaturedOnly] = useState(initialFeatured);
  const [sort, setSort] = useState<SortValue>(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  const availableStatuses = useMemo(() => {
    const present = new Set(products.map((product) => product.status));
    return STATUSES.filter((item) => present.has(item));
  }, [products]);

  // Keep the URL shareable without triggering a full navigation on each keystroke.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (featuredOnly) params.set('featured', 'true');
    if (sort !== 'featured') params.set('sort', sort);
    const query = params.toString();
    const next = query ? `/products?${query}` : '/products';
    window.history.replaceState(null, '', next);
  }, [search, category, status, featuredOnly, sort]);

  const results = useMemo(() => {
    const q = normalize(search);
    let filtered = products.filter((product) => {
      if (category && product.category?.slug !== category) return false;
      if (status && product.status !== status) return false;
      if (featuredOnly && !product.featured) return false;
      if (q && !productHaystack(product).includes(q)) return false;
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.order - b.order || a.name.localeCompare(b.name);
    });

    return filtered;
  }, [products, search, category, status, featuredOnly, sort]);

  const activeFilterCount =
    (category ? 1 : 0) + (status ? 1 : 0) + (featuredOnly ? 1 : 0);

  const clearAll = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setFeaturedOnly(false);
    setSort('featured');
  };

  return (
    <div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex flex-1 items-center">
            <span className="sr-only">Search products</span>
            <Search
              className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink-faint"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, technologies, features…"
              className="field pl-10 pr-10"
              autoComplete="off"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 rounded-md p-1 text-ink-faint transition-colors hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="btn btn-secondary min-h-[2.9rem] px-3.5 text-[0.82rem] lg:hidden"
              aria-expanded={showFilters}
              aria-controls="product-filters"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filters
              {activeFilterCount ? (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.62rem] font-bold text-[#180514]">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <label className="relative hidden lg:block">
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortValue)}
                className="field h-[2.9rem] w-44 cursor-pointer appearance-none pr-9"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#0b0b10]">
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
                ▾
              </span>
            </label>
          </div>
        </div>

        <div
          id="product-filters"
          className={cn(
            'flex-col gap-4 border-t border-white/[0.06] pt-4',
            showFilters ? 'mt-4 flex' : 'mt-4 hidden lg:flex'
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Category
            </span>
            <button
              type="button"
              onClick={() => setCategory('')}
              aria-pressed={!category}
              className={cn(
                'rounded-full border px-3 py-1 text-[0.74rem] font-medium transition-colors',
                !category
                  ? 'border-accent/40 bg-accent/12 text-accent-soft'
                  : 'border-white/10 bg-white/[0.03] text-ink-muted hover:border-white/20 hover:text-white'
              )}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.slug === category ? '' : item.slug)}
                aria-pressed={category === item.slug}
                className={cn(
                  'rounded-full border px-3 py-1 text-[0.74rem] font-medium transition-colors',
                  category === item.slug
                    ? 'border-accent/40 bg-accent/12 text-accent-soft'
                    : 'border-white/10 bg-white/[0.03] text-ink-muted hover:border-white/20 hover:text-white'
                )}
              >
                {item.name}
                <span className="ml-1.5 text-[0.62rem] text-ink-faint">{item.productCount}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Status
            </span>
            <button
              type="button"
              onClick={() => setStatus('')}
              aria-pressed={!status}
              className={cn(
                'rounded-full border px-3 py-1 text-[0.74rem] font-medium transition-colors',
                !status
                  ? 'border-accent/40 bg-accent/12 text-accent-soft'
                  : 'border-white/10 bg-white/[0.03] text-ink-muted hover:border-white/20 hover:text-white'
              )}
            >
              Any
            </button>
            {availableStatuses.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item === status ? '' : item)}
                aria-pressed={status === item}
                className={cn(
                  'rounded-full border px-3 py-1 text-[0.74rem] font-medium transition-colors',
                  status === item
                    ? 'border-accent/40 bg-accent/12 text-accent-soft'
                    : 'border-white/10 bg-white/[0.03] text-ink-muted hover:border-white/20 hover:text-white'
                )}
              >
                {item}
              </button>
            ))}

            <label className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[0.74rem] font-medium text-ink-muted transition-colors hover:text-white">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(event) => setFeaturedOnly(event.target.checked)}
                className="h-3.5 w-3.5 accent-[#ff79ee]"
              />
              Featured only
            </label>

            <label className="relative lg:hidden">
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortValue)}
                className="field h-8 w-40 cursor-pointer py-0 text-[0.74rem]"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#0b0b10]">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {activeFilterCount || search ? (
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto inline-flex items-center gap-1 text-[0.72rem] font-medium text-accent-soft transition-colors hover:text-white"
              >
                <X className="h-3 w-3" aria-hidden /> Clear all
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-[0.78rem] text-ink-faint">
          {results.length} {results.length === 1 ? 'product' : 'products'}
          {search ? (
            <>
              {' '}
              matching <span className="text-white">“{search}”</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="mt-5">
        <AnimatePresence mode="popLayout">
          {results.length ? (
            <motion.div
              layout
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {results.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.2) }}
                  className="h-full"
                >
                  <ProductCard product={product} priority={index < 3} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title={products.length ? 'No products match those filters.' : 'Products are coming soon.'}
              description={
                products.length
                  ? 'Try a broader search term, or clear the category and status filters.'
                  : "We're working on something new. Check back soon."
              }
              action={
                products.length ? (
                  <button type="button" onClick={clearAll} className="btn btn-secondary">
                    Clear filters
                  </button>
                ) : undefined
              }
              icon={<Search className="h-6 w-6" aria-hidden />}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
