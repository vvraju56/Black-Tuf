import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchProduct, addReview, fetchProductReviews, addToWishlist as addToWishlistApi, removeFromWishlist as removeFromWishlistApi } from '@/lib/products-api';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { add as addWishlist, remove as removeWishlist } from '@/store/wishlistSlice';
import { RatingStars } from '@/components/common/RatingStars';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { HeartIcon, ShoppingCartIcon, SendIcon, StarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().min(1, 'Comment is required').max(2000),
});

export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug!),
    enabled: !!slug,
    staleTime: 60000,
  });

  const reviewForm = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, title: '', comment: '' } });
  const addReviewMutation = useMutation({ mutationFn: addReview, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] }); reviewForm.reset(); toast.success('Review submitted'); } });
  const reviewsData = useQuery({ queryKey: ['product-reviews', slug], queryFn: () => fetchProductReviews(slug!), enabled: !!slug, staleTime: 30000 });
  const wishlistItems = useAppSelector((s) => s.wishlist.items);

  if (isLoading) return <div className="container mx-auto py-16">Loading…</div>;
  if (isError || !data) return <div className="container mx-auto py-16 text-center">Product not found.</div>;

  const { product, reviews: embeddedReviews } = data;
  const reviews = reviewsData.data && reviewsData.data.length ? reviewsData.data : embeddedReviews;
  const inWishlist = wishlistItems.some((p) => p._id === product._id);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const handleAdd = () => {
    addItem(product._id, quantity);
  };

  const handleBuy = () => {
    addItem(product._id, quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = (v: { rating: number; title?: string; comment: string }) => {
    addReviewMutation.mutate({ productId: product._id, rating: v.rating, title: v.title, comment: v.comment });
  };

  const handleToggleWishlist = async () => {
    if (inWishlist) {
      await removeFromWishlistApi(product._id);
      dispatch(removeWishlist(product._id));
    } else {
      await addToWishlistApi(product._id);
      dispatch(addWishlist(product));
    }
  };

  const canBuy = product.stock > 0;
  const maxQty = product.maximumOrderQuantity || product.stock || 1;
  const qtyOptions = Array.from({ length: Math.min(maxQty, 10) }, (_, i) => i + 1);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
            <img src={product.images?.[selectedImage] || product.images?.[0] || '/placeholder.png'} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {product.images?.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`h-16 w-16 shrink-0 rounded border overflow-hidden ${i === selectedImage ? 'ring-2 ring-primary' : ''}`}>
                <img src={img} alt={`${product.name} ${i}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground uppercase">{product.brand}</p>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <RatingStars rating={product.ratings} reviewCount={product.reviewCount} showCount />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
            {discount !== null && <span className="text-sm font-medium text-danger">({discount}% off)</span>}
          </div>
          {product.stock === 0 ? (
            <p className="text-danger font-medium">Out of stock</p>
          ) : (
            <p className="text-sm text-success">In stock ({product.stock} available)</p>
          )}
          <p className="text-sm text-muted-foreground">{product.shortDescription || product.description.slice(0, 160)}…</p>

          {product.variants && product.variants.length > 0 ? (
            <div className="space-y-2">
              {product.variants.map((v) => (
                <div key={v.name} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{v.name}:</span>
                  {v.options.map((opt) => (
                    <button key={opt} className="rounded border px-2 py-1 text-xs hover:bg-muted">{opt}</button>
                  ))}
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <Select value={String(quantity)} onChange={(e) => setQuantity(Number(e.target.value))} className="w-16">
              {qtyOptions.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </Select>
            <Button onClick={handleAdd} disabled={!canBuy} className="flex-1">
              <ShoppingCartIcon className="h-5 w-5 mr-1" /> Add to cart
            </Button>
            <Button variant="secondary" onClick={handleBuy} disabled={!canBuy}>
              Buy now
            </Button>
            {user && (
              <button
                onClick={handleToggleWishlist}
                className="rounded-full p-2 hover:bg-muted"
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <HeartIcon className={`h-5 w-5 ${inWishlist ? 'fill-danger text-danger' : 'text-muted-foreground'}`} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Return policy: {product.returnPolicy || '30-day returns'}</span>
            <span className="mx-1">·</span>
            <span>Warranty: {product.warranty || 'None'}</span>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-bold mb-3">Description</h2>
        <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>
      </div>

      {product.specifications && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-3">Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(product.specifications).map(([k, v]) => (
              <div key={k} className="flex"><span className="font-medium mr-2">{k}:</span><span>{v}</span></div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold mb-3">Reviews ({reviews.length})</h2>
          <StarIcon className="h-5 w-5 text-amber-400" />
        </div>
        {user && (
          <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="mb-4 rounded-lg border p-3 space-y-3">
            <p className="text-sm font-medium">Write a review</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => reviewForm.setValue('rating', n)} className="p-1">
                  <StarIcon className={`h-5 w-5 ${reviewForm.getValues('rating') >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
            <Input {...reviewForm.register('title')} label="Title" placeholder="Optional" />
            <Textarea {...reviewForm.register('comment')} label="Review" placeholder="Share your experience" />
            <Button type="submit" loading={addReviewMutation.isPending} size="sm">Submit review</Button>
          </form>
        )}
        {reviews.length === 0 ? <p className="text-sm text-muted-foreground">No reviews yet.</p> : (
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r._id} className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <RatingStars rating={r.rating} />
                  <span className="font-medium text-sm">{r.customer?.name}</span>
                  {r.isVerifiedPurchase && <span className="text-xs text-success">Verified Purchase</span>}
                </div>
                <p className="text-sm mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
