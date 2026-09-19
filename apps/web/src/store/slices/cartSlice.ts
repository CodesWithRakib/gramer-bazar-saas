import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  sellerProductId: string;
  quantity: number;
  maxQuantity?: number;
  // Local cache of product details for UI rendering without waiting for backend
  price: number;
  nameEn: string;
  nameBn: string;
  image: string;
  sellerNameEn?: string;
  sellerNameBn?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(i => i.sellerProductId === action.payload.sellerProductId);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.isOpen = true; // Automatically open cart when adding
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.sellerProductId !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ sellerProductId: string, quantity: number }>) => {
      const item = state.items.find(i => i.sellerProductId === action.payload.sellerProductId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;
