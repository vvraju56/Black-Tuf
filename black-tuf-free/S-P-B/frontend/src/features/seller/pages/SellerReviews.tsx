import { useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { fetchSellerProducts, fetchProductReviews, addSellerResponse } from '@/lib/seller-api';
import { timeAgo } from '@/lib/utils';
import { RatingStars } from '@/components/common/RatingStars';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { Star, MessageSquare } from 'lucide-react';
import { Review } from '@/types';

export const SellerReviews = () => {
  const qc = useQueryClient();
  const { data: sellerData, isLoading } = useQuery({ queryKey: ['seller-products'], queryFn: fetchSellerProducts });
  const products = sellerData?.products || [];

  const [productId, setProductId] = useState('');
  const [replies, setReplies] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productId && products.length) setProductId(products[0]._id);
  }, [products]);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['seller-product-reviews', productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
  });

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, text }: { reviewId: string; text: string }) => addSellerResponse(reviewId, text),
    onSuccess: (_d, vars) => {
      toast.success('Response posted');
      setReplies((r) => ({ ...r, [vars.reviewId]: '' }));
      qc.invalidateQueries({ queryKey: ['seller-product-reviews', productId] });
    },
    onError: () => toast.error('Failed to post response'),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-16">Loading reviews…</div>;

  const selectedProduct = products.find((p) => p._id === productId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <p className="mb-6 text-sm text-muted-foreground">Respond to customer feedback on your products.</p>

      <div className="mb-6 max-w-md">
        <Select label="Product" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Select a product">
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </Select>
      </div>

      {!productId ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Select a product to view its reviews.</p>
        </div>
      ) : reviewsLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
          <Star className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No reviews for <strong>{selectedProduct?.name || 'this product'}</strong> yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: Review) => {
            const response = (r as any).sellerResponse;
            const reply = replies[r._id] || '';
            return (
              <div key={r._id} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={r.rating} size="md" />
                    <span className="text-sm font-medium">{r.customer?.name || 'Customer'}</span>
                    {(r as any).isVerifiedPurchase && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Verified</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-sm">{r.comment}</p>
                {response && response.text && (
                  <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm">
                    <p className="mb-0.5 text-xs font-medium text-primary">Your response</p>
                    <p>{response.text}</p>
                  </div>
                )}
                {!response?.text && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      value={reply}
                      onChange={(e) => setReplies((s) => ({ ...s, [r._id]: e.target.value }))}
                      placeholder="Reply to this review…"
                    />
                    <Button
                      size="sm"
                      disabled={!reply.trim()}
                      loading={replyMutation.isPending && replyMutation.variables?.reviewId === r._id}
                      onClick={() => replyMutation.mutate({ reviewId: r._id, text: reply.trim() })}
                    >
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerReviews;
