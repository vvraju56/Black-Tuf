import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listPayouts, processPayout } from '@/lib/admin-api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { Banknote, Send } from 'lucide-react';

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'secondary' =>
  s === 'completed' ? 'success' : s === 'rejected' || s === 'failed' ? 'danger' : s === 'pending' ? 'warning' : 'secondary';

const payoutStatuses = [
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export const AdminPayouts = () => {
  const qc = useQueryClient();
  const { data: payouts = [], isLoading } = useQuery({ queryKey: ['admin-payouts'], queryFn: listPayouts });
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const processMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => processPayout(id, status),
    onSuccess: () => {
      toast.success('Payout processed');
      qc.invalidateQueries({ queryKey: ['admin-payouts'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: () => toast.error('Failed to process payout'),
  });

  if (isLoading) return <div className="container mx-auto py-16">Loading payouts…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Banknote className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Payouts</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Requested</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(payouts as any[]).map((p) => (
              <tr key={p._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{p.seller?.storeName || 'N/A'}</td>
                <td className="px-4 py-3">{formatPrice(p.amount)}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant(p.status)}>{p.status || 'N/A'}</Badge></td>
                <td className="px-4 py-3">{p.createdAt ? formatDate(p.createdAt) : '—'}</td>
                <td className="px-4 py-3">
                  {p.status !== 'completed' && p.status !== 'rejected' && p.status !== 'failed' && (
                    <div className="flex items-center gap-2">
                      <Select
                        className="w-40"
                        value={drafts[p._id] ?? 'processing'}
                        onChange={(e) => setDrafts((d) => ({ ...d, [p._id]: e.target.value }))}
                      >
                        {payoutStatuses.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => processMutation.mutate({ id: p._id, status: drafts[p._id] ?? 'processing' })}>
                        <Send className="mr-1 h-4 w-4" />Process
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No payouts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayouts;
