import { AdminPageHeader } from '@/components/admin/AdminUI';
import { NotificationsTable } from '@/components/admin/NotificationsTable';
import { adminGet } from '@/lib/admin-server';
import type { ProductNotificationItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const notifications = await adminGet<ProductNotificationItem[]>('/api/admin/notifications');

  return (
    <>
      <AdminPageHeader
        eyebrow="Audience"
        title="Launch signups"
        description="Email addresses submitted for products that have not launched yet. Export the list to send a launch announcement from your own email tool."
      />
      {!notifications ? (
        <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-[0.82rem] text-amber-200">
          Launch signups could not be loaded from the API. Check the backend connection.
        </div>
      ) : null}
      <NotificationsTable notifications={notifications || []} />
    </>
  );
}
