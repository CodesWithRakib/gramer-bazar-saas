import { api } from '@/store/api';

export type GroupBuyCampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ENDED';
export type GroupBuyPoolStatus = 'FORMING' | 'SUCCESS' | 'EXPIRED' | 'FULFILLED' | 'CANCELLED';
export type GroupBuyPaymentMode = 'WALLET_ESCROW' | 'ONLINE_PAYMENT' | 'COD_PLEDGE';

export interface TierPricing {
  minQty: number;
  price: number;
}

export interface GroupBuyCampaign {
  id: string;
  titleEn: string;
  titleBn: string;
  sellerProductId: string;
  sellerId: string;
  regularPrice: number;
  groupPrice: number;
  minParticipants: number;
  maxParticipants?: number | null;
  durationHours: number;
  tieredPricing?: TierPricing[] | null;
  targetDistrict?: string | null;
  targetUpazila?: string | null;
  dropPointName: string;
  status: GroupBuyCampaignStatus;
  startDate: string;
  endDate?: string | null;
  sellerProduct?: {
    id: string;
    price: number;
    discountPrice?: number | null;
    product?: {
      id: string;
      titleEn: string;
      titleBn: string;
      images?: { url: string; isThumbnail?: boolean }[];
      category?: { nameEn: string; nameBn: string };
    };
  };
  pools?: GroupBuyPool[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupBuyMember {
  id: string;
  poolId: string;
  userId: string;
  orderId?: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMode: GroupBuyPaymentMode;
  isLeader: boolean;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  joinedAt: string;
}

export interface GroupBuyPool {
  id: string;
  campaignId: string;
  shareCode: string;
  leaderUserId: string;
  currentParticipants: number;
  currentCommittedQty: number;
  status: GroupBuyPoolStatus;
  expiresAt: string;
  lockedAt?: string | null;
  campaign?: GroupBuyCampaign;
  leader?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  members?: GroupBuyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignPayload {
  titleEn: string;
  titleBn: string;
  sellerProductId: string;
  regularPrice: number;
  groupPrice: number;
  minParticipants: number;
  maxParticipants?: number;
  durationHours?: number;
  tieredPricing?: TierPricing[];
  targetDistrict?: string;
  targetUpazila?: string;
  dropPointName: string;
}

export interface UpdateCampaignPayload {
  titleEn?: string;
  titleBn?: string;
  regularPrice?: number;
  groupPrice?: number;
  minParticipants?: number;
  status?: GroupBuyCampaignStatus;
  dropPointName?: string;
}

export interface StartPoolPayload {
  campaignId: string;
  quantity: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMode?: GroupBuyPaymentMode;
}

export interface JoinPoolPayload {
  quantity: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMode?: GroupBuyPaymentMode;
}

export const groupBuyingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActiveCampaigns: builder.query<
      { success: boolean; data: GroupBuyCampaign[] },
      { district?: string; upazila?: string; status?: GroupBuyCampaignStatus } | void
    >({
      query: (params) => ({
        url: '/group-buying/campaigns',
        params: params || undefined,
      }),
      providesTags: ['GroupBuyCampaign'],
    }),

    getCampaignById: builder.query<{ success: boolean; data: GroupBuyCampaign }, string>({
      query: (id) => `/group-buying/campaigns/${id}`,
      providesTags: ['GroupBuyCampaign'],
    }),

    getPoolByShareCode: builder.query<{ success: boolean; data: GroupBuyPool }, string>({
      query: (code) => `/group-buying/pools/code/${code}`,
      providesTags: ['GroupBuyPool'],
    }),

    getPoolById: builder.query<{ success: boolean; data: GroupBuyPool }, string>({
      query: (id) => `/group-buying/pools/${id}`,
      providesTags: ['GroupBuyPool'],
    }),

    startPool: builder.mutation<{ success: boolean; data: GroupBuyPool }, StartPoolPayload>({
      query: (body) => ({
        url: '/group-buying/pools/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroupBuyPool', 'GroupBuyCampaign'],
    }),

    joinPool: builder.mutation<
      { success: boolean; data: GroupBuyPool },
      { poolId: string; body: JoinPoolPayload }
    >({
      query: ({ poolId, body }) => ({
        url: `/group-buying/pools/${poolId}/join`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroupBuyPool', 'GroupBuyCampaign'],
    }),

    getMyPools: builder.query<{ success: boolean; data: GroupBuyPool[] }, void>({
      query: () => '/group-buying/my-pools',
      providesTags: ['GroupBuyPool'],
    }),

    createCampaign: builder.mutation<
      { success: boolean; data: GroupBuyCampaign },
      CreateCampaignPayload
    >({
      query: (body) => ({
        url: '/group-buying/campaigns',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GroupBuyCampaign'],
    }),

    updateCampaign: builder.mutation<
      { success: boolean; data: GroupBuyCampaign },
      { id: string; body: UpdateCampaignPayload }
    >({
      query: ({ id, body }) => ({
        url: `/group-buying/campaigns/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['GroupBuyCampaign'],
    }),

    getSellerCampaigns: builder.query<{ success: boolean; data: GroupBuyCampaign[] }, void>({
      query: () => '/group-buying/seller/my-campaigns',
      providesTags: ['GroupBuyCampaign'],
    }),

    getAdminCampaigns: builder.query<{ success: boolean; data: GroupBuyCampaign[] }, void>({
      query: () => '/group-buying/admin/campaigns',
      providesTags: ['GroupBuyCampaign'],
    }),

    getAdminPools: builder.query<
      { success: boolean; data: GroupBuyPool[] },
      GroupBuyPoolStatus | void
    >({
      query: (status) => ({
        url: '/group-buying/admin/pools',
        params: status ? { status } : undefined,
      }),
      providesTags: ['GroupBuyPool'],
    }),
  }),
});

export const {
  useGetActiveCampaignsQuery,
  useGetCampaignByIdQuery,
  useGetPoolByShareCodeQuery,
  useGetPoolByIdQuery,
  useStartPoolMutation,
  useJoinPoolMutation,
  useGetMyPoolsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useGetSellerCampaignsQuery,
  useGetAdminCampaignsQuery,
  useGetAdminPoolsQuery,
} = groupBuyingApi;
