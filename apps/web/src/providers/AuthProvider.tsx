'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setUser, setAuthInitialized, logout } from '@/store/slices/authSlice';
import { useLazyGetProfileQuery } from '@/features/auth/authApi';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthInitialized } = useSelector((state: RootState) => state.auth);
  const [getProfile] = useLazyGetProfileQuery();

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

      // If we already have a user in state, we are initialized
      if (user) {
        if (isMounted) dispatch(setAuthInitialized(true));
        return;
      }

      // If a token exists in localStorage (or browser might have session cookies), attempt to load profile
      if (storedToken) {
        try {
          const profile = await getProfile().unwrap();
          if (isMounted && profile) {
            dispatch(setUser(profile));
          }
        } catch {
          // If profile fetch fails and cannot be refreshed, user is unauthenticated
          if (isMounted) {
            dispatch(logout());
          }
        } finally {
          if (isMounted) {
            dispatch(setAuthInitialized(true));
          }
        }
      } else {
        if (isMounted) {
          dispatch(setAuthInitialized(true));
        }
      }
    };

    if (!isAuthInitialized) {
      initAuth();
    }

    // Cross-tab logout / login synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (!e.newValue) {
          dispatch(logout());
        } else {
          getProfile().unwrap().then((profile) => {
            if (profile) dispatch(setUser(profile));
          }).catch(() => {
            dispatch(logout());
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch, getProfile, isAuthInitialized, user]);

  return <>{children}</>;
}
