import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listSellers, approveSeller, rejectSeller, suspendSeller } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { Store, Check, X, Ban, UserCheck } from 'lucide-react';

const statusVariant = (status: string): 'success' | 'danger' | 'warning' | 'secondary' =>
  status === 'approved' ? 'success'
    : status === 'rejected' ? 'danger'
      : status === 'suspended' ? 'warning'
        : status === 'submitted' || status === 'under_review' ? 'warning'
          : 'secondary';

export const AdminSellers = () => {
  const qc = useQueryClient();
  const { data: sellers = [], isLoading } = useQuery({ queryKey: ['admin-sellers'], queryFn: listSellers });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-sellers'] });
    qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveSeller(id),
    onSuccess: () => { toast.success('Seller approved'); invalidate(); },
    onError: () => toast.error('Failed to approve seller'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectSeller(id, reason),
    onSuccess: () => { toast.success('Seller rejected'); invalidate(); },
    onError: () => toast.error('Failed to reject seller'),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => suspendSeller(id),
    onSuccess: () => { toast.success('Seller suspended'); invalidate(); },
    onError: () => toast.error('Failed to suspend seller'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => approveSeller(id),
    onSuccess: () => { toast.success('Seller activated'); invalidate(); },
    onError: () => toast.error('Failed to activate seller'),
  });

  const handleReject = (sl: any) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason === null) return;
    rejectMutation.mutate({ id: sl._id, reason: reason.trim() || undefined });
  };

  if (isLoading) return <div className="container mx-auto py-16">Loading sellers…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Store className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Sellers</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Store</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Commission</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(sellers as any[]).map((sl) => (
              <tr key={sl._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{sl.storeName || 'N/A'}</td>
                <td className="px-4 py-3">{sl.user?.name || 'N/A'}</td>
                <td className="px-4 py-3">{sl.user?.email || '—'}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant(sl.status)}>{sl.status || 'N/A'}</Badge></td>
                <td className="px-4 py-3">{sl.commission != null ? `${sl.commission}%` : '—'}</td>
                <td className="px-4 py-3">{sl.createdAt ? formatDate(sl.createdAt) : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {['submitted', 'under_review'].includes(sl.status) && (
                      <>
                        <Button size="sm" variant="outline" className="text-success" onClick={() => approveMutation.mutate(sl._id)}>
                          <Check className="mr-1 h-4 w-4" />Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleReject(sl)}>
                          <X className="mr-1 h-4 w-4" />Reject
                        </Button>
                      </>
                    )}
                    {sl.status !== 'suspended' && sl.status !== 'rejected' && (
                      <Button size="sm" variant="ghost" className="text-warning" onClick={() => suspendMutation.mutate(sl._id)}>
                        <Ban className="mr-1 h-4 w-4" />Suspend
                      </Button>
                    )}
                    {sl.status === 'suspended' && (
                      <Button size="sm" variant="outline" onClick={() => activateMutation.mutate(sl._id)}>
                        <UserCheck className="mr-1 h-4 w-4" />Activate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sellers.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No sellers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSellers;
