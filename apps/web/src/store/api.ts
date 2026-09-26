import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "./slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    let token = (getState() as { auth?: { accessToken?: string } }).auth?.accessToken;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('access_token') || undefined;
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const isPublicPath = (pathname: string): boolean => {
  // Strip locale prefix if present e.g. /en/products -> /products
  const pathWithoutLocale = pathname.replace(/^\/(?:en|bn)/, '') || '/';
  const publicPrefixes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/become-a-seller',
    '/become-a-rider',
    '/about',
    '/contact',
    '/privacy',
    '/faq',
    '/search',
    '/categories',
    '/products',
    '/cart',
    '/flash-sale',
    '/offers',
    '/shops',
  ];

  return publicPrefixes.some((prefix) =>
    prefix === '/' ? pathWithoutLocale === '/' : pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`)
  );
};

const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const url = typeof args === 'string' ? args : args.url;

  // Execute initial request
  let result = await rawBaseQuery(args, api, extraOptions);

  // If 401 Unauthorized occurs, handle token refresh gracefully
  if (result.error && result.error.status === 401) {
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/send-otp') ||
      url.includes('/auth/register');

    if (!isAuthEndpoint) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const storedRefreshToken =
            typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

          const refreshResult = await rawBaseQuery(
            {
              url: '/auth/refresh',
              method: 'POST',
              body: storedRefreshToken ? { refreshToken: storedRefreshToken } : undefined,
              headers: storedRefreshToken ? { 'x-refresh-token': storedRefreshToken } : undefined,
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            let data = refreshResult.data as Record<string, unknown>;
            if (data && 'success' in data && 'data' in data) {
              data = data.data as Record<string, unknown>;
            }

            const newAccessToken = (data.accessToken as string) || null;
            const newRefreshToken = (data.refreshToken as string) || null;
            const user = data.user;

            if (newAccessToken && user) {
              if (newRefreshToken && typeof window !== 'undefined') {
                localStorage.setItem('refresh_token', newRefreshToken);
              }
              api.dispatch(setCredentials({ accessToken: newAccessToken, refreshToken: newRefreshToken || undefined, user }));
              isRefreshing = false;
              onRefreshed(newAccessToken);

              // Retry original request with new token
              result = await rawBaseQuery(args, api, extraOptions);
            } else {
              throw new Error('Refresh response missing credentials');
            }
          } else {
            throw new Error('Refresh token rejected');
          }
        } catch {
          isRefreshing = false;
          onRefreshed(null);
          api.dispatch(logout());

          // Graceful redirect only on protected pages
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (!isPublicPath(currentPath)) {
              const lang = currentPath.startsWith('/bn') ? 'bn' : 'en';
              window.location.href = `/${lang}/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          }
        }
      } else {
        // Wait for the ongoing refresh to finish
        const retryToken = await new Promise<string | null>((resolve) => {
          addRefreshSubscriber((token) => resolve(token));
        });

        if (retryToken) {
          result = await rawBaseQuery(args, api, extraOptions);
        }
      }
    }
  }

  // Unwrap the globally formatted response: { success: true, data: { ... } }
  if (result.data && typeof result.data === 'object' && 'success' in result.data && 'data' in result.data) {
    result.data = (result.data as { data: unknown }).data;
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  tagTypes: [
    "Cart",
    "Wishlist",
    "Catalog",
    "Reviews",
    "User",
    "Address",
    "Location",
    "Order",
    "ProductRequest",
    "Review",
    "Notification",
    "Coupon",
    "Conversation",
    "Message",
    "Shop",
    "Banner",
    "Wallet",
    "WalletTransaction",
    "Payout",
    "Dispute",
    "FlashSale",
    "AuditLog",
    "Settings",
    "SellerApplication",
    "RiderApplication",
    "Payment",
  ],
  endpoints: () => ({}),
});
