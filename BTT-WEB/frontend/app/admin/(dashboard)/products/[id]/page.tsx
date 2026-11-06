import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminNotice } from '@/components/admin/AdminUI';
import { ProductEditor } from '@/components/admin/ProductEditor';
import { adminGet } from '@/lib/admin-server';
import type { AdminCategory, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    adminGet<Product>(`/api/admin/products/${encodeURIComponent(id)}`),
    adminGet<AdminCategory[]>('/api/admin/categories'),
  ]);

  if (!product) notFound();

  return (
    <>
      {!categories ? (
        <div className="mb-4">
          <AdminNotice type="error">
            Categories could not be loaded. Saving may fail until the API is reachable.
          </AdminNotice>
        </div>
      ) : null}
      <Link
        href="/admin/products"
        className="mb-2 inline-flex items-center gap-1.5 text-[0.74rem] text-ink-muted transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All products
      </Link>
      <ProductEditor product={product} categories={categories || []} />
    </>
  );
}
