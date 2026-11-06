import { AdminPageHeader } from '@/components/admin/AdminUI';
import { ServiceManager } from '@/components/admin/ServiceManager';
import { adminGet } from '@/lib/admin-server';
import type { Service } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  const services = await adminGet<Service[]>('/api/admin/services');

  return (
    <>
      <AdminPageHeader
        eyebrow="Offerings"
        title="Services"
        description="Manage the capability areas shown on the public services page. Only published services appear on the website."
      />
      {!services ? (
        <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-[0.82rem] text-amber-200">
          Services could not be loaded from the API. Check the backend connection.
        </div>
      ) : null}
      <ServiceManager initialServices={services || []} />
    </>
  );
}
