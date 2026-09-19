import { api } from '@/store/api';

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  referenceId: string | null;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingClearance: number;
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: string;
}

export const walletsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyWallet: builder.query<Wallet, void>({
      query: () => '/wallets/my-wallet',
      providesTags: ['Wallet'],
    }),
    getMyTransactions: builder.query<WalletTransaction[], void>({
      query: () => '/wallets/my-transactions',
      providesTags: ['WalletTransaction'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyWalletQuery,
  useGetMyTransactionsQuery,
} = walletsApi;
