import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export const Cart = () => {
  const { items, totalItems, subtotal, updateItem, removeItem, clear, isLoading } = useCart();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<string | null>(null);

  const updateQty = async (product: any, qty: number) => {
    if (qty <= 0) return;
    setUpdating(product._id);
    try {
      await updateItem(product._id, qty);
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) return <div className="container mx-auto py-16">Loading cart…</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})</h1>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link to="/products"><Button>Continue shopping</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const prod = item.product;
              const maxQty = prod.maximumOrderQuantity || prod.stock || 1;
              return (
                <div key={prod._id} className="flex items-center gap-4 rounded-lg border p-3">
                  <img src={prod.images?.[0]} alt={prod.name} className="h-16 w-16 rounded object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium">{prod.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                    {item.variant && <p className="text-xs text-muted-foreground">{item.variant.name}: {item.variant.value}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(prod, Math.max(0, item.quantity - 1))} disabled={updating === prod._id} className="rounded border p-1"><MinusIcon className="h-4 w-4" /></button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(prod, Math.min(item.quantity + 1, maxQty))} disabled={updating === prod._id || item.quantity >= maxQty} className="rounded border p-1"><PlusIcon className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => removeItem(prod._id)} className="text-danger"><TrashIcon className="h-5 w-5" /></button>
                </div>
              );
            })}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => clear()}>Clear cart</Button>
              <Link to="/products" className="text-sm text-primary hover:underline">Continue shopping</Link>
            </div>
          </div>
          <div className="rounded-lg border p-4 lg:sticky lg:top-4 h-fit">
            <h2 className="font-medium mb-2">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">Subtotal</div>
              <div className="flex justify-between">{formatPrice(subtotal)}</div>
              <div className="flex justify-between">Shipping</div>
              <div className="flex justify-between">—</div>
              <div className="flex justify-between">Tax</div>
              <div className="flex justify-between">—</div>
              <div className="flex justify-between border-t pt-2 font-bold">Total</div>
              <div className="flex justify-between font-bold">{formatPrice(subtotal)}</div>
            </div>
            <Button className="mt-4 w-full" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
