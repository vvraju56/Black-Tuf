import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchSellerStats, fetchSellerOrders, fetchSellerDailySales } from '@/lib/seller-api';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Package, ShoppingBag, IndianRupee, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Order } from '@/types';

const orderVariant = (s: string) => {
  if (['delivered'].includes(s)) return 'success';
  if (['cancelled', 'refunded', 'returned'].includes(s)) return 'danger';
  if (['pending'].includes(s)) return 'secondary';
  if (['return_requested'].includes(s)) return 'warning';
  return 'outline';
};

export const SellerAnalytics = () => {
  const { data: stats, isLoading } = useQuery({ queryKey: ['seller-stats'], queryFn: fetchSellerStats });
  const { data: dailySales = [] } = useQuery({ queryKey: ['seller-daily-sales'], queryFn: fetchSellerDailySales });
  const { data: orders = [] } = useQuery({ queryKey: ['seller-orders'], queryFn: fetchSellerOrders });

  if (isLoading) return <div className="container mx-auto py-16">Loading analytics…</div>;
  const s = stats!;

  const chartData = (dailySales || []).map((d: any, i: number) => ({
    name: d.date || d.day || d.label || d._id || `Day ${i + 1}`,
    sales: Number(d.sales ?? d.revenue ?? d.total ?? 0),
  }));

  const topOrders = [...orders].sort((a, b) => b.total - a.total).slice(0, 10);

  const statCards = [
    { label: 'Total Products', value: String(s.totalProducts), icon: <Package className="h-5 w-5" /> },
    { label: 'Total Orders', value: String(s.totalOrders), icon: <ShoppingBag className="h-5 w-5" /> },
    { label: 'Total Revenue', value: formatPrice(s.totalEarnings), icon: <IndianRupee className="h-5 w-5" /> },
    { label: 'Pending Orders', value: String(s.pendingOrders), icon: <Clock className="h-5 w-5" /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="mb-6 text-sm text-muted-foreground">Track your store performance.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{c.icon}</div>
            <p className="text-xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Daily Sales</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#23242d" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#111218', border: '1px solid #23242d', borderRadius: 8 }} />
                  <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Top Orders</h2>
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
              </tr>
            </thead>
            <tbody>
              {topOrders.map((o: Order) => (
                <tr key={o._id} className="border-t border-white/10">
                  <td className="p-3 font-medium">#{o.orderNumber}</td>
                  <td className="p-3">{o.customer?.name || 'N/A'}</td>
                  <td className="p-3">{formatPrice(o.total)}</td>
                  <td className="p-3"><Badge variant={orderVariant(o.status)}>{o.status.replace(/_/g, ' ')}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">{timeAgo(o.createdAt)}</td>
                </tr>
              ))}
              {topOrders.length === 0 && (
                <tr className="border-t border-white/10">
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <TrendingUp className="mx-auto mb-2 h-6 w-6" />
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SellerAnalytics;
