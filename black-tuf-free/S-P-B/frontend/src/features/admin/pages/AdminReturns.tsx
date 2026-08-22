import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listAdminReturns, updateReturnStatus } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'secondary' => {
  if (['refunded', 'refund_processing'].includes(s)) return 'success';
  if (s === 'rejected' || s === 'cancelled') return 'danger';
  if (s === 'approved') return 'success';
  if (['pending', 'in_review'].includes(s)) return 'warning';
  return 'secondary';
};

const actionMap: { status: string; action: string; label: string }[] = [
  { status: 'pending', action: 'approve', label: 'Approve' },
  { status: 'in_review', action: 'approve', label: 'Approve' },
  { status: 'pending', action: 'reject', label: 'Reject' },
  { status: 'in_review', action: 'reject', label: 'Reject' },
  { status: 'approved', action: 'schedule-pickup', label: 'Schedule Pickup' },
  { status: 'pickup_scheduled', action: 'picked-up', label: 'Mark Picked Up' },
  { status: 'picked_up', action: 'receive', label: 'Mark Received' },
  { status: 'received', action: 'process-refund', label: 'Process Refund' },
  { status: 'refund_processing', action: 'refund', label: 'Refund' },
];

const resolutionLabel = (r: string) =>
  r === 'refund' ? 'Refund' : r === 'replace' ? 'Replace' : r === 'store_credit' ? 'Store Credit' : r;

export const AdminReturns = () => {
  const qc = useQueryClient();
  const { data: returns = [], isLoading } = useQuery({ queryKey: ['admin-returns'], queryFn: listAdminReturns });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-returns'] });
    qc.invalidateQueries({ queryKey: ['admin-refunds'] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, action, payload }: { id: string; action: string; payload?: any }) => updateReturnStatus(id, action, payload || {}),
    onSuccess: (_data, vars) => {
      toast.success(`Return ${vars.action.replace(/-/g, ' ')}`);
      invalidate();
    },
    onError: () => toast.error('Failed to update return'),
  });

  const handleAction = (r: any, action: string) => {
    if (action === 'reject') {
      const reason = window.prompt('Rejection reason:');
      if (reason === null) return;
      statusMutation.mutate({ id: r._id, action, payload: { reason } });
      return;
    }
    if (action === 'schedule-pickup') {
      const when = window.prompt('Pickup scheduled at (YYYY-MM-DD HH:mm or ISO):', new Date().toISOString().slice(0, 16));
      if (when === null) return;
      statusMutation.mutate({ id: r._id, action, payload: { pickupScheduledAt: when } });
      return;
    }
    statusMutation.mutate({ id: r._id, action });
  };

  if (isLoading) return <div className="container mx-auto py-16">Loading returns…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <RotateCcw className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Returns</h1>
      </div>

      <div className="space-y-4">
        {(returns as any[]).map((r) => (
          <div key={r._id} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Order #{r.order?.orderNumber || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {r.customer?.name || 'N/A'} · requested {r.requestedAt ? formatDate(r.requestedAt) : r.createdAt ? formatDate(r.createdAt) : '—'}
                </p>
              </div>
              <Badge variant={statusVariant(r.status)}>{r.status?.replace(/_/g, ' ') || 'N/A'}</Badge>
            </div>

            {r.items?.length > 0 && (
              <div className="mt-4 space-y-2">
                {(r.items as any[]).map((it, i) => (
                  <div key={i} className="rounded-lg bg-white/5 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{it.title || 'Item'}</p>
                      <p className="text-xs text-muted-foreground">Qty {it.quantity ?? 0}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Reason: {it.reason || '—'} · Resolution: {it.resolution ? resolutionLabel(it.resolution) : '—'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {r.adminNote && (
              <p className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                <span className="text-muted-foreground">Admin note: </span>{r.adminNote}
              </p>
            )}

            {r.pickupScheduledAt && (
              <p className="mt-2 text-xs text-muted-foreground">Pickup scheduled: {formatDate(r.pickupScheduledAt)}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {actionMap.filter((a) => a.status === r.status).map((a) => (
                <Button
                  key={a.action}
                  size="sm"
                  variant={a.action === 'reject' ? 'ghost' : 'outline'}
                  className={a.action === 'reject' ? 'text-danger' : a.action === 'approve' ? 'text-success' : ''}
                  onClick={() => handleAction(r, a.action)}
                  loading={statusMutation.isPending && statusMutation.variables?.id === r._id}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {returns.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-muted-foreground">
            No return requests found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReturns;
