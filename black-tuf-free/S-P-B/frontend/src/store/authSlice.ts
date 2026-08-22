import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { User } from '@/types';
import { setTokens, clearTokens, getCurrentUser, isAuthenticated } from '@/lib/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}

const storedUser = getCurrentUser();

const initialState: AuthState = {
  user: storedUser,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: isAuthenticated(),
  loading: false,
  status: storedUser ? 'authenticated' : 'unauthenticated',
};

export const login = createAsyncThunk('auth/login', async (payload: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', payload);
    return { user: data.data.user, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (payload: { name: string; email: string; password: string; role?: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return { user: data.data.user, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken, seller: data.data.seller };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data?.message || 'Unauthenticated');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
  clearTokens();
  return null;
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.status = action.payload ? 'authenticated' : 'unauthenticated';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.status = 'authenticated';
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'unauthenticated';
        clearTokens();
      })
      .addCase(login.pending, (state) => { state.loading = true; })
      .addCase(login.fulfilled, (state, action) => {
        setTokens(action.payload.accessToken, action.payload.refreshToken);
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.status = 'authenticated';
        state.loading = false;
      })
      .addCase(login.rejected, (state) => { state.loading = false; state.isAuthenticated = false; state.status = 'unauthenticated'; })
      .addCase(register.fulfilled, (state, action) => {
        if (action.payload.accessToken) {
          setTokens(action.payload.accessToken, action.payload.refreshToken);
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.status = 'authenticated';
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.status = 'unauthenticated';
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
