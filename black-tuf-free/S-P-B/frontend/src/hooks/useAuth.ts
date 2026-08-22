import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login as loginThunk, register as registerThunk, logout as logoutThunk, fetchCurrentUser, setUser } from '@/store/authSlice';
import { updateProfile, changePassword } from '@/lib/auth';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; role?: 'customer' | 'seller'; }

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, accessToken, isAuthenticated, loading, status } = useAppSelector((s) => s.auth);
  const [loadingExplicit, setLoadingExplicit] = useState(false);

  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [accessToken, user, dispatch]);

  const login = async (payload: LoginPayload) => {
    setLoadingExplicit(true);
    try {
      await dispatch(loginThunk(payload)).unwrap();
    } finally {
      setLoadingExplicit(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoadingExplicit(true);
    try {
      const result = await dispatch(registerThunk(payload)).unwrap();
      return result;
    } finally {
      setLoadingExplicit(false);
    }
  };

  const logout = async () => {
    await dispatch(logoutThunk());
  };

  const refreshUser = async () => {
    if (accessToken) return dispatch(fetchCurrentUser());
    return null;
  };

  const updateUserProfile = async (payload: { name?: string; phone?: string }) => {
    const u = await updateProfile(payload);
    dispatch(setUser(u));
    return u;
  };

  const changeUserPassword = async (payload: { currentPassword: string; newPassword: string }) => {
    return changePassword(payload);
  };

  return {
    user,
    accessToken,
    loading: loadingExplicit || loading,
    authenticated: isAuthenticated,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isCustomer: user?.role === 'customer',
    status,
    login,
    register,
    logout,
    updateUserProfile,
    changeUserPassword,
    refreshUser,
  };
};
