import { useQuery } from '@tanstack/react-query';
import { fetchSellerReturns, ReturnRequest } from '@/lib/returns-api';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { RotateCcw } from 'lucide-react';

const returnVariant = (s: string) => {
  if (['approved', 'refunded', 'received', 'picked_up'].includes(s)) return 'success';
  if (['rejected', 'cancelled'].includes(s)) return 'danger';
  if (['pending', 'in_review'].includes(s)) return 'warning';
  return 'outline';
};

export const SellerReturns = () => {
  const { data: returns = [], isLoading } = useQuery({ queryKey: ['seller-returns'], queryFn: fetchSellerReturns });

  if (isLoading) return <div className="container mx-auto px-4 py-16">Loading returns…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Returns</h1>
      <p className="mb-6 text-sm text-muted-foreground">Returns are reviewed and processed by our admin team.</p>

      {returns.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <RotateCcw className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No return requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((r: ReturnRequest) => (
            <div key={r._id} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">Order #{r.order?.orderNumber || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.customer?.name || 'N/A'} · requested {timeAgo(r.createdAt)}
                  </p>
                </div>
                <Badge variant={returnVariant(r.status)}>{String(r.status).replace(/_/g, ' ')}</Badge>
              </div>
              <div className="space-y-2">
                {r.items.map((it, i) => (
                  <div key={it.orderItem || i} className="flex items-center gap-3">
                    {it.image ? (
                      <img src={it.image} alt={it.title} className="h-12 w-12 rounded-lg border border-white/10 object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <RotateCcw className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {it.reason} · {it.resolution}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                {r.refundAmount != null && (
                  <span>Refund: <strong className="text-success">{formatPrice(r.refundAmount)}</strong></span>
                )}
                {r.pickupScheduledAt && <span>Pickup: {timeAgo(r.pickupScheduledAt)}</span>}
                {r.receivedAt && <span>Received: {timeAgo(r.receivedAt)}</span>}
              </div>
              {r.adminNote && (
                <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-muted-foreground">Admin note: {r.adminNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerReturns;
