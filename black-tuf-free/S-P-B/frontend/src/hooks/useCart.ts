import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/lib/products-api';
import { CartItem } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const useCart = () => {
  const queryClient = useQueryClient();
  const [localCart, setLocalCart] = useLocalStorage<CartItem[]>('guestCart', []);

  const { data: cart, isLoading, isError, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: 60_000,
    retry: false,
    enabled: !!localStorage.getItem('accessToken'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const addMutation = useMutation({ mutationFn: addToCart, onSuccess: invalidate });
  const updateMutation = useMutation({ mutationFn: ({ productId, payload }: { productId: string; payload: { quantity: number; variant?: string } }) => updateCartItem(productId, payload), onSuccess: invalidate });
  const removeMutation = useMutation({ mutationFn: removeCartItem, onSuccess: invalidate });
  const clearMutation = useMutation({ mutationFn: clearCart, onSuccess: invalidate });

  const items = cart?.items || [];
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = (productId: string, quantity = 1, variant?: { name: string; value: string }) => {
    addMutation.mutate({ productId, quantity, variant });
  };

  const updateItem = (productId: string, quantity: number) => {
    updateMutation.mutate({ productId, payload: { quantity } });
  };

  const removeItem = (productId: string) => {
    removeMutation.mutate(productId);
  };

  const clear = () => clearMutation.mutate();

  return {
    cart,
    items,
    totalItems,
    subtotal,
    isLoading,
    isError,
    addItem,
    updateItem,
    removeItem,
    clear,
    refetch,
  };
};
