import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchSellerEarnings, requestPayout } from '@/lib/seller-api';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { Wallet, TrendingUp, Banknote, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const isNegativeTx = (t: any) =>
  ['debit', 'withdrawal', 'refund', 'fee', 'charge'].some((k) => String(t.type || t.category || t.description || '').toLowerCase().includes(k));

export const SellerEarnings = () => {
  const qc = useQueryClient();
  const { data: earnings, isLoading } = useQuery({ queryKey: ['seller-earnings'], queryFn: fetchSellerEarnings });
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (earnings?.pendingPayout && !amount) setAmount(String(earnings.pendingPayout));
  }, [earnings]);

  const payoutMutation = useMutation({
    mutationFn: () => requestPayout(Number(amount)),
    onSuccess: () => {
      toast.success('Payout requested');
      qc.invalidateQueries({ queryKey: ['seller-earnings'] });
      qc.invalidateQueries({ queryKey: ['seller-stats'] });
    },
    onError: () => toast.error('Failed to request payout'),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-16">Loading earnings…</div>;

  const wallet = earnings?.wallet || {};
  const transactions = wallet.transactions || [];
  const pendingPayout = (earnings?.pendingPayouts || []).reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0) || wallet.pendingBalance;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Earnings</h1>
      <p className="mb-6 text-sm text-muted-foreground">Track your wallet balance and request payouts.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><Wallet className="h-5 w-5" /></div>
          <p className="text-2xl font-bold">{formatPrice(Number(wallet.availableBalance) || 0)}</p>
          <p className="text-xs text-muted-foreground">Available Balance</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning"><TrendingUp className="h-5 w-5" /></div>
          <p className="text-2xl font-bold">{formatPrice(Number(wallet.pendingBalance) || 0)}</p>
          <p className="text-xs text-muted-foreground">Pending Balance</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Banknote className="h-5 w-5" /></div>
          <p className="text-2xl font-bold">{formatPrice(Number(pendingPayout) || 0)}</p>
          <p className="text-xs text-muted-foreground">Pending Payout</p>
          <div className="mt-3 flex gap-2">
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
            <Button size="sm" loading={payoutMutation.isPending} disabled={!amount || Number(amount) <= 0} onClick={() => payoutMutation.mutate()}>
              Request
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Transactions</h2>
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-muted-foreground backdrop-blur">
            No transactions yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-3 text-left font-medium">Description</th>
                  <th className="p-3 text-left font-medium">Type</th>
                  <th className="p-3 text-right font-medium">Amount</th>
                  <th className="p-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => {
                  const negative = isNegativeTx(t);
                  return (
                    <tr key={t._id || t.id} className="border-t border-white/10">
                      <td className="p-3">{t.description || t.title || 'Transaction'}</td>
                      <td className="p-3"><Badge variant={negative ? 'danger' : 'success'}>{String(t.type || t.category || 'other').replace(/_/g, ' ')}</Badge></td>
                      <td className={`p-3 text-right font-medium ${negative ? 'text-danger' : 'text-success'}`}>
                        <span className="inline-flex items-center gap-1">
                          {negative ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                          {negative ? '-' : '+'}{formatPrice(Number(t.amount) || 0)}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{timeAgo(t.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default SellerEarnings;
