import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listAdminOrders, updateOrderStatus } from '@/lib/admin-api';
import { ORDER_STATUSES } from '@/lib/constants';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Save } from 'lucide-react';

const statusVariant = (status: string): 'success' | 'danger' | 'warning' | 'secondary' => {
  const entry = ORDER_STATUSES.find((s) => s.value === status);
  if (entry?.color === 'success') return 'success';
  if (entry?.color === 'danger') return 'danger';
  if (entry?.color === 'warning') return 'warning';
  return 'secondary';
};

export const AdminOrders = () => {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['admin-orders'], queryFn: listAdminOrders });
  const [tab, setTab] = useState('all');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const distinctStatuses = Array.from(new Set((orders as any[]).map((o) => o.status))).filter(Boolean);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: () => toast.error('Failed to update order status'),
  });

  const filtered = (orders as any[]).filter((o) => (tab === 'all' ? true : o.status === tab));

  if (isLoading) return <div className="container mx-auto py-16">Loading orders…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Orders</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTab('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${tab === 'all' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
        >
          All
        </button>
        {distinctStatuses.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${tab === s ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Order Status</th>
              <th className="px-4 py-3 font-medium">Placed</th>
              <th className="px-4 py-3 font-medium">Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">#{o.orderNumber}</td>
                <td className="px-4 py-3">{o.customer?.name || 'N/A'}</td>
                <td className="px-4 py-3">{o.items?.length ?? 0}</td>
                <td className="px-4 py-3">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="capitalize text-muted-foreground">{o.payment?.method || 'N/A'}</span>
                    <Badge variant={o.payment?.status === 'paid' ? 'success' : o.payment?.status === 'failed' ? 'danger' : 'warning'}>
                      {o.payment?.status || 'N/A'}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={statusVariant(o.status)}>{o.status?.replace(/_/g, ' ') || 'N/A'}</Badge></td>
                <td className="px-4 py-3">{o.createdAt ? formatDateTime(o.createdAt) : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Select
                      className="w-40"
                      value={drafts[o._id] ?? o.status}
                      onChange={(e) => setDrafts((d) => ({ ...d, [o._id]: e.target.value }))}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(drafts[o._id] ?? o.status) === o.status}
                      onClick={() => updateMutation.mutate({ id: o._id, status: drafts[o._id] ?? o.status })}
                    >
                      <Save className="mr-1 h-4 w-4" />Save
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
