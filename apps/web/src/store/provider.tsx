'use client';

import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { useLazyGetProfileQuery } from '@/features/auth/authApi';
import { setUser, logout } from './slices/authSlice';
import {
  hydrateCart,
  loadCartFromStorage,
  saveCartToStorage,
} from './slices/cartSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const cart = useSelector((state: RootState) => state.cart);
  const [getProfile] = useLazyGetProfileQuery();

  // Mark hydration completion once mounted (used by E2E tests to avoid
  // interacting with the SSR page before React state is live).
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
  }, []);

  // Hydrate the persisted cart once on mount (client only).
  useEffect(() => {
    const persisted = loadCartFromStorage();
    if (persisted && (persisted.items.length > 0 || persisted.appliedCoupon)) {
      dispatch(hydrateCart(persisted));
    }
  }, [dispatch]);

  // Persist cart on every change.
  useEffect(() => {
    saveCartToStorage({ items: cart.items, appliedCoupon: cart.appliedCoupon });
  }, [cart.items, cart.appliedCoupon]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const userData = await getProfile().unwrap();
          dispatch(setUser(userData));
        } catch {
          // If token is invalid or expired, log out
          dispatch(logout());
        }
      }
    };

    fetchUser();
  }, [token, user, dispatch, getProfile]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
