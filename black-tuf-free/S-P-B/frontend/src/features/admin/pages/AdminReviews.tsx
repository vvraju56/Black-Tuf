import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { listAdminReviews, moderateReview } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { Star, Check, X } from 'lucide-react';

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'secondary' =>
  s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : s === 'pending' ? 'warning' : 'secondary';

const Stars = ({ rating }: { rating: number }) => {
  const r = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return <span className="text-amber-400">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>;
};

export const AdminReviews = () => {
  const qc = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({ queryKey: ['admin-reviews'], queryFn: listAdminReviews });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => moderateReview(id, status),
    onSuccess: (_data, vars) => {
      toast.success(`Review ${vars.status}`);
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => toast.error('Failed to moderate review'),
  });

  if (isLoading) return <div className="container mx-auto py-16">Loading reviews…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Star className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Reviews</h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Comment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(reviews as any[]).map((rv) => (
              <tr key={rv._id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{rv.product?.name || 'N/A'}</td>
                <td className="px-4 py-3">{rv.customer?.name || 'N/A'}</td>
                <td className="px-4 py-3"><Stars rating={rv.rating} /></td>
                <td className="max-w-[260px] truncate px-4 py-3">{rv.comment || '—'}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant(rv.status)}>{rv.status || 'N/A'}</Badge></td>
                <td className="px-4 py-3">{rv.createdAt ? formatDate(rv.createdAt) : '—'}</td>
                <td className="px-4 py-3">
                  {rv.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="text-success" onClick={() => moderateMutation.mutate({ id: rv._id, status: 'approved' })}>
                        <Check className="mr-1 h-4 w-4" />Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="text-danger" onClick={() => moderateMutation.mutate({ id: rv._id, status: 'rejected' })}>
                        <X className="mr-1 h-4 w-4" />Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No reviews found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviews;
