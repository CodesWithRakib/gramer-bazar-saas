/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { useLazyGetProfileQuery } from '@/features/auth/authApi';
import { setUser, logout } from './slices/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { token, user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [getProfile] = useLazyGetProfileQuery();

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const userData = await getProfile().unwrap();
          dispatch(setUser(userData));
        } catch (error) {
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
