import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth?: { accessToken?: string } }).auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  
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
  ],
  endpoints: () => ({}),
});
