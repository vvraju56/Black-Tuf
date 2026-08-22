import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';

interface WishlistState {
  items: Product[];
}

const initialState: WishlistState = {
  items: JSON.parse(localStorage.getItem('wishlist') || '[]'),
};

const save = (items: Product[]) => localStorage.setItem('wishlist', JSON.stringify(items));

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    add(state, action: PayloadAction<Product>) {
      if (!state.items.find((p) => p._id === action.payload._id)) state.items.push(action.payload);
      save(state.items);
    },
    remove(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p._id !== action.payload);
      save(state.items);
    },
    hydrate(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
      save(state.items);
    },
    clear(state) {
      state.items = [];
      save([]);
    },
  },
});

export const { add, remove, hydrate, clear } = wishlistSlice.actions;
export default wishlistSlice.reducer;
