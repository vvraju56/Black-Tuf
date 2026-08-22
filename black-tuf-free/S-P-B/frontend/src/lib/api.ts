import axios from 'axios';
import { ApiError, ApiResponse } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return Promise.reject(error);
      }
      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => failedQueue.push({ resolve, reject }));
          return api(originalRequest);
        } catch (e) {
          return Promise.reject(e);
        }
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken }, { withCredentials: true });
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (!['/login', '/register', '/forgot-password', '/verify-email', '/reset-password'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorResponse = (err: unknown): ApiError => {
  if (axios.isAxiosError(err) && err.response) {
    return err.response.data as ApiError;
  }
  return { status: 'error', message: (err as Error)?.message || 'Something went wrong' };
};

export default api;
