import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminUI';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { adminGet } from '@/lib/admin-server';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Filter = 'all' | 'published' | 'drafts' | 'featured';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [products, params] = await Promise.all([
    adminGet<Product[]>('/api/admin/products'),
    searchParams,
  ]);

  const raw = Array.isArray(params.filter) ? params.filter[0] : params.filter;
  const filter: Filter = ['published', 'drafts', 'featured'].includes(raw || '')
    ? (raw as Filter)
    : 'all';

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Create, edit, publish, and feature products. Published products appear in the public directory immediately."
        actions={
          <Link href="/admin/products/new" className="btn btn-primary">
            <Plus className="h-4 w-4" aria-hidden /> New product
          </Link>
        }
      />
      {!products ? (
        <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-[0.82rem] text-amber-200">
          Products could not be loaded from the API. Check the backend connection.
        </div>
      ) : null}
      <ProductsTable initialProducts={products || []} initialFilter={filter} />
    </>
  );
}
