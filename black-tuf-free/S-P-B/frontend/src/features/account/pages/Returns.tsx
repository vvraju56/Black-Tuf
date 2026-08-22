import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchCustomerReturns, fetchCustomerRefunds, createReturnRequest, ReturnRequest } from '@/lib/returns-api';
import { fetchOrders } from '@/lib/products-api';
import { Order } from '@/types';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { toast } from 'react-hot-toast';
import { Package, RotateCcw, ArrowLeftRight } from 'lucide-react';

const returnReasons = ['Wrong item', 'Damaged', 'Defective', 'Size too small', 'Size too big', 'Changed my mind'];

const statusColor = (s: string) => {
  if (['approved', 'refunded', 'picked_up', 'received'].includes(s)) return 'text-success';
  if (['rejected', 'cancelled'].includes(s)) return 'text-danger';
  if (['pending', 'in_review'].includes(s)) return 'text-accent';
  return 'text-muted-foreground';
};

export const Returns = () => {
  const queryClient = useQueryClient();
  const { data: returns = [], isLoading } = useQuery({ queryKey: ['returns'], queryFn: fetchCustomerReturns, staleTime: 30000 });
  const { data: refunds = [] } = useQuery({ queryKey: ['refunds'], queryFn: fetchCustomerRefunds, staleTime: 60000 });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders, staleTime: 60000 });

  const [orderId, setOrderId] = useState('');
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [items, setItems] = useState<Record<string, { reason: string; resolution: string; quantity: number; description: string }>>({});
  const [showForm, setShowForm] = useState(false);

  const selectedOrder = orders.find((o: Order) => o._id === orderId);
  const returnableOrders = orders.filter((o: Order) => ['delivered', 'shipped', 'out_for_delivery'].includes(o.status));

  const openForm = (id: string) => {
    setOrderId(id);
    const o = orders.find((x: Order) => x._id === id);
    if (o) setOrderItems(o.items);
    setItems({});
    setShowForm(true);
  };

  const mutation = useMutation({
    mutationFn: () =>
      createReturnRequest({
        orderId,
        items: orderItems.map((it) => ({
          orderItem: it._id || it.product,
          product: typeof it.product === 'string' ? it.product : it.product._id,
          quantity: items[it._id || it.product]?.quantity || 1,
          reason: items[it._id || it.product]?.reason || 'Changed my mind',
          resolution: items[it._id || it.product]?.resolution || 'refund',
          description: items[it._id || it.product]?.description,
        })),
      }),
    onSuccess: () => {
      toast.success('Return request submitted');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
    onError: () => toast.error('Failed to submit return request'),
  });

  if (isLoading) return <div className="container mx-auto py-16">Loading returns…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Returns & Refunds</h1>
        <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          <RotateCcw className="mr-1 h-4 w-4" /> Request Return
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="mb-4 font-semibold">Start a return</h2>
          {!orderId ? (
            <div className="space-y-3">
              <Select value={orderId} onChange={(e) => openForm(e.target.value)} placeholder="Select a delivered order">
                {returnableOrders.map((o: Order) => (
                  <option key={o._id} value={o._id}>#{o.orderNumber} — {formatPrice(o.total)}</option>
                ))}
              </Select>
              {returnableOrders.length === 0 && <p className="text-sm text-muted-foreground">No delivered orders available to return.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Order <strong>#{selectedOrder?.orderNumber}</strong></span>
                <Button variant="ghost" size="sm" onClick={() => { setOrderId(''); setOrderItems([]); }}>Change</Button>
              </div>
              {orderItems.map((it) => {
                const pid = it._id || (typeof it.product === 'string' ? it.product : it.product._id);
                const sel = items[pid] || {};
                return (
                  <div key={pid} className="rounded-lg border border-white/10 p-4">
                    <div className="mb-2 flex items-center gap-3">
                      <img src={it.image} alt={it.title} className="h-12 w-12 rounded object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{it.title}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(it.price)} × {it.quantity}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Select value={sel.reason || ''} onChange={(e) => setItems((s) => ({ ...s, [pid]: { ...s[pid], reason: e.target.value } }))} placeholder="Reason">
                        {returnReasons.map((r) => <option key={r} value={r}>{r}</option>)}
                      </Select>
                      <Select value={sel.resolution || 'refund'} onChange={(e) => setItems((s) => ({ ...s, [pid]: { ...s[pid], resolution: e.target.value } }))}>
                        <option value="refund">Refund</option>
                        <option value="replace">Replace</option>
                        <option value="store_credit">Store credit</option>
                      </Select>
                      <Input type="number" min={1} max={it.quantity} value={sel.quantity || 1} onChange={(e) => setItems((s) => ({ ...s, [pid]: { ...s[pid], quantity: Number(e.target.value) } }))} label="Qty" />
                    </div>
                    <Textarea className="mt-2" rows={2} placeholder="Add details (optional)" value={sel.description || ''} onChange={(e) => setItems((s) => ({ ...s, [pid]: { ...s[pid], description: e.target.value } }))} />
                  </div>
                );
              })}
              <div className="flex gap-3">
                <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Submit Request</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold">Return Requests</h2>
      {returns.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No returns yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((r: ReturnRequest) => (
            <div key={r._id} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Requested {timeAgo(r.createdAt)}</span>
                <span className={`text-xs font-medium capitalize ${statusColor(r.status)}`}>{r.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="space-y-2">
                {r.items.map((it) => (
                  <div key={it.orderItem} className="flex items-center gap-3">
                    <img src={it.image} alt={it.title} className="h-10 w-10 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{it.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{it.reason} · {it.resolution}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              {r.refundAmount != null && <p className="mt-2 text-sm text-success">Refund: {formatPrice(r.refundAmount)}</p>}
              {r.adminNote && <p className="mt-2 text-xs text-muted-foreground">Note: {r.adminNote}</p>}
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-10 text-lg font-semibold">Refunds</h2>
      {refunds.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
          <ArrowLeftRight className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No refunds yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {refunds.map((f: any) => (
            <div key={f._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div>
                <p className="text-sm font-medium">{f.order?.orderNumber || 'Order refund'}</p>
                <p className="text-xs text-muted-foreground capitalize">{f.method || 'razorpay'} · {timeAgo(f.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success">{formatPrice(f.amount)}</p>
                <p className="text-xs text-muted-foreground capitalize">{f.status?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Questions? <Link to="/support" className="text-primary hover:underline">Open a support ticket</Link> or read our{' '}
        <Link to="/return-policy" className="text-primary hover:underline">return policy</Link>.
      </p>
    </div>
  );
};

export default Returns;
