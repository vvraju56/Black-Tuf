import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '@/lib/products-api';
import { Order } from '@/types';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({ queryKey: ['order', id], queryFn: () => fetchOrder(id!), enabled: !!id });

  if (isLoading) return <div className="container mx-auto py-16">Loading order…</div>;
  if (isError || !data) return <div className="container mx-auto py-16">Order not found.</div>;

  const { order, childOrders } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeftIcon className="h-4 w-4 mr-1" />Back to orders</Link>
      <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
      <p className="text-sm text-muted-foreground mb-4">Placed on {formatDateTime(order.createdAt)}</p>

      <div className="flex items-center gap-2 mb-4"><Badge variant="secondary">{order.status.replace('_', ' ')}</Badge> <Badge variant="outline">{order.payment.method === 'cod' ? 'Cash on Delivery' : 'Online'}</Badge></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border p-3">
            <h2 className="font-medium mb-2">Items ({order.items.length})</h2>
            {order.items.map((it) => (
              <div key={it.product._id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <img src={it.product.images?.[0]} alt={it.product.name} className="h-12 w-12 rounded object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{it.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {it.quantity} × {formatPrice(it.price)}</p>
                </div>
                <strong>{formatPrice(it.total)}</strong>
              </div>
            ))}
          </div>

          {childOrders.length > 0 && (
            <div className="rounded-lg border p-3">
              <h2 className="font-medium mb-2">Items by Seller</h2>
              {childOrders.map((co) => (
                <div key={co._id} className="py-2 border-b last:border-0">
                  <p className="text-sm font-medium">Seller: {(co.seller as any)?.storeName || 'N/A'} — {co.items.length} item(s)</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-3">
            <h2 className="font-medium mb-2">Payment</h2>
            <p className="text-sm">{formatPrice(order.total)} via {order.payment.method === 'cod' ? 'Cash on Delivery' : order.payment.method}</p>
            <p className="text-xs text-muted-foreground capitalize">{order.payment.status}</p>
          </div>
          <div className="rounded-lg border p-3">
            <h2 className="font-medium mb-2">Shipping Address</h2>
            <address className="not-italic text-sm">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 && <><br />{order.shippingAddress.addressLine2}</>}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </address>
          </div>
          <div className="rounded-lg border p-3">
            <h2 className="font-medium mb-2">Price Summary</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">Subtotal: {formatPrice(order.subtotal)}</div>
              <div className="flex justify-between">Tax: {formatPrice(order.tax)}</div>
              <div className="flex justify-between">Shipping: {formatPrice(order.shippingFee)}</div>
              <div className="flex justify-between">Discount: -{formatPrice(order.discount)}</div>
              <div className="flex justify-between border-t pt-1 font-bold">Total: {formatPrice(order.total)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
