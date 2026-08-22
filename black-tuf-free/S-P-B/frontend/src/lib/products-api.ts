import { ApiResponse, Pagination } from '@/types';
import api from '@/lib/api';
import { Category, Product, Cart, Order, Address, CouponResult } from '@/types';

export interface ProductsParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  category?: string;
  subcategory?: string;
  brand?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  discount?: boolean;
  tags?: string;
  q?: string;
  isFeatured?: boolean;
  isFlashSale?: boolean;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/categories');
  return data.data.categories;
};

export const fetchCategoryTree = async () => {
  const { data } = await api.get('/categories/tree');
  return data.data.categories;
};

export const fetchProducts = async (params: ProductsParams = {}): Promise<{ products: Product[]; pagination: Pagination }> => {
  const { data } = await api.get('/products', { params });
  return { products: data.data.products, pagination: data.pagination };
};

export const fetchProduct = async (slug: string): Promise<{ product: Product; reviews: any[] }> => {
  const { data } = await api.get(`/products/${slug}`);
  return data.data;
};

export const searchProducts = async (q: string): Promise<{ products: Product[]; suggestions: string[] }> => {
  const { data } = await api.get('/products/search', { params: { q } });
  return data.data;
};

export const fetchCart = async (): Promise<Cart> => {
  const { data } = await api.get('/cart');
  return data.data.cart;
};

export const addToCart = async (payload: { productId: string; variant?: { name: string; value: string }; quantity?: number }): Promise<Cart> => {
  const { data } = await api.post('/cart', payload);
  return data.data.cart;
};

export const updateCartItem = async (productId: string, payload: { quantity: number; variant?: string }): Promise<Cart> => {
  const { data } = await api.put(`/cart/${productId}`, payload);
  return data.data.cart;
};

export const removeCartItem = async (productId: string): Promise<Cart> => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data.data.cart;
};

export const clearCart = async (): Promise<Cart> => {
  const { data } = await api.delete('/cart');
  return data.data.cart;
};

export const fetchAddresses = async (): Promise<Address[]> => {
  const { data } = await api.get('/addresses');
  return data.data.addresses;
};

export const addAddress = async (payload: Omit<Address, '_id' | 'user' | 'createdAt' | 'updatedAt'>): Promise<Address> => {
  const { data } = await api.post('/addresses', payload);
  return data.data.address;
};

export const updateAddress = async (id: string, payload: Partial<Address>): Promise<Address> => {
  const { data } = await api.put(`/addresses/${id}`, payload);
  return data.data.address;
};

export const setDefaultAddress = async (id: string): Promise<Address> => {
  const { data } = await api.patch(`/addresses/${id}/default`);
  return data.data.address;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/addresses/${id}`);
};

export const validateOrderTotals = async (payload: { items: { price: number; quantity: number }[]; couponCode?: string }): Promise<CouponResult> => {
  const { data } = await api.post('/orders/validate', payload);
  return data.data;
};

export const createOrder = async (payload: {
  shippingAddress: Address;
  paymentMethod: string;
  couponCode?: string;
}): Promise<{ order: Order; orderNumber: string; grandTotal: number }> => {
  const { data } = await api.post('/orders', payload);
  return data.data;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders');
  return data.data.orders;
};

export const fetchOrder = async (id: string): Promise<{ order: Order; childOrders: Order[] }> => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
};

export const cancelOrder = async (id: string, reason?: string): Promise<Order> => {
  const { data } = await api.put(`/orders/${id}/cancel`, { reason });
  return data.data.order;
};

export const fetchOrderStatuses = async (): Promise<string[]> => {
  const { data } = await api.get('/orders/statuses');
  return data.data.statuses;
};

export const fetchWishlist = async (): Promise<Product[]> => {
  const { data } = await api.get('/marketplace/wishlist');
  return data.data.products;
};

export const addToWishlist = async (productId: string) => api.post(`/marketplace/wishlist/${productId}`);
export const removeFromWishlist = async (productId: string) => api.delete(`/marketplace/wishlist/${productId}`);

export interface Review {
  _id: string;
  product: string;
  customer: { _id: string; name: string; avatar?: string };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: string;
  createdAt: string;
}

export const addReview = async (payload: { productId: string; rating: number; title?: string; comment: string; images?: string[] }) => {
  const { data } = await api.post('/marketplace/reviews', payload);
  return data.data.review;
};

export const fetchProductReviews = async (productIdOrSlug: string): Promise<Review[]> => {
  const { data } = await api.get(`/marketplace/reviews/${productIdOrSlug}`);
  return data.data.reviews;
};
