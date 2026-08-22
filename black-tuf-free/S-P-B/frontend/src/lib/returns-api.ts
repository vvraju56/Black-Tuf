import api from '@/lib/api';

export interface ReturnItem {
  orderItem: string;
  product: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  reason: string;
  description?: string;
  images?: string[];
  resolution: 'refund' | 'replace' | 'store_credit';
}

export interface ReturnRequest {
  _id: string;
  order: any;
  customer: any;
  seller: any;
  items: ReturnItem[];
  status: string;
  adminNote?: string;
  refundAmount?: number;
  pickupScheduledAt?: string;
  pickedUpAt?: string;
  receivedAt?: string;
  requestedAt: string;
  createdAt: string;
}

export const fetchCustomerReturns = async (): Promise<ReturnRequest[]> => {
  const { data } = await api.get('/returns/my');
  return data.data.returns || [];
};

export const createReturnRequest = async (payload: { orderId: string; items: any[] }) => {
  const { data } = await api.post('/returns', payload);
  return data.data.returnRequest;
};

export const fetchCustomerRefunds = async (): Promise<any[]> => {
  const { data } = await api.get('/returns/refunds');
  return data.data.refunds || [];
};

export const fetchSellerReturns = async (): Promise<ReturnRequest[]> => {
  const { data } = await api.get('/returns/seller');
  return data.data.returns || [];
};
