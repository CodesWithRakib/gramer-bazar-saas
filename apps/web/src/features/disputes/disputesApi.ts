import { api } from '../../store/api';
import { User } from '../users/usersApi';
import { Order } from '../orders/ordersApi';

export enum DisputeReason {
  DAMAGED = 'DAMAGED',
  MISSING_ITEM = 'MISSING_ITEM',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  WRONG_ITEM = 'WRONG_ITEM',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_REFUNDED = 'RESOLVED_REFUNDED',
  RESOLVED_REJECTED = 'RESOLVED_REJECTED',
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderRole: string;
  message: string;
  attachment?: string | null;
  createdAt: string;
  sender: User;
}

export interface Dispute {
  id: string;
  orderId: string;
  customerId: string;
  sellerId: string;
  reason: DisputeReason;
  description: string;
  evidenceImages?: string[] | null;
  status: DisputeStatus;
  adminDecision?: string | null;
  createdAt: string;
  updatedAt: string;
  
  order?: Order;
  customer?: User;
  seller?: User;
  messages?: DisputeMessage[];
}

export const disputesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Customer Endpoints
    createDispute: builder.mutation<Dispute, { orderId: string; reason: DisputeReason; description: string; evidenceImages?: string[] }>({
      query: (body) => ({
        url: '/disputes/customer',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dispute'],
    }),
    getCustomerDisputes: builder.query<Dispute[], void>({
      query: () => '/disputes/customer',
      providesTags: ['Dispute'],
    }),
    getCustomerDisputeDetails: builder.query<Dispute, string>({
      query: (id) => `/disputes/customer/${id}`,
      providesTags: (result, error, id) => [{ type: 'Dispute', id }],
    }),
    addCustomerDisputeMessage: builder.mutation<DisputeMessage, { id: string; message: string; attachment?: string }>({
      query: ({ id, ...body }) => ({
        url: `/disputes/customer/${id}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Dispute', id }],
    }),

    // Seller Endpoints
    getSellerDisputes: builder.query<Dispute[], void>({
      query: () => '/disputes/seller',
      providesTags: ['Dispute'],
    }),
    getSellerDisputeDetails: builder.query<Dispute, string>({
      query: (id) => `/disputes/seller/${id}`,
      providesTags: (result, error, id) => [{ type: 'Dispute', id }],
    }),
    addSellerDisputeMessage: builder.mutation<DisputeMessage, { id: string; message: string; attachment?: string }>({
      query: ({ id, ...body }) => ({
        url: `/disputes/seller/${id}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Dispute', id }],
    }),

    // Admin Endpoints
    getAdminDisputes: builder.query<Dispute[], void>({
      query: () => '/disputes/admin',
      providesTags: ['Dispute'],
    }),
    getAdminDisputeDetails: builder.query<Dispute, string>({
      query: (id) => `/disputes/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Dispute', id }],
    }),
    addAdminDisputeMessage: builder.mutation<DisputeMessage, { id: string; message: string; attachment?: string }>({
      query: ({ id, ...body }) => ({
        url: `/disputes/admin/${id}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Dispute', id }],
    }),
    resolveDispute: builder.mutation<Dispute, { id: string; status: DisputeStatus; adminDecision?: string }>({
      query: ({ id, ...body }) => ({
        url: `/disputes/admin/${id}/resolve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Dispute', id }, 'Dispute'],
    }),
  }),
});

export const {
  useCreateDisputeMutation,
  useGetCustomerDisputesQuery,
  useGetCustomerDisputeDetailsQuery,
  useAddCustomerDisputeMessageMutation,
  useGetSellerDisputesQuery,
  useGetSellerDisputeDetailsQuery,
  useAddSellerDisputeMessageMutation,
  useGetAdminDisputesQuery,
  useGetAdminDisputeDetailsQuery,
  useAddAdminDisputeMessageMutation,
  useResolveDisputeMutation,
} = disputesApi;
