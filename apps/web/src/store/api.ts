import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
    credentials: "include",
    prepareHeaders: (headers) => {
      // Tokens are now managed securely via HttpOnly cookies by the browser.
      return headers;
    },
  }),
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
