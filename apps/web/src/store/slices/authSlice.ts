import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RoleRef {
  id?: string;
  name?: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  roles?: string[];
  [key: string]: unknown;
}

const normalizeRole = (r: unknown): string => {
  if (typeof r === 'string') return r;
  if (r && typeof r === 'object' && 'name' in r) {
    const name = (r as RoleRef).name;
    return typeof name === 'string' ? name : '';
  }
  return '';
};

const normalizeUser = (user: unknown): UserProfile | null => {
  if (!user || typeof user !== 'object') return null;
  const u = user as Record<string, unknown>;
  const roles = Array.isArray(u.roles) ? u.roles.map(normalizeRole).filter(Boolean) : [];
  return {
    ...(u as UserProfile),
    roles,
  };
};

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  isLoginModalOpen: boolean;
}

const getInitialState = (): AuthState => {
  let initialToken: string | null = null;
  let initialUser: UserProfile | null = null;
  if (typeof window !== 'undefined') {
    initialToken = localStorage.getItem('access_token') || null;
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        initialUser = normalizeUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore corrupted localStorage JSON
    }
  }
  return {
    user: initialUser,
    accessToken: initialToken,
    isAuthenticated: !!initialToken,
    isAuthInitialized: false,
    isLoginModalOpen: false,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: unknown; accessToken?: string; refreshToken?: string }>
    ) => {
      state.user = normalizeUser(action.payload.user);
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', action.payload.accessToken);
        }
      }
      if (action.payload.refreshToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('refresh_token', action.payload.refreshToken);
        }
      }
      if (typeof window !== 'undefined' && state.user) {
        localStorage.setItem('auth_user', JSON.stringify(state.user));
      }
      state.isAuthenticated = true;
      state.isAuthInitialized = true;
    },
    setUser: (state, action: PayloadAction<unknown>) => {
      state.user = normalizeUser(action.payload);
      state.isAuthenticated = !!state.user;
      state.isAuthInitialized = true;
      if (typeof window !== 'undefined') {
        if (state.user) {
          localStorage.setItem('auth_user', JSON.stringify(state.user));
        } else {
          localStorage.removeItem('auth_user');
        }
      }
    },
    setAuthInitialized: (state, action: PayloadAction<boolean>) => {
      state.isAuthInitialized = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isAuthInitialized = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
      }
    },
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLoginModalOpen = action.payload;
    },
  },
});

export const { setCredentials, setUser, setAuthInitialized, logout, setLoginModalOpen } = authSlice.actions;
export default authSlice.reducer;
