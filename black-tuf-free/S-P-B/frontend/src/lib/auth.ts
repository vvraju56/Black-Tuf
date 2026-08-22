import api, { getErrorResponse } from '@/lib/api';
import { User } from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'seller';
}

export const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  delete api.defaults.headers.common.Authorization;
};

export const register = async (payload: RegisterPayload): Promise<{ user: User }> => {
  const { data } = await api.post('/auth/register', payload);
  if (data.data.accessToken) {
    setTokens(data.data.accessToken, data.data.refreshToken);
  }
  return { user: data.data.user };
};

export const login = async (payload: LoginPayload): Promise<{ user: User }> => {
  const { data } = await api.post('/auth/login', payload);
  setTokens(data.data.accessToken || data.token, data.data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.data.user));
  return { user: data.data.user };
};

export const logout = async () => {
  await api.post('/auth/logout');
  clearTokens();
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get('/auth/me');
  localStorage.setItem('user', JSON.stringify(data.data.user));
  return data.data.user;
};

export const updateProfile = async (payload: { name?: string; phone?: string }): Promise<User> => {
  const { data } = await api.put('/auth/profile', payload);
  const user = data.data.user;
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  const { data } = await api.put('/auth/change-password', payload);
  return data;
};

export const verifyEmail = async (token: string) => {
  const { data } = await api.post('/auth/verify-email', { token });
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token: string, password: string) => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const { data } = await api.post('/auth/refresh-token', { refreshToken });
  return data.data.accessToken;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('user');
  return stored ? (JSON.parse(stored) as User) : null;
};

export { getErrorResponse };
