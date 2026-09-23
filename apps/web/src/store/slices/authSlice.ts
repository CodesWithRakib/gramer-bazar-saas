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
  isLoginModalOpen: boolean;
}

const getInitialState = (): AuthState => {
  let initialToken = null;
  if (typeof window !== 'undefined') {
    initialToken = localStorage.getItem('access_token') || null;
  }
  return {
    user: null,
    accessToken: initialToken,
    isAuthenticated: !!initialToken,
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
      action: PayloadAction<{ user: unknown; accessToken?: string }>
    ) => {
      state.user = normalizeUser(action.payload.user);
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', action.payload.accessToken);
        }
      }
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
    },
    setLoginModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isLoginModalOpen = action.payload;
    },
    setUser: (state, action: PayloadAction<unknown>) => {
      state.user = normalizeUser(action.payload);
      state.isAuthenticated = true; // If user is set via /auth/me, we are authenticated
    }
  },
});

export const { setCredentials, logout, setLoginModalOpen, setUser } = authSlice.actions;
export default authSlice.reducer;
