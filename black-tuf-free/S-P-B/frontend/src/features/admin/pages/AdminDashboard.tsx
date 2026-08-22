import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  fetchDashboardStats,
  listSellers,
  listAdminProducts,
  approveSeller,
  rejectSeller,
  approveProduct,
  rejectProduct,
  DashboardStats,
} from '@/lib/admin-api';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Users,
  Store,
  UserCheck,
  Package,
  ShoppingBag,
  IndianRupee,
  ShieldAlert,
  Clock,
  Ticket,
  Star,
  Settings,
  Image as ImageIcon,
  LayoutGrid,
  RotateCcw,
  Headphones,
  ScrollText,
  Wallet,
  Check,
  X,
} from 'lucide-react';

const quickLinks = [
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/sellers', label: 'Sellers', icon: Store },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/payments', label: 'Payments', icon: Wallet },
  { to: '/admin/payouts', label: 'Payouts', icon: Clock },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/categories', label: 'Categories', icon: LayoutGrid },
  { to: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/support', label: 'Support', icon: Headphones },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

const tooltipStyle = { background: '#111218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 };

export const AdminDashboard = () => {
  const qc = useQueryClient();
  const { data: dash, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: fetchDashboardStats });
  const { data: sellers = [] } = useQuery({ queryKey: ['admin-sellers'], queryFn: listSellers });
  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: listAdminProducts });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    qc.invalidateQueries({ queryKey: ['admin-sellers'] });
    qc.invalidateQueries({ queryKey: ['admin-products'] });
  };

  const approveSellerMutation = useMutation({
    mutationFn: (id: string) => approveSeller(id),
    onSuccess: () => { toast.success('Seller approved'); invalidateAll(); },
    onError: () => toast.error('Failed to approve seller'),
  });

  const rejectSellerMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectSeller(id, reason),
    onSuccess: () => { toast.success('Seller rejected'); invalidateAll(); },
    onError: () => toast.error('Failed to reject seller'),
  });

  const approveProductMutation = useMutation({
    mutationFn: (id: string) => approveProduct(id),
    onSuccess: () => { toast.success('Product approved'); invalidateAll(); },
    onError: () => toast.error('Failed to approve product'),
  });

  const rejectProductMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectProduct(id, reason),
    onSuccess: () => { toast.success('Product rejected'); invalidateAll(); },
    onError: () => toast.error('Failed to reject product'),
  });

  const handleRejectSeller = (sl: any) => {
    const reason = window.prompt('Reason for rejecting this seller:');
    if (reason === null) return;
    rejectSellerMutation.mutate({ id: sl._id, reason: reason.trim() || undefined });
  };

  const handleRejectProduct = (p: any) => {
    const reason = window.prompt('Reason for rejecting this product:');
    if (reason === null) return;
    rejectProductMutation.mutate({ id: p._id, reason: reason.trim() || undefined });
  };

  if (isLoading) return <div className="container mx-auto py-16">Loading dashboard…</div>;
  const s: DashboardStats = dash!.stats;
  const salesData = (dash!.charts.salesByMonth || []).map((d: any) => ({
    name: d.x ?? d.month ?? d.label ?? d._id ?? '',
    sales: d.sales ?? d.revenue ?? d.value ?? 0,
  }));
  const customersData = (dash!.charts.newCustomers || []).map((d: any) => ({
    name: d.x ?? d.month ?? d.label ?? d._id ?? '',
    customers: d.count ?? d.customers ?? d.value ?? 0,
  }));

  const stats: { label: string; value: string | number; icon: React.ReactNode; warn?: boolean }[] = [
    { label: 'Total Users', value: s.totalUsers, icon: <Users className="h-5 w-5 text-primary" /> },
    { label: 'Total Sellers', value: s.totalSellers, icon: <Store className="h-5 w-5 text-primary" /> },
    { label: 'Active Sellers', value: s.activeSellers, icon: <UserCheck className="h-5 w-5 text-secondary" /> },
    { label: 'Total Products', value: s.totalProducts, icon: <Package className="h-5 w-5 text-primary" /> },
    { label: 'Total Orders', value: s.totalOrders, icon: <ShoppingBag className="h-5 w-5 text-primary" /> },
    { label: 'Revenue', value: formatPrice(s.revenue), icon: <IndianRupee className="h-5 w-5 text-success" /> },
    { label: 'Platform Commission', value: formatPrice(s.platformCommission), icon: <ShieldAlert className="h-5 w-5 text-secondary" /> },
    { label: 'Pending Seller Payouts', value: formatPrice(s.pendingSellerPayouts), icon: <Clock className="h-5 w-5 text-warning" /> },
    { label: 'Pending Sellers', value: s.pendingSellers, icon: <UserCheck className="h-5 w-5 text-warning" />, warn: true },
    { label: 'Pending Products', value: s.pendingProducts, icon: <Package className="h-5 w-5 text-warning" />, warn: true },
    { label: 'Refund Amount', value: formatPrice(s.refundAmount), icon: <RotateCcw className="h-5 w-5 text-danger" /> },
  ];

  const pendingSellers = (sellers as any[]).filter((sl) => ['submitted', 'under_review'].includes(sl.status));
  const pendingProducts = products.filter((p) => p.approvalStatus === 'pending');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="min-w-0">
              <p className="truncate text-xl font-bold">{st.value}</p>
              <p className="text-xs text-muted-foreground">{st.label}</p>
            </div>
            <div className="shrink-0 rounded-lg bg-white/5 p-2">{st.icon}</div>
            {st.warn && (Number(st.value) > 0) && <Badge variant="warning" className="shrink-0">{st.value}</Badge>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Sales By Month</h2>
          {salesData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No sales data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="url(#gradSales)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">New Customers By Month</h2>
          {customersData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No customer data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={customersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="customers" fill="url(#gradCustomers)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to}>
                <Button variant="outline" size="sm">
                  <Icon className="mr-1.5 h-4 w-4 text-primary" /> {q.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-bold mb-3">Sellers Pending Approval ({s.pendingSellers})</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingSellers.map((sl) => (
                <tr key={sl._id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{sl.storeName || sl.user?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{sl.user?.email || '—'}</td>
                  <td className="px-4 py-3"><Badge variant="warning">{sl.status}</Badge></td>
                  <td className="px-4 py-3">{sl.createdAt ? timeAgo(sl.createdAt) : '—'}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="mr-2 text-success" onClick={() => approveSellerMutation.mutate(sl._id)}>
                      <Check className="mr-1 h-4 w-4" />Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleRejectSeller(sl)}>
                      <X className="mr-1 h-4 w-4" />Reject
                    </Button>
                  </td>
                </tr>
              ))}
              {pendingSellers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No sellers awaiting approval</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold mb-3">Products Pending Approval ({s.pendingProducts})</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Seller</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProducts.map((p) => (
                <tr key={p._id} className="border-t border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{(p.seller as any)?.storeName || 'N/A'}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3"><Badge variant="warning">{p.approvalStatus}</Badge></td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="mr-2 text-success" onClick={() => approveProductMutation.mutate(p._id)}>
                      <Check className="mr-1 h-4 w-4" />Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleRejectProduct(p)}>
                      <X className="mr-1 h-4 w-4" />Reject
                    </Button>
                  </td>
                </tr>
              ))}
              {pendingProducts.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No products awaiting approval</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
