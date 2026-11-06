import { AdminPageHeader } from '@/components/admin/AdminUI';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { adminGet } from '@/lib/admin-server';
import type { AdminCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await adminGet<AdminCategory[]>('/api/admin/categories');

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Categories organise the product directory and drive the filters shown on the public products page."
      />
      {!categories ? (
        <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-[0.82rem] text-amber-200">
          Categories could not be loaded from the API. Check the backend connection.
        </div>
      ) : null}
      <CategoryManager initialCategories={categories || []} />
    </>
  );
}
