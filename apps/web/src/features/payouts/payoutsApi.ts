import { api } from '@/store/api';
import { User } from '@/features/users/usersApi';

export interface PayoutRequest {
  id: string;
  sellerId: string;
  seller?: User;
  amount: number;
  method: 'BANK_TRANSFER' | 'BKASH' | 'NAGAD' | 'ROCKET';
  accountDetails: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: string;
}

export interface CreatePayoutRequest {
  amount: number;
  method: string;
  accountDetails: string;
}

export interface ReviewPayoutRequest {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
}

export const payoutsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyPayouts: builder.query<PayoutRequest[], void>({
      query: () => '/payouts/my-requests',
      providesTags: ['Payout'],
    }),
    getAllPayouts: builder.query<PayoutRequest[], 'PENDING' | 'APPROVED' | 'REJECTED' | void>({
      query: (status) => (status ? `/payouts?status=${status}` : '/payouts'),
      providesTags: ['Payout'],
    }),
    requestPayout: builder.mutation<PayoutRequest, CreatePayoutRequest>({
      query: (body) => ({
        url: '/payouts/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payout', 'Wallet', 'WalletTransaction'],
    }),
    reviewPayout: builder.mutation<PayoutRequest, { id: string; data: ReviewPayoutRequest }>({
      query: ({ id, data }) => ({
        url: `/payouts/${id}/review`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Payout', 'Wallet', 'WalletTransaction'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyPayoutsQuery,
  useGetAllPayoutsQuery,
  useRequestPayoutMutation,
  useReviewPayoutMutation,
} = payoutsApi;
