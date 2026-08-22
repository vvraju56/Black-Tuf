import { useQuery } from '@tanstack/react-query';
import { listAuditLogs } from '@/lib/admin-api';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ScrollText } from 'lucide-react';

const detailsText = (d: any): string => {
  if (d === undefined || d === null) return '—';
  if (typeof d === 'string') return d;
  return JSON.stringify(d);
};

export const AdminAuditLogs = () => {
  const { data: logs = [], isLoading } = useQuery({ queryKey: ['admin-audit-logs'], queryFn: listAuditLogs });

  if (isLoading) return <div className="container mx-auto py-16">Loading audit logs…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Audit Logs</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Admin</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Entity ID</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {(logs as any[]).map((l) => (
              <tr key={l._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{l.admin?.name || 'N/A'}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{l.action}</Badge>
                </td>
                <td className="px-4 py-3">{l.entity || '—'}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-xs text-muted-foreground">{l.entityId || '—'}</td>
                <td className="max-w-[260px] truncate px-4 py-3">{detailsText(l.details)}</td>
                <td className="px-4 py-3">{l.createdAt ? formatDateTime(l.createdAt) : '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No audit logs found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
