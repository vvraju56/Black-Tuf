import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchSellerOrders, updateSellerOrderItemStatus } from '@/lib/seller-api';
import { ORDER_STATUSES } from '@/lib/constants';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { Package } from 'lucide-react';
import { Order } from '@/types';

const orderLabel = (s: string) => ORDER_STATUSES.find((o) => o.value === s)?.label || s.replace(/_/g, ' ');

const orderVariant = (s: string) => {
  if (['delivered'].includes(s)) return 'success';
  if (['cancelled', 'refunded', 'returned'].includes(s)) return 'danger';
  if (['pending'].includes(s)) return 'secondary';
  if (['return_requested'].includes(s)) return 'warning';
  return 'outline';
};

export const SellerOrders = () => {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['seller-orders'], queryFn: fetchSellerOrders });
  const [filter, setFilter] = useState('all');
  const [drafts, setDrafts] = useState<Record<string, { status: string; trackingNumber: string }>>({});

  const statuses = Array.from(new Set(orders.map((o) => o.status)));
  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const draftFor = (o: Order) => drafts[o._id] || { status: o.status, trackingNumber: o.trackingNumber || '' };

  const setDraft = (id: string, patch: Partial<{ status: string; trackingNumber: string }>) =>
    setDrafts((d) => ({ ...d, [id]: { ...draftFor(orders.find((x) => x._id === id)!), ...patch } }));

  const updateMutation = useMutation({
    mutationFn: ({ id, status, trackingNumber }: { id: string; status: string; trackingNumber?: string }) => updateSellerOrderItemStatus(id, status, trackingNumber),
    onSuccess: () => {
      toast.success('Order updated');
      setDrafts({});
      qc.invalidateQueries({ queryKey: ['seller-orders'] });
      qc.invalidateQueries({ queryKey: ['seller-stats'] });
    },
    onError: () => toast.error('Failed to update order'),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-16">Loading orders…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mb-4 text-sm text-muted-foreground">{orders.length} order{orders.length === 1 ? '' : 's'}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${filter === 'all' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground'}`}
        >
          All ({orders.length})
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${filter === s ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground'}`}
          >
            {orderLabel(s)} ({orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No orders{filter !== 'all' ? ' in this status' : ''}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="p-3 text-left font-medium">Order</th>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Items</th>
                <th className="p-3 text-left font-medium">Total</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Placed</th>
                <th className="p-3 text-left font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: Order) => {
                const draft = draftFor(o);
                const unchanged = draft.status === o.status && draft.trackingNumber === (o.trackingNumber || '');
                return (
                  <tr key={o._id} className="border-t border-white/10">
                    <td className="p-3 font-medium">#{o.orderNumber}</td>
                    <td className="p-3">{o.customer?.name || 'N/A'}</td>
                    <td className="p-3">{o.items?.length || 0}</td>
                    <td className="p-3">{formatPrice(o.total)}</td>
                    <td className="p-3"><Badge variant={orderVariant(o.status)}>{orderLabel(o.status)}</Badge></td>
                    <td className="p-3 text-xs text-muted-foreground">{timeAgo(o.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Select
                          value={draft.status}
                          onChange={(e) => setDraft(o._id, { status: e.target.value })}
                          className="w-40"
                        >
                          {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </Select>
                        <Input
                          value={draft.trackingNumber}
                          onChange={(e) => setDraft(o._id, { trackingNumber: e.target.value })}
                          placeholder="Tracking #"
                          className="w-36"
                        />
                        <Button
                          size="sm"
                          disabled={unchanged}
                          loading={updateMutation.isPending && updateMutation.variables?.id === o._id}
                          onClick={() => updateMutation.mutate({ id: o._id, status: draft.status, trackingNumber: draft.trackingNumber || undefined })}
                        >
                          Save
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
