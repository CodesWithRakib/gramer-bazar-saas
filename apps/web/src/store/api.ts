import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
    prepareHeaders: (headers) => {
      // Get token from localStorage (to be implemented securely later)
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
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
  ],
  endpoints: () => ({}),
});
