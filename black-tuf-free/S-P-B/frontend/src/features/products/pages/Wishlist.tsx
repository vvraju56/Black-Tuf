import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWishlist, removeFromWishlist } from '@/lib/products-api';
import { useAppDispatch } from '@/store/hooks';
import { remove } from '@/store/wishlistSlice';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { HeartIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

export const Wishlist = () => {
  const [page] = useState(1);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const { data: products = [], isLoading } = useQuery({ queryKey: ['wishlist', page], queryFn: () => fetchWishlist(), staleTime: 30000 });

  const removeMutation = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wishlist'] }); },
  });

  const handleRemove = async (product: Product) => {
    try {
      await removeMutation.mutateAsync(product._id);
      dispatch(remove(product._id));
    } catch {
      toast.error('Could not remove item');
    }
  };

  const handleMoveCart = (product: Product) => {
    addItem(product._id, 1);
    toast.success('Added to cart');
    handleRemove(product);
  };

  if (isLoading) return <div className="container mx-auto py-16">Loading…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {products.length === 0 ? (
        <div className="text-center py-16">
          <HeartIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your wishlist is empty.</p>
          <Link to="/products"><Button className="mt-4">Browse products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((p) => (
            <div key={p._id} className="relative rounded-xl border bg-card p-3">
              <button onClick={() => handleRemove(p)} className="absolute right-2 top-2 rounded-full bg-muted/40 p-1 hover:bg-muted" title="Remove">
                <XMarkIcon className="h-4 w-4" />
              </button>
              <Link to={`/product/${p.slug}`} className="block">
                <img src={p.images?.[0]} alt={p.name} className="aspect-[4/3] w-full rounded object-cover" />
                <h3 className="mt-2 text-sm font-medium line-clamp-1">{p.name}</h3>
              </Link>
              <div className="mt-2 flex items-center gap-2"><span className="font-semibold">{formatPrice(p.price)}</span>
                {p.compareAtPrice && p.compareAtPrice > p.price && <span className="text-xs text-muted-foreground line-through">{formatPrice(p.compareAtPrice)}</span>}
              </div>
              <Button size="sm" className="mt-2 w-full" variant="secondary" onClick={() => handleMoveCart(p)}>
                <ShoppingCartIcon className="h-4 w-4 mr-1" /> Move to cart
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
