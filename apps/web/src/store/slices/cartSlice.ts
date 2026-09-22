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

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  couponId: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;
}

const CART_STORAGE_KEY = 'gramer-bazar-cart';

/** Read the persisted cart from localStorage. Safe on the server (returns null). */
export const loadCartFromStorage = (): {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
} | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      items?: CartItem[];
      appliedCoupon?: AppliedCoupon | null;
    };
    if (!Array.isArray(parsed.items)) return null;
    const items = parsed.items.filter(
      (i): i is CartItem =>
        !!i && typeof i.sellerProductId === 'string' && typeof i.quantity === 'number',
    );
    return { items, appliedCoupon: parsed.appliedCoupon ?? null };
  } catch {
    return null;
  }
};

/** Write the current cart slice to localStorage. Safe on the server. */
export const saveCartToStorage = (cart: Pick<CartState, 'items' | 'appliedCoupon'>): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items: cart.items, appliedCoupon: cart.appliedCoupon }),
    );
  } catch {
    // Storage unavailable/full — cart simply won't persist.
  }
};

const initialState: CartState = {
  items: [],
  isOpen: false,
  appliedCoupon: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Restore a persisted cart after mount (avoids SSR hydration mismatches).
    hydrateCart: (
      state,
      action: PayloadAction<{ items: CartItem[]; appliedCoupon: AppliedCoupon | null }>,
    ) => {
      state.items = action.payload.items;
      state.appliedCoupon = action.payload.appliedCoupon;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(i => i.sellerProductId === action.payload.sellerProductId);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.isOpen = true; // Automatically open cart when adding
      // If we add something, it might affect minimum order amount for a coupon, but we'll re-validate at checkout.
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.sellerProductId !== action.payload);
      // If cart becomes empty, remove coupon
      if (state.items.length === 0) {
        state.appliedCoupon = null;
      }
    },
    updateQuantity: (state, action: PayloadAction<{ sellerProductId: string, quantity: number }>) => {
      const item = state.items.find(i => i.sellerProductId === action.payload.sellerProductId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.appliedCoupon = null;
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    applyCoupon: (state, action: PayloadAction<AppliedCoupon>) => {
      state.appliedCoupon = action.payload;
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
    }
  },
});

export const { hydrateCart, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, setCartOpen, applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
