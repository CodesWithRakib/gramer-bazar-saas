import { api } from "../../store/api";
import { PaginationMeta } from "../catalog/catalogApi";
import { Order } from "../orders/ordersApi";

export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  provider: string;
  transactionId: string;
  amount: number | string;
  currency: string;
  status: 'PENDING' | 'INITIATED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
  gatewayStatus?: string | null;
  validationId?: string | null;
  bankTransactionId?: string | null;
  riskLevel?: string | null;
  riskTitle?: string | null;
  cardType?: string | null;
  cardBrand?: string | null;
  cardIssuer?: string | null;
  gatewayResponse?: Record<string, unknown> | null;
  paidAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}

export interface PaymentAdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  provider?: string;
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    initiatePayment: builder.mutation<
      { paymentUrl: string; transactionId: string; paymentId: string },
      { orderId: string; lang?: string }
    >({
      query: (body) => ({
        url: '/payments/initiate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),

    retryPayment: builder.mutation<
      { paymentUrl: string; transactionId: string; paymentId: string },
      { orderId: string; lang?: string }
    >({
      query: ({ orderId, lang }) => ({
        url: `/payments/retry/${orderId}`,
        method: 'POST',
        params: { lang },
      }),
      invalidatesTags: ['Payment', 'Order'],
    }),

    getPaymentByTransactionId: builder.query<PaymentRecord, string>({
      query: (transactionId) => `/payments/verify/${transactionId}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),

    getOrderPayments: builder.query<PaymentRecord[], string>({
      query: (orderId) => `/payments/order/${orderId}`,
      providesTags: (result, error, orderId) => [{ type: 'Payment', id: `order-${orderId}` }],
    }),

    getMyPayments: builder.query<
      { data: PaymentRecord[]; meta: PaginationMeta },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/payments/my-payments',
        params: params || {},
      }),
      providesTags: ['Payment'],
    }),

    getAdminPayments: builder.query<
      { data: PaymentRecord[]; meta: PaginationMeta },
      PaymentAdminQueryParams | void
    >({
      query: (params) => ({
        url: '/payments/admin/all',
        params: params || {},
      }),
      providesTags: ['Payment'],
    }),

    getAdminPaymentById: builder.query<PaymentRecord, string>({
      query: (id) => `/payments/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),
  }),
});

export const {
  useInitiatePaymentMutation,
  useRetryPaymentMutation,
  useGetPaymentByTransactionIdQuery,
  useGetOrderPaymentsQuery,
  useGetMyPaymentsQuery,
  useGetAdminPaymentsQuery,
  useGetAdminPaymentByIdQuery,
} = paymentsApi;
