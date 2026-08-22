import api from '@/lib/api';
import { Product, Order, Seller } from '@/types';

export interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  activeSellers: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  platformCommission: number;
  pendingSellerPayouts: number;
  pendingSellers: number;
  pendingProducts: number;
  refundAmount: number;
}

interface DashboardResponse { stats: DashboardStats; charts: { salesByMonth: any[]; newCustomers: any[] } }

export const fetchDashboardStats = async (): Promise<DashboardResponse> => {
  const { data } = await api.get('/admin/dashboard');
  return data.data;
};

export const listCustomers = async (): Promise<any[]> => {
  const { data } = await api.get('/admin/customers');
  return data.data.users || [];
};

export const listSellers = async (): Promise<Seller[]> => {
  const { data } = await api.get('/admin/sellers');
  return data.data.sellers || [];
};

export const approveSeller = async (id: string) => api.put(`/admin/sellers/${id}/approve`);
export const rejectSeller = async (id: string, reason?: string) => api.put(`/admin/sellers/${id}/reject`, { reason });
export const suspendSeller = async (id: string) => api.put(`/admin/sellers/${id}/suspend`);

export const listAdminProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('/admin/products');
  return data.data.products || [];
};

export const approveProduct = async (id: string) => api.put(`/admin/products/${id}/approve`);
export const rejectProduct = async (id: string, reason?: string) => api.put(`/admin/products/${id}/reject`, { reason });

export const listAdminOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/admin/orders');
  return data.data.orders || [];
};

export const updateOrderStatus = async (id: string, status: string) => api.put(`/admin/orders/${id}/status`, { status });

export const listAdminPayments = async (): Promise<any[]> => {
  const { data } = await api.get('/admin/payments');
  return data.data.payments || [];
};

export const refundPayment = async (orderId: string, amount?: number, reason?: string) => api.post('/payments/refund', { orderId, amount, reason });

export const listPayouts = async () => {
  const { data } = await api.get('/admin/payouts');
  return data.data.payouts || [];
};

export const processPayout = async (id: string, status: string) => api.put(`/admin/payouts/${id}/process`, { status });

export const listCoupons = async () => {
  const { data } = await api.get('/admin/coupons');
  return data.data.coupons || [];
};

export const createCoupon = async (payload: any) => api.post('/admin/coupons', payload);
export const updateCoupon = async (id: string, payload: any) => api.put(`/admin/coupons/${id}`, payload);
export const deleteCoupon = async (id: string) => api.delete(`/admin/coupons/${id}`);

export const listAdminBanners = async () => {
  const { data } = await api.get('/admin/banners');
  return data.data.banners || [];
};

export const createBanner = async (payload: any) => api.post('/admin/banners', payload);
export const updateBanner = async (id: string, payload: any) => api.put(`/admin/banners/${id}`, payload);
export const deleteBanner = async (id: string) => api.delete(`/admin/banners/${id}`);

export const listAdminReturns = async (): Promise<any[]> => {
  const { data } = await api.get('/returns/admin/list');
  return data.data.returns || [];
};

export const updateReturnStatus = async (id: string, action: string, payload: any = {}) => api.put(`/returns/admin/${id}/${action}`, payload);

export const listAdminRefunds = async (): Promise<any[]> => {
  const { data } = await api.get('/returns/admin/refunds');
  return data.data.refunds || [];
};

export const listAdminReviews = async () => {
  const { data } = await api.get('/admin/reviews');
  return data.data.reviews || [];
};

export const moderateReview = async (id: string, status: string) => api.put(`/admin/reviews/${id}/moderate`, { status });

export const listSupportTickets = async () => {
  const { data } = await api.get('/admin/support-tickets');
  return data.data.tickets || [];
};

export const assignTicket = async (id: string) => api.put(`/admin/support-tickets/${id}/assign`);
export const respondTicketAdmin = async (id: string, message: string, status?: string) => api.post(`/admin/support-tickets/${id}/respond`, { message, status });

export const listAuditLogs = async () => {
  const { data } = await api.get('/admin/audit-logs');
  return data.data.logs || [];
};

export const fetchSettings = async () => {
  const { data } = await api.get('/admin/settings');
  return data.data.settings;
};

export const updateSettings = async (payload: any) => {
  const { data } = await api.put('/admin/settings', payload);
  return data.data.settings;
};

export const listAdminCategories = async () => {
  const { data } = await api.get('/admin/categories');
  return data.data.categories || [];
};

export const createCategory = async (payload: any) => api.post('/admin/categories', payload);
