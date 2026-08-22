import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listAdminProducts, approveProduct, rejectProduct } from '@/lib/admin-api';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { Package, Check, X } from 'lucide-react';

const approvalVariant = (s: string): 'success' | 'danger' | 'warning' | 'secondary' =>
  s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : s === 'pending' ? 'warning' : 'secondary';

export const AdminProducts = () => {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ['admin-products'], queryFn: listAdminProducts });
  const [filter, setFilter] = useState('all');

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-products'] });
    qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveProduct(id),
    onSuccess: () => { toast.success('Product approved'); invalidate(); },
    onError: () => toast.error('Failed to approve product'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectProduct(id, reason),
    onSuccess: () => { toast.success('Product rejected'); invalidate(); },
    onError: () => toast.error('Failed to reject product'),
  });

  const handleReject = (p: any) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason === null) return;
    rejectMutation.mutate({ id: p._id, reason: reason.trim() || undefined });
  };

  const filtered = products.filter((p) => (filter === 'all' ? true : p.approvalStatus === filter));

  if (isLoading) return <div className="container mx-auto py-16">Loading products…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Products</h1>
        </div>
        <div className="w-full max-w-[220px]">
          <Select label="Approval Status" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Approval</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="max-w-[220px] truncate font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{(p.seller as any)?.storeName || 'N/A'}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{p.status || 'N/A'}</Badge></td>
                <td className="px-4 py-3"><Badge variant={approvalVariant(p.approvalStatus)}>{p.approvalStatus || 'N/A'}</Badge></td>
                <td className="px-4 py-3">
                  {p.approvalStatus === 'pending' && (
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" className="text-success" onClick={() => approveMutation.mutate(p._id)}>
                        <Check className="mr-1 h-4 w-4" />Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleReject(p)}>
                        <X className="mr-1 h-4 w-4" />Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
