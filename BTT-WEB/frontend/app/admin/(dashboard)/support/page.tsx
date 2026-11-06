import { AdminPageHeader } from '@/components/admin/AdminUI';
import { InboxView, type InboxRecord, type InboxStatus } from '@/components/admin/Inbox';
import { adminGet } from '@/lib/admin-server';
import type { SupportRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUSES: InboxStatus[] = [
  { value: 'new', label: 'New', icon: 'new' },
  { value: 'in_progress', label: 'In progress', icon: 'progress' },
  { value: 'resolved', label: 'Resolved', icon: 'resolved' },
  { value: 'archived', label: 'Archived', icon: 'archive' },
];

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [requests, params] = await Promise.all([
    adminGet<SupportRequest[]>('/api/admin/support-requests'),
    searchParams,
  ]);

  const openParam = Array.isArray(params.open) ? params.open[0] : params.open;

  const records: InboxRecord[] = (requests || []).map((request) => ({
    id: request.id,
    name: request.name,
    email: request.email,
    subject: `${request.issueType}${request.productName ? ` — ${request.productName}` : ''}`,
    message: request.message,
    status: request.status,
    createdAt: request.createdAt,
    meta: [
      { label: 'Product', value: request.productName },
      { label: 'Issue type', value: request.issueType },
      { label: 'Attachment', value: request.attachmentName },
    ],
    attachmentUrl: request.attachmentUrl,
    attachmentName: request.attachmentName,
  }));

  return (
    <>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Support requests"
        description="Product support requests submitted through the public support form. Track progress, resolve, or archive each request."
      />
      {!requests ? (
        <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-[0.82rem] text-amber-200">
          Support requests could not be loaded from the API. Check the backend connection.
        </div>
      ) : null}
      <InboxView
        records={records}
        statuses={STATUSES}
        endpoint="/admin/support-requests"
        initialOpenId={openParam}
        emptyTitle="No support requests yet"
        emptyDescription="Requests sent through the support form will appear here."
        replyPrefix="Support:"
      />
    </>
  );
}
