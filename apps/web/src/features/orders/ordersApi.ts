import { api } from "../../store/api";
import { PaginationMeta } from "../catalog/catalogApi";

export interface OrderStatusHistoryItem {
  id: string;
  status: string;
  remark: string | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  sellerProductId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sellerProduct: {
    productVariant?: {
      nameEn: string;
      nameBn: string;
      images: string[];
      product: {
        id: string;
        slug: string;
        nameEn: string;
        nameBn: string;
      };
    };
  };
}

export interface Order {
  id: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryItem[];
  address: {
    id: string;
    title: string;
    streetAddress: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    contactName: string;
    contactPhone: string;
    lat?: number | string | null;
    lng?: number | string | null;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  sellerSubtotal?: number;
}

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => "/orders",
      providesTags: ["Order"],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    cancelOrder: builder.mutation<Order, string>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Order", id }, "Order"],
    }),
    checkoutOrder: builder.mutation<{ order: Order; paymentUrl: string | null }, { addressId: string, paymentMethod: string, items: { sellerProductId: string, quantity: number }[] }>({
      query: (body) => ({
        url: `/orders/checkout`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),
    getAdminOrders: builder.query<{ data: Order[]; meta: PaginationMeta }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/orders/admin/all',
        params,
      }),
      providesTags: ["Order"],
    }),
    updateAdminOrderStatus: builder.mutation<Order, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/admin/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }, "Order"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useCheckoutOrderMutation,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} = ordersApi;
