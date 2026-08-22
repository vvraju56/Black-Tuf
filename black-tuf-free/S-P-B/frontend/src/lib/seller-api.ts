import api from '@/lib/api';
import { Order, Product, Review } from '@/types';

export interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalEarnings: number;
  pendingOrders: number;
  availableBalance: number;
  pendingBalance: number;
}

export const fetchSellerProfile = async (): Promise<any> => {
  const { data } = await api.get('/seller/profile');
  return data.data.seller || data.data;
};

export const updateSellerProfile = async (payload: any) => {
  const { data } = await api.put('/seller/profile', payload);
  return data.data.seller;
};

export const fetchSellerStats = async (): Promise<SellerStats> => {
  const { data } = await api.get('/seller/dashboard');
  return data.data.stats;
};

export const fetchSellerDailySales = async (): Promise<any[]> => {
  const { data } = await api.get('/seller/dashboard');
  return data.data.dailySales || [];
};

export const fetchSellerProducts = async (): Promise<{ products: Product[]; pagination: any }> => {
  const { data } = await api.get('/seller/products');
  return { products: data.data.products || [], pagination: data.pagination };
};

export const createSellerProduct = async (payload: any) => {
  const { data } = await api.post('/products', payload);
  return data.data.product;
};

export const updateSellerProduct = async (id: string, payload: any) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.data.product;
};

export const deleteSellerProduct = async (id: string) => api.delete(`/products/${id}`);

export const fetchSellerOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/seller/orders');
  return data.data.orders || [];
};

export const updateSellerOrderItemStatus = async (id: string, status: string, trackingNumber?: string) => api.put(`/seller/orders/${id}/status`, { status, trackingNumber });

export const fetchSellerEarnings = async () => {
  const { data } = await api.get('/seller/earnings');
  return data.data;
};

export const requestPayout = async (amount: number) => api.post('/seller/payouts', { amount });

export const fetchProductReviews = async (productId: string): Promise<Review[]> => {
  const { data } = await api.get(`/seller/products/${productId}/reviews`);
  return data.data.reviews || [];
};

export const addSellerResponse = async (reviewId: string, text: string) => api.post(`/seller/reviews/${reviewId}/response`, { text });
