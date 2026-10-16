import { api } from '@/store/api';

export interface FarmerCreditScore {
  id: string;
  sellerId: string;
  score: number;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  maxEligibleAmount: number;
  fulfillmentRate: number;
  totalLifetimeSales: number;
  disputeRate: number;
  scoringFactors?: Record<string, any> | null;
  lastCalculatedAt: string;
}

export interface MicroLoanApplication {
  id: string;
  sellerId: string;
  applicationNumber: string;
  requestedAmount: number;
  approvedAmount?: number | null;
  purpose:
    | 'HIGH_YIELD_SEEDS'
    | 'FERTILIZER_PESTICIDES'
    | 'IRRIGATION_EQUIPMENT'
    | 'COLD_STORAGE_SOLAR'
    | 'SEASONAL_WORKING_CAPITAL';
  tenureMonths: number;
  interestRate: number;
  monthlyEmi: number;
  partnerMfi: string;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REPAID' | 'REJECTED';
  disbursedAt?: string | null;
  repaidAt?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyMicroLoanPayload {
  requestedAmount: number;
  purpose: string;
  tenureMonths: number;
  partnerMfi?: string;
}

export interface UpdateLoanStatusPayload {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DISBURSED' | 'REPAID' | 'REJECTED';
  approvedAmount?: number;
  adminNotes?: string;
}

export const agriFintechApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFarmerCreditScore: builder.query<FarmerCreditScore, void>({
      query: () => '/agri-fintech/credit-score',
      providesTags: [{ type: 'FarmerCredit', id: 'ME' }],
    }),

    getMyLoans: builder.query<MicroLoanApplication[], void>({
      query: () => '/agri-fintech/loans/my-loans',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'MicroLoan' as const, id })),
              { type: 'MicroLoan', id: 'MY_LIST' },
            ]
          : [{ type: 'MicroLoan', id: 'MY_LIST' }],
    }),

    applyForMicroLoan: builder.mutation<MicroLoanApplication, ApplyMicroLoanPayload>({
      query: (body) => ({
        url: '/agri-fintech/loans/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'MicroLoan', id: 'MY_LIST' },
        { type: 'FarmerCredit', id: 'ME' },
      ],
    }),

    getAllLoans: builder.query<MicroLoanApplication[], { status?: string } | void>({
      query: (params) => ({
        url: '/agri-fintech/admin/loans',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'MicroLoan' as const, id })),
              { type: 'MicroLoan', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'MicroLoan', id: 'ADMIN_LIST' }],
    }),

    updateLoanStatus: builder.mutation<MicroLoanApplication, UpdateLoanStatusPayload>({
      query: ({ id, ...body }) => ({
        url: `/agri-fintech/admin/loans/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'MicroLoan', id: 'MY_LIST' },
        { type: 'MicroLoan', id: 'ADMIN_LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFarmerCreditScoreQuery,
  useGetMyLoansQuery,
  useApplyForMicroLoanMutation,
  useGetAllLoansQuery,
  useUpdateLoanStatusMutation,
} = agriFintechApi;
