import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrders, cancelOrder as cancelOrderApi } from '@/lib/products-api';
import { Order } from '@/types';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export const Orders = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading, refetch } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders, staleTime: 30000 });

  const handleCancel = async (order: Order) => {
    const reason = prompt('Reason for cancellation (optional):') || '';
    try {
      await cancelOrderApi(order.orderNumber, reason);
      refetch();
    } catch {
      alert('Could not cancel order');
    }
  };

  const canCancel = (order: Order) => ['pending', 'confirmed', 'processing'].includes(order.status);

  if (isLoading) return <div className="container mx-auto py-16">Loading orders…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">You haven’t placed any orders.</p>
          <Link to="/products"><Button>Start shopping</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong>Order #{order.orderNumber}</strong>
                  <span className={`text-xs font-medium capitalize ${statusColor(order.status)}`}>{order.status.replace('_', ' ')}</span>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo(order.createdAt)}</span>
              </div>
              <div className="my-2 flex items-center gap-2 text-sm text-muted-foreground">
                {order.items.map((it) => (
                  <img key={it.product._id} src={it.product.images?.[0]} alt={it.product.name} className="h-10 w-10 rounded object-cover" />
                ))}
                <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total: <strong>{formatPrice(order.total)}</strong></span>
                {canCancel(order) && user?.role === 'customer' && (
                  <Button variant="outline" size="sm" onClick={() => handleCancel(order)}>Cancel</Button>
                )}
                <Link to={`/orders/${order.orderNumber}`} className="text-sm text-primary hover:underline">View details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const statusColor = (s: string) => {
  if (['delivered'].includes(s)) return 'text-success';
  if (['cancelled', 'refunded', 'returned'].includes(s)) return 'text-danger';
  if (['pending'].includes(s)) return 'text-muted-foreground';
  return 'text-accent';
};

export default Orders;
