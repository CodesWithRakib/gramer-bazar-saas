import { api } from "../../store/api";

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
  sellerProduct?: {
    product: {
      nameEn: string;
      nameBn: string;
      images: string[];
    }
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
  items?: OrderItem[];
  statusHistory?: OrderStatusHistoryItem[];
  address?: {
    id: string;
    title: string;
    streetAddress: string;
    contactName: string;
    contactPhone: string;
  };
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
    getAdminOrders: builder.query<{ data: Order[]; meta: any }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/orders/admin/all',
        params,
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useGetAdminOrdersQuery,
} = ordersApi;
