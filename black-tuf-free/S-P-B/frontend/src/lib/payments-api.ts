import api from '@/lib/api';

export interface RazorpayKey {
  keyId: string;
  mode: 'mock' | 'live';
}

export interface RazorpayOrderPayload {
  orderId: string;
  amount: number;
}

export interface RazorpayPaymentInfo {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name: string;
  description: string;
  razorpayOrderId?: string;
  prefill: { email?: string; contact?: string };
  theme: { color: string };
  mode: 'mock' | 'live';
}

export const fetchRazorpayKey = async (): Promise<RazorpayKey> => {
  const { data } = await api.get('/payments/key');
  return data.data;
};

export const createRazorpayPayment = async (payload: RazorpayOrderPayload): Promise<RazorpayPaymentInfo> => {
  const { data } = await api.post('/payments/create', payload);
  return data.data.payment;
};

export interface VerifyPayload {
  orderId: string;
  paymentId: string;
  signature: string;
  mode?: 'mock' | 'live';
}

export const verifyRazorpayPayment = async (payload: VerifyPayload) => {
  const { data } = await api.post('/payments/verify', payload);
  return data.data;
};
