import { AdminPageHeader } from '@/components/admin/AdminUI';
import { InboxView, type InboxRecord, type InboxStatus } from '@/components/admin/Inbox';
import { adminGet } from '@/lib/admin-server';
import type { ContactMessage } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUSES: InboxStatus[] = [
  { value: 'new', label: 'New', icon: 'new' },
  { value: 'read', label: 'Read', icon: 'read' },
  { value: 'replied', label: 'Replied', icon: 'replied' },
  { value: 'archived', label: 'Archived', icon: 'archive' },
];

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [messages, params] = await Promise.all([
    adminGet<ContactMessage[]>('/api/admin/messages'),
    searchParams,
  ]);

  const openParam = Array.isArray(params.open) ? params.open[0] : params.open;

  const records: InboxRecord[] = (messages || []).map((message) => ({
    id: message.id,
    name: message.name,
    email: message.email,
    subject: message.subject,
    message: message.message,
    status: message.status,
    createdAt: message.createdAt,
    meta: [
      { label: 'Company', value: message.company },
      { label: 'Product', value: message.productName },
      { label: 'Project type', value: message.projectType },
      { label: 'Budget', value: message.budget },
    ],
  }));

  return (
    <>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact messages"
        description="Enquiries submitted through the public contact form. Reply by email, track the status, and archive records once handled."
      />
      {!messages ? (
        <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-4 py-3 text-[0.82rem] text-amber-200">
          Messages could not be loaded from the API. Check the backend connection.
        </div>
      ) : null}
      <InboxView
        records={records}
        statuses={STATUSES}
        endpoint="/admin/messages"
        initialOpenId={openParam}
        emptyTitle="No contact messages yet"
        emptyDescription="Messages sent through the contact form will appear here."
      />
    </>
  );
}
