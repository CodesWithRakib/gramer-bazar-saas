import { api } from '@/store/api';

export type AgentSessionStatus = 'OPEN' | 'CLOSED' | 'RECONCILED';

export type AgentCashTxType =
  | 'CASH_IN_ORDER'
  | 'CASH_IN_FLOAT_ADD'
  | 'CASH_OUT_PRODUCE_PAYOUT'
  | 'CASH_OUT_EXPENSE'
  | 'CASH_OUT_DEPOSIT';

export type FarmerCollectionStatus =
  | 'COLLECTED'
  | 'CONSIGNED'
  | 'IN_TRANSIT_TO_HUB'
  | 'HUB_RECEIVED';

export type SettlementChannel =
  | 'POST_OFFICE'
  | 'MFI_BRANCH'
  | 'AGENT_BANKING'
  | 'BKASH_AGENT';

export type SettlementStatus = 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface AgentCashTransaction {
  id: string;
  sessionId: string;
  type: AgentCashTxType;
  amount: number;
  orderId?: string | null;
  farmerCollectionId?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface AgentCashDrawerSession {
  id: string;
  agentId: string;
  hubId?: string | null;
  openedAt: string;
  closedAt?: string | null;
  openingFloat: number;
  cashIn: number;
  cashOut: number;
  expectedClosingBalance: number;
  actualClosingBalance?: number | null;
  discrepancy?: number | null;
  status: AgentSessionStatus;
  openingNotes?: string | null;
  closingNotes?: string | null;
  transactions?: AgentCashTransaction[];
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FarmerProduceCollection {
  id: string;
  collectionCode: string;
  agentId: string;
  sessionId?: string | null;
  farmerName: string;
  farmerPhone: string;
  villageLocation: string;
  cropType: string;
  quantityKg: number;
  unitPricePerKg: number;
  totalPayout: number;
  paidFromDrawer: boolean;
  destinationHubId?: string | null;
  batchNumber?: string | null;
  status: FarmerCollectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCashSettlement {
  id: string;
  settlementCode: string;
  agentId: string;
  amount: number;
  settlementChannel: SettlementChannel;
  channelReference: string;
  slipReceiptUrl?: string | null;
  status: SettlementStatus;
  rejectionReason?: string | null;
  verifiedByAdminId?: string | null;
  verifiedAt?: string | null;
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentPerformanceSummary {
  activeSession: AgentCashDrawerSession | null;
  currentDrawerCash: number;
  totalOrdersCount: number;
  totalSalesVolume: number;
  totalCommissionEarned: number;
  totalCollectionsCount: number;
  totalCollectedKg: number;
  totalFarmerPayout: number;
  verifiedSettlementsAmount: number;
  pendingSettlementsAmount: number;
}

export interface OpenDrawerPayload {
  openingFloat: number;
  hubId?: string;
  openingNotes?: string;
}

export interface CloseDrawerPayload {
  actualClosingBalance: number;
  closingNotes?: string;
}

export interface RecordCashTxPayload {
  type: AgentCashTxType;
  amount: number;
  orderId?: string;
  farmerCollectionId?: string;
  note?: string;
}

export interface AgentPosCheckoutPayload {
  items: { sellerProductId: string; quantity: number }[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  amountTendered: number;
  lang?: string;
}

export interface CreateFarmerCollectionPayload {
  farmerName: string;
  farmerPhone: string;
  villageLocation: string;
  cropType: string;
  quantityKg: number;
  unitPricePerKg: number;
  paidFromDrawer?: boolean;
  destinationHubId?: string;
  batchNumber?: string;
}

export interface CreateSettlementPayload {
  amount: number;
  settlementChannel: SettlementChannel;
  channelReference: string;
  slipReceiptUrl?: string;
}

export interface ReviewSettlementPayload {
  status: SettlementStatus;
  rejectionReason?: string;
}

export const agentCommerceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActiveSession: builder.query<{ success: boolean; data: AgentCashDrawerSession | null }, void>({
      query: () => '/agent-commerce/pos/active-session',
      providesTags: ['AgentSession'],
    }),

    openDrawerSession: builder.mutation<
      { success: boolean; data: AgentCashDrawerSession },
      OpenDrawerPayload
    >({
      query: (body) => ({
        url: '/agent-commerce/pos/open-session',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AgentSession'],
    }),

    closeDrawerSession: builder.mutation<
      { success: boolean; data: AgentCashDrawerSession },
      CloseDrawerPayload
    >({
      query: (body) => ({
        url: '/agent-commerce/pos/close-session',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AgentSession'],
    }),

    recordCashTransaction: builder.mutation<
      { success: boolean; data: AgentCashTransaction },
      RecordCashTxPayload
    >({
      query: (body) => ({
        url: '/agent-commerce/pos/transaction',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AgentSession'],
    }),

    processAgentPosCheckout: builder.mutation<
      {
        success: boolean;
        data: {
          order: any;
          orderTotal: number;
          amountTendered: number;
          changeDue: number;
          agentCommission: number;
          sessionId: string;
        };
      },
      AgentPosCheckoutPayload
    >({
      query: (body) => ({
        url: '/agent-commerce/pos/checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AgentSession', 'Order'],
    }),

    recordFarmerCollection: builder.mutation<
      { success: boolean; data: FarmerProduceCollection },
      CreateFarmerCollectionPayload
    >({
      query: (body) => ({
        url: '/agent-commerce/collections',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AgentCollection', 'AgentSession'],
    }),

    getFarmerCollections: builder.query<
      { success: boolean; data: FarmerProduceCollection[] },
      void
    >({
      query: () => '/agent-commerce/collections/my-collections',
      providesTags: ['AgentCollection'],
    }),

    updateCollectionStatus: builder.mutation<
      { success: boolean; data: FarmerProduceCollection },
      { id: string; status: FarmerCollectionStatus }
    >({
      query: ({ id, status }) => ({
        url: `/agent-commerce/collections/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['AgentCollection'],
    }),

    createSettlement: builder.mutation<
      { success: boolean; data: AgentCashSettlement },
      CreateSettlementPayload
    >({
      query: (body) => ({
        url: '/agent-commerce/settlements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AgentSettlement', 'AgentSession'],
    }),

    getAgentSettlements: builder.query<
      { success: boolean; data: AgentCashSettlement[] },
      void
    >({
      query: () => '/agent-commerce/settlements/my-settlements',
      providesTags: ['AgentSettlement'],
    }),

    getAgentSummary: builder.query<
      { success: boolean; data: AgentPerformanceSummary },
      void
    >({
      query: () => '/agent-commerce/summary',
      providesTags: ['AgentSession', 'AgentCollection', 'AgentSettlement'],
    }),

    // Admin endpoints
    getAllSettlementsAdmin: builder.query<
      { success: boolean; data: AgentCashSettlement[] },
      SettlementStatus | void
    >({
      query: (status) => ({
        url: '/agent-commerce/admin/settlements',
        params: status ? { status } : undefined,
      }),
      providesTags: ['AgentSettlement'],
    }),

    reviewSettlementAdmin: builder.mutation<
      { success: boolean; data: AgentCashSettlement },
      { id: string; body: ReviewSettlementPayload }
    >({
      query: ({ id, body }) => ({
        url: `/agent-commerce/admin/settlements/${id}/review`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AgentSettlement'],
    }),

    getAdminActiveSessions: builder.query<
      { success: boolean; data: AgentCashDrawerSession[] },
      void
    >({
      query: () => '/agent-commerce/admin/active-sessions',
      providesTags: ['AgentSession'],
    }),
  }),
});

export const {
  useGetActiveSessionQuery,
  useOpenDrawerSessionMutation,
  useCloseDrawerSessionMutation,
  useRecordCashTransactionMutation,
  useProcessAgentPosCheckoutMutation,
  useRecordFarmerCollectionMutation,
  useGetFarmerCollectionsQuery,
  useUpdateCollectionStatusMutation,
  useCreateSettlementMutation,
  useGetAgentSettlementsQuery,
  useGetAgentSummaryQuery,
  useGetAllSettlementsAdminQuery,
  useReviewSettlementAdminMutation,
  useGetAdminActiveSessionsQuery,
} = agentCommerceApi;
