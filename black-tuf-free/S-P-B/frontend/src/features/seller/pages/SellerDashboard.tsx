import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchSellerStats, fetchSellerOrders, fetchSellerDailySales, updateSellerOrderItemStatus } from '@/lib/seller-api';
import { ORDER_STATUSES } from '@/lib/constants';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'react-hot-toast';
import { Package, Plus, ShoppingBag, IndianRupee, Clock, Wallet, TrendingUp, Truck, ArrowRight } from 'lucide-react';
import { Order } from '@/types';

const orderLabel = (s: string) => ORDER_STATUSES.find((o) => o.value === s)?.label || s.replace(/_/g, ' ');

const orderVariant = (s: string) => {
  if (['delivered'].includes(s)) return 'success';
  if (['cancelled', 'refunded', 'returned'].includes(s)) return 'danger';
  if (['pending'].includes(s)) return 'secondary';
  if (['return_requested'].includes(s)) return 'warning';
  return 'outline';
};

export const SellerDashboard = () => {
  const qc = useQueryClient();
  const { data: stats, isLoading } = useQuery({ queryKey: ['seller-stats'], queryFn: fetchSellerStats });
  const { data: orders = [] } = useQuery({ queryKey: ['seller-orders'], queryFn: fetchSellerOrders });
  const { data: dailySales = [] } = useQuery({ queryKey: ['seller-daily-sales'], queryFn: fetchSellerDailySales });

  const shipMutation = useMutation({
    mutationFn: (id: string) => updateSellerOrderItemStatus(id, 'shipped'),
    onSuccess: () => {
      toast.success('Order marked as shipped');
      qc.invalidateQueries({ queryKey: ['seller-orders'] });
      qc.invalidateQueries({ queryKey: ['seller-stats'] });
    },
    onError: () => toast.error('Failed to update order'),
  });

  if (isLoading) return <div className="container mx-auto py-16">Loading dashboard…</div>;
  const s = stats!;

  const chartData = (dailySales || []).map((d: any, i: number) => ({
    name: d.date || d.day || d.label || d._id || `Day ${i + 1}`,
    sales: Number(d.sales ?? d.revenue ?? d.total ?? 0),
  }));

  const statCards = [
    { label: 'Total Products', value: String(s.totalProducts), icon: <Package className="h-5 w-5" /> },
    { label: 'Total Orders', value: String(s.totalOrders), icon: <ShoppingBag className="h-5 w-5" /> },
    { label: 'Total Revenue', value: formatPrice(s.totalEarnings), icon: <IndianRupee className="h-5 w-5" /> },
    { label: 'Pending Orders', value: String(s.pendingOrders), icon: <Clock className="h-5 w-5" /> },
    { label: 'Available Balance', value: formatPrice(s.availableBalance), icon: <Wallet className="h-5 w-5" /> },
    { label: 'Pending Balance', value: formatPrice(s.pendingBalance), icon: <TrendingUp className="h-5 w-5" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/seller/products"><Button size="sm" variant="outline">My Products</Button></Link>
          <Link to="/seller/add-product"><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Product</Button></Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{c.icon}</div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Sales Overview</h2>
          <Link to="/seller/analytics" className="flex items-center text-sm text-primary hover:underline">View analytics <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#23242d" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#111218', border: '1px solid #23242d', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" fill="url(#salesGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <Link to="/seller/orders" className="flex items-center text-sm text-primary hover:underline">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="p-3 text-left font-medium">Order</th>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Total</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Placed</th>
                <th className="p-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o: Order) => (
                <tr key={o._id} className="border-t border-white/10">
                  <td className="p-3 font-medium">#{o.orderNumber}</td>
                  <td className="p-3">{o.customer?.name || 'N/A'}</td>
                  <td className="p-3">{formatPrice(o.total)}</td>
                  <td className="p-3"><Badge variant={orderVariant(o.status)}>{orderLabel(o.status)}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">{timeAgo(o.createdAt)}</td>
                  <td className="p-3">
                    {(o.status === 'processing' || o.status === 'packed') && (
                      <Button size="sm" variant="outline" loading={shipMutation.isPending && shipMutation.variables === o._id} onClick={() => shipMutation.mutate(o._id)}>
                        <Truck className="mr-1 h-3.5 w-3.5" /> Mark Shipped
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr className="border-t border-white/10">
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link to="/seller/earnings"><Button variant="outline" size="sm">Earnings</Button></Link>
        <Link to="/seller/returns"><Button variant="outline" size="sm">Returns</Button></Link>
        <Link to="/seller/reviews"><Button variant="outline" size="sm">Reviews</Button></Link>
        <Link to="/seller/profile"><Button variant="outline" size="sm">Profile</Button></Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
