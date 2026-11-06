import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminNotice } from '@/components/admin/AdminUI';
import { ProductEditor } from '@/components/admin/ProductEditor';
import { adminGet } from '@/lib/admin-server';
import type { AdminCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await adminGet<AdminCategory[]>('/api/admin/categories');

  return (
    <>
      {!categories ? (
        <div className="mb-4">
          <AdminNotice type="error">
            Categories could not be loaded, so a product cannot be created yet. Check the API
            connection and create a category first.
          </AdminNotice>
        </div>
      ) : null}
      {categories && categories.length === 0 ? (
        <div className="mb-4">
          <AdminNotice type="info">
            No categories exist yet. <Link href="/admin/categories" className="underline">Create a category</Link>{' '}
            before adding a product.
          </AdminNotice>
        </div>
      ) : null}
      <Link
        href="/admin/products"
        className="mb-2 inline-flex items-center gap-1.5 text-[0.74rem] text-ink-muted transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All products
      </Link>
      <ProductEditor product={null} categories={categories || []} />
    </>
  );
}
