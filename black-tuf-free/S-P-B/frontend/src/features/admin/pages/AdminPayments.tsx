import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listAdminPayments, refundPayment } from '@/lib/admin-api';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { Wallet, RotateCcw } from 'lucide-react';

const payVariant = (s: string): 'success' | 'danger' | 'warning' | 'secondary' =>
  s === 'paid' ? 'success' : s === 'failed' ? 'danger' : s === 'refunded' || s === 'partially_refunded' ? 'secondary' : 'warning';

export const AdminPayments = () => {
  const qc = useQueryClient();
  const { data: payments = [], isLoading } = useQuery({ queryKey: ['admin-payments'], queryFn: listAdminPayments });

  const refundMutation = useMutation({
    mutationFn: ({ orderId, amount, reason }: { orderId: string; amount: number; reason?: string }) =>
      refundPayment(orderId, amount, reason),
    onSuccess: () => {
      toast.success('Refund processed');
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => toast.error('Failed to process refund'),
  });

  const handleRefund = (o: any) => {
    const current = o.payment?.amount ?? o.total ?? 0;
    const amountStr = window.prompt('Refund amount:', String(current));
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid refund amount');
      return;
    }
    const reason = window.prompt('Reason for refund:') || undefined;
    refundMutation.mutate({ orderId: o._id, amount, reason });
  };

  if (isLoading) return <div className="container mx-auto py-16">Loading payments…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Payments</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Paid At</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(payments as any[]).map((o) => (
              <tr key={o._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">#{o.orderNumber}</td>
                <td className="px-4 py-3">{o.customer?.name || 'N/A'}</td>
                <td className="px-4 py-3">{formatPrice(o.payment?.amount ?? o.total ?? 0)}</td>
                <td className="px-4 py-3 capitalize">{o.payment?.method || 'N/A'}</td>
                <td className="px-4 py-3"><Badge variant={payVariant(o.payment?.status)}>{o.payment?.status || 'N/A'}</Badge></td>
                <td className="px-4 py-3">{o.payment?.paidAt ? formatDateTime(o.payment.paidAt) : o.createdAt ? formatDateTime(o.createdAt) : '—'}</td>
                <td className="px-4 py-3">
                  {o.payment?.status === 'paid' && (
                    <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleRefund(o)}>
                      <RotateCcw className="mr-1 h-4 w-4" />Refund
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
