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

      // If we already have a user in state (hydrated from localStorage), mark initialized immediately
      if (user) {
        if (isMounted) dispatch(setAuthInitialized(true));
        // Background verify to sync latest profile data
        if (storedToken) {
          getProfile().unwrap().then((profile) => {
            if (isMounted && profile) dispatch(setUser(profile));
          }).catch(() => {
            // Don't log out prematurely on network hiccup; api.ts 401 handler handles true expiration
          });
        }
        return;
      }

      // If a token exists in localStorage, attempt to load profile
      if (storedToken) {
        try {
          const profile = await getProfile().unwrap();
          if (isMounted && profile) {
            dispatch(setUser(profile));
          }
        } catch {
          // If profile fetch fails with 401, customBaseQuery in api.ts will have attempted refresh
          if (isMounted && !localStorage.getItem('access_token')) {
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
            // Let api.ts 401 handler manage logout
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
