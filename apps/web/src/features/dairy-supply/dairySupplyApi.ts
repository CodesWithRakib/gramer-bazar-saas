import { api } from '@/store/api';

export type MilkType = 'COW_MILK' | 'BUFFALO_MILK' | 'GOAT_MILK';

export type MilkShift = 'MORNING_SHIFT' | 'EVENING_SHIFT';

export type MilkQualityGrade =
  | 'GRADE_A_PREMIUM_CHILLED'
  | 'GRADE_B_STANDARD'
  | 'GRADE_C_SUBSTANDARD'
  | 'REJECTED_CURDLED_OR_ADULTERATED';

export type ChillingVatStatus =
  | 'OPTIMAL_CHILLED_4C'
  | 'COOLING_IN_PROGRESS'
  | 'TEMPERATURE_ALARM_HIGH'
  | 'EMPTY_CLEANING_CIP';

export type FeedCategory =
  | 'MUSTARD_OIL_CAKE'
  | 'WHEAT_BRAN_COARSE'
  | 'CORN_SILAGE_FERMENTED'
  | 'PELLETTED_DAIRY_FEED'
  | 'CALCIUM_MINERAL_PREMIX';

export type PaymentSettlementStatus =
  | 'PAYMENT_PENDING'
  | 'DISBURSED_MFS_WALLET'
  | 'ADJUSTED_FEED_PURCHASE';

export interface DairyMilkCollectionEntry {
  id: string;
  collectionVoucherNo: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  cooperativeCenterId: string;
  cooperativeName: string;
  milkType: MilkType;
  collectionShift: MilkShift;
  volumeLiters: number;
  lactometerReadingCorrected: number;
  fatPercentage: number;
  snfPercentage: number;
  mbrtHours: number;
  qualityGrade: MilkQualityGrade;
  ratePerLiterBdt: number;
  totalPayoutAmountBdt: number;
  paymentStatus: PaymentSettlementStatus;
  collectionDate: string;
  adulterationNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MilkChillingVatTelemetry {
  id: string;
  vatCode: string;
  chillingCenterId: string;
  chillingCenterName: string;
  district: string;
  capacityLiters: number;
  currentVolumeLiters: number;
  currentTemperatureCelsius: number;
  agitatorRpm: number;
  compressorStatus: string;
  vatStatus: ChillingVatStatus;
  isAlarmActive: boolean;
  alarmReason: string | null;
  lastRecordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LivestockFeedGroupBuyPool {
  id: string;
  poolCode: string;
  feedCategory: FeedCategory;
  feedBrandOrMillName: string;
  targetVolumeKg: number;
  committedVolumeKg: number;
  discountedPricePerKgBdt: number;
  retailMarketPricePerKgBdt: number;
  minimumFarmerParticipants: number;
  currentParticipantsCount: number;
  deliveryHubLocation: string;
  poolClosingDate: string;
  isClosedAndOrdered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DairyOverviewStats {
  activeChillingVatsCount: number;
  totalChilledVolumeLiters: number;
  averageMilkFatPercentage: number;
  averageSnfPercentage: number;
  todayCollectedVolumeLiters: number;
  todayDisbursedPayoutBdt: number;
  activeFeedPoolsCount: number;
  totalFeedSavingsBdt: number;
}

export interface CalculateMilkRateRequest {
  fatPercentage: number;
  lactometerReadingCorrected: number;
  milkType?: MilkType;
  volumeLiters?: number;
}

export interface CalculateMilkRateResponse {
  milkType: MilkType;
  volumeLiters: number;
  fatPercentage: number;
  lactometerReadingCorrected: number;
  calculatedSnfPercentage: number;
  baseRateBdt: number;
  fatBonusBdt: number;
  snfBonusBdt: number;
  ratePerLiterBdt: number;
  totalPayoutAmountBdt: number;
  qualityGrade: MilkQualityGrade;
  adulterationWarning: string | null;
  richmondsFormula: string;
}

export interface CalculateFeedSavingsRequest {
  feedCategory: FeedCategory;
  herdCowsCount: number;
  monthlyConsumptionKgPerCow?: number;
}

export interface CalculateFeedSavingsResponse {
  feedCategory: FeedCategory;
  herdCowsCount: number;
  monthlyConsumptionKgPerCow: number;
  totalMonthlyDemandKg: number;
  retailPricePerKgBdt: number;
  bulkPoolPricePerKgBdt: number;
  retailMonthlyExpenseBdt: number;
  bulkPoolMonthlyExpenseBdt: number;
  netMonthlySavingsBdt: number;
  savingsPercentage: number;
  recommendedAction: string;
}

export interface CreateMilkCollectionRequest {
  farmerName: string;
  farmerPhone: string;
  cooperativeCenterId: string;
  cooperativeName: string;
  milkType: MilkType;
  collectionShift: MilkShift;
  volumeLiters: number;
  lactometerReadingCorrected: number;
  fatPercentage: number;
  mbrtHours?: number;
  adulterationNotes?: string;
  collectionDate: string;
}

export interface RecordChillingTelemetryRequest {
  vatCode: string;
  currentVolumeLiters: number;
  currentTemperatureCelsius: number;
  agitatorRpm?: number;
  compressorStatus?: string;
  vatStatus?: ChillingVatStatus;
  isAlarmActive?: boolean;
  alarmReason?: string;
}

export interface CreateFeedPoolRequest {
  feedCategory: FeedCategory;
  feedBrandOrMillName: string;
  targetVolumeKg: number;
  discountedPricePerKgBdt: number;
  retailMarketPricePerKgBdt: number;
  minimumFarmerParticipants?: number;
  deliveryHubLocation: string;
  poolClosingDate: string;
}

export interface JoinFeedPoolRequest {
  poolId: string;
  orderedKg: number;
}

export const dairySupplyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDairyOverviewStats: builder.query<{ success: boolean; data: DairyOverviewStats }, void>({
      query: () => '/dairy-supply/stats/overview',
      providesTags: ['MilkCollection', 'ChillingVat', 'FeedPool'],
    }),

    calculateMilkRate: builder.mutation<
      { success: boolean; data: CalculateMilkRateResponse },
      CalculateMilkRateRequest
    >({
      query: (body) => ({
        url: '/dairy-supply/calculate/milk-rate',
        method: 'POST',
        body,
      }),
    }),

    calculateFeedSavings: builder.mutation<
      { success: boolean; data: CalculateFeedSavingsResponse },
      CalculateFeedSavingsRequest
    >({
      query: (body) => ({
        url: '/dairy-supply/calculate/feed-savings',
        method: 'POST',
        body,
      }),
    }),

    getChillingVats: builder.query<{ success: boolean; data: MilkChillingVatTelemetry[] }, void>({
      query: () => '/dairy-supply/chilling-vats',
      providesTags: ['ChillingVat'],
    }),

    getFeedPools: builder.query<{ success: boolean; data: LivestockFeedGroupBuyPool[] }, void>({
      query: () => '/dairy-supply/feed-pools',
      providesTags: ['FeedPool'],
    }),

    getMyMilkCollections: builder.query<
      { success: boolean; data: DairyMilkCollectionEntry[] },
      void
    >({
      query: () => '/dairy-supply/collections/my',
      providesTags: ['MilkCollection'],
    }),

    joinFeedPool: builder.mutation<
      { success: boolean; data: LivestockFeedGroupBuyPool },
      JoinFeedPoolRequest
    >({
      query: (body) => ({
        url: '/dairy-supply/feed-pools/join',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FeedPool'],
    }),

    createMilkCollectionEntry: builder.mutation<
      { success: boolean; data: DairyMilkCollectionEntry },
      CreateMilkCollectionRequest
    >({
      query: (body) => ({
        url: '/dairy-supply/collections',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MilkCollection'],
    }),

    getCollectionsByCenter: builder.query<
      { success: boolean; data: DairyMilkCollectionEntry[] },
      string
    >({
      query: (centerId) => `/dairy-supply/collections/center/${centerId}`,
      providesTags: ['MilkCollection'],
    }),

    getAllAdminCollections: builder.query<
      { success: boolean; data: DairyMilkCollectionEntry[] },
      void
    >({
      query: () => '/dairy-supply/collections/all',
      providesTags: ['MilkCollection'],
    }),

    disburseMilkPayment: builder.mutation<
      { success: boolean; data: DairyMilkCollectionEntry },
      string
    >({
      query: (id) => ({
        url: `/dairy-supply/collections/${id}/disburse`,
        method: 'PATCH',
      }),
      invalidatesTags: ['MilkCollection'],
    }),

    recordChillingTelemetry: builder.mutation<
      { success: boolean; data: MilkChillingVatTelemetry },
      RecordChillingTelemetryRequest
    >({
      query: (body) => ({
        url: '/dairy-supply/chilling-vats/telemetry',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ChillingVat'],
    }),

    createFeedPool: builder.mutation<
      { success: boolean; data: LivestockFeedGroupBuyPool },
      CreateFeedPoolRequest
    >({
      query: (body) => ({
        url: '/dairy-supply/feed-pools',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FeedPool'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDairyOverviewStatsQuery,
  useCalculateMilkRateMutation,
  useCalculateFeedSavingsMutation,
  useGetChillingVatsQuery,
  useGetFeedPoolsQuery,
  useGetMyMilkCollectionsQuery,
  useJoinFeedPoolMutation,
  useCreateMilkCollectionEntryMutation,
  useGetCollectionsByCenterQuery,
  useGetAllAdminCollectionsQuery,
  useDisburseMilkPaymentMutation,
  useRecordChillingTelemetryMutation,
  useCreateFeedPoolMutation,
} = dairySupplyApi;
