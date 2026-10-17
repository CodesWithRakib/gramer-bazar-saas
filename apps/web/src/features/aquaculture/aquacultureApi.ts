import { api } from '@/store/api';

export interface HatcheryBatch {
  id: string;
  hatcheryOwnerId: string;
  hatcheryName: string;
  hatcheryPhone: string;
  hatcheryDistrict: string;
  hatcheryUpazila: string;
  batchNumber: string;
  category: 'FRESHWATER_CARP' | 'SHRIMP_BLACK_TIGER' | 'PRAWN_GALDA' | 'TILAPIA_PANGAS' | 'CATFISH_SHING_MAGUR' | 'BIOFLOC_INTENSIVE';
  species: string;
  stage: 'BROODSTOCK' | 'SPAWN_DIM_PONA' | 'FINGERLING_DHANI' | 'JUVENILE_CHALA' | 'MARKET_READY_HARVEST';
  pcrTestReportNumber: string | null;
  pcrTestStatus: 'PCR_TESTED_NEGATIVE_SPF' | 'PCR_PENDING' | 'REJECTED_INFECTED';
  testingLab: string | null;
  fingerlingCount: number;
  averageLengthCm: number;
  unitPriceBdt: number;
  minOrderQuantity: number;
  oxygenPackingIncluded: boolean;
  isAvailable: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PondIotTelemetry {
  id: string;
  farmerId: string;
  pondId: string;
  pondName: string;
  dissolvedOxygenMgL: number;
  waterTemperatureCelsius: number;
  waterPh: number;
  ammoniaNh3Ppm: number;
  salinityPpt: number;
  waterQualityStatus: 'OPTIMAL' | 'MILD_STRESS' | 'HYPOXIA_CRITICAL' | 'TOXIC_AMMONIA_SPIKE';
  aeratorsActive: boolean;
  alertMessage: string | null;
  recordedAt: string;
  createdAt: string;
}

export interface FeedFcrLog {
  id: string;
  farmerId: string;
  pondId: string;
  species: string;
  stockingDate: string;
  feedBrand: string;
  cumulativeFeedKg: number;
  estimatedBiomassKg: number;
  calculatedFcr: number;
  averageBodyWeightGrams: number;
  survivalRatePercentage: number;
  notes: string | null;
  recordedDate: string;
  createdAt: string;
}

export interface LiveFishTransportBooking {
  id: string;
  bookingNumber: string;
  buyerId: string;
  farmerId: string;
  pickupDistrict: string;
  pickupUpazila: string;
  pickupGherAddress: string;
  dropoffMarket: string;
  vehicleType: string;
  species: string;
  approximateFishKg: number;
  estimatedLivePriceBdt: number;
  transportFareBdt: number;
  waterTankerStatus: 'REQUESTED' | 'AERATION_PREPPED' | 'IN_TRANSIT_LIVE' | 'DELIVERED_ZERO_MORTALITY' | 'CANCELLED';
  driverName: string | null;
  driverPhone: string | null;
  vehiclePlateNumber: string | null;
  departureTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AquacultureOverviewStats {
  totalFingerlingsAvailable: number;
  spfCertifiedPercentage: number;
  activeMonitoredPonds: number;
  averagePondDoMgL: number;
  activeLiveFishTankers: number;
  totalLiveFishKgTransported: number;
}

export const aquacultureApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAquacultureOverviewStats: builder.query<{ success: boolean; data: AquacultureOverviewStats }, void>({
      query: () => '/aquaculture/stats/overview',
      providesTags: ['HatcheryBatch', 'PondTelemetry', 'LiveFishTransport'],
    }),

    getHatcheryBatches: builder.query<
      { success: boolean; data: HatcheryBatch[] },
      { category?: string; species?: string; district?: string; spfOnly?: boolean } | void
    >({
      query: (params) => ({
        url: '/aquaculture/batches',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'HatcheryBatch' as const, id })),
              { type: 'HatcheryBatch', id: 'LIST' },
            ]
          : [{ type: 'HatcheryBatch', id: 'LIST' }],
    }),

    getHatcheryBatchById: builder.query<{ success: boolean; data: HatcheryBatch }, string>({
      query: (id) => `/aquaculture/batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'HatcheryBatch', id }],
    }),

    getArbitrageCalc: builder.query<
      {
        success: boolean;
        data: {
          species: string;
          weightKg: number;
          livePricePerKgBdt: number;
          deadIcedPricePerKgBdt: number;
          premiumPercentage: number;
          grossLiveRevenueBdt: number;
          grossIcedRevenueBdt: number;
          netPremiumAdvantageBdt: number;
        };
      },
      { species: string; weightKg: number }
    >({
      query: (params) => ({
        url: '/aquaculture/arbitrage-calc',
        params,
      }),
    }),

    getFcrCalc: builder.query<
      {
        success: boolean;
        data: {
          calculatedFcr: number;
          rating: 'EXCELLENT' | 'STANDARD' | 'POOR_FEED_WASTE';
          benchmarkFcr: number;
          ratingDescriptionBn: string;
          feedSavingsBdt: number;
        };
      },
      { feedKg: number; biomassKg: number; species: string }
    >({
      query: (params) => ({
        url: '/aquaculture/fcr-calc',
        params,
      }),
    }),

    createHatcheryBatch: builder.mutation<{ success: boolean; data: HatcheryBatch }, Partial<HatcheryBatch>>({
      query: (body) => ({
        url: '/aquaculture/batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'HatcheryBatch', id: 'LIST' }],
    }),

    getMyHatcheryBatches: builder.query<{ success: boolean; data: HatcheryBatch[] }, void>({
      query: () => '/aquaculture/seller/my-batches',
      providesTags: [{ type: 'HatcheryBatch', id: 'SELLER_LIST' }],
    }),

    updateHatcheryBatch: builder.mutation<
      { success: boolean; data: HatcheryBatch },
      { id: string } & Partial<HatcheryBatch>
    >({
      query: ({ id, ...body }) => ({
        url: `/aquaculture/batches/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'HatcheryBatch', id },
        { type: 'HatcheryBatch', id: 'LIST' },
        { type: 'HatcheryBatch', id: 'SELLER_LIST' },
      ],
    }),

    ingestPondTelemetry: builder.mutation<{ success: boolean; data: PondIotTelemetry }, Partial<PondIotTelemetry>>({
      query: (body) => ({
        url: '/aquaculture/telemetry',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PondTelemetry', id: 'LATEST' }],
    }),

    getPondTelemetry: builder.query<{ success: boolean; data: PondIotTelemetry[] }, string>({
      query: (pondId) => `/aquaculture/telemetry/pond/${pondId}`,
      providesTags: (_res, _err, pondId) => [{ type: 'PondTelemetry', id: pondId }],
    }),

    getFarmerLatestTelemetry: builder.query<{ success: boolean; data: PondIotTelemetry[] }, void>({
      query: () => '/aquaculture/telemetry/farmer/latest',
      providesTags: [{ type: 'PondTelemetry', id: 'LATEST' }],
    }),

    recordFeedFcr: builder.mutation<{ success: boolean; data: FeedFcrLog }, Partial<FeedFcrLog>>({
      query: (body) => ({
        url: '/aquaculture/fcr/logs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'FeedFcr', id: 'MY_LIST' }],
    }),

    getPondFcrLogs: builder.query<{ success: boolean; data: FeedFcrLog[] }, string>({
      query: (pondId) => `/aquaculture/fcr/pond/${pondId}`,
      providesTags: (_res, _err, pondId) => [{ type: 'FeedFcr', id: pondId }],
    }),

    getFarmerFcrLogs: builder.query<{ success: boolean; data: FeedFcrLog[] }, void>({
      query: () => '/aquaculture/fcr/my',
      providesTags: [{ type: 'FeedFcr', id: 'MY_LIST' }],
    }),

    bookLiveFishTanker: builder.mutation<
      { success: boolean; data: LiveFishTransportBooking },
      Partial<LiveFishTransportBooking>
    >({
      query: (body) => ({
        url: '/aquaculture/tankers/book',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'LiveFishTransport', id: 'MY_LIST' }, { type: 'LiveFishTransport', id: 'ALL_LIST' }],
    }),

    getMyTankerBookings: builder.query<{ success: boolean; data: LiveFishTransportBooking[] }, void>({
      query: () => '/aquaculture/tankers/my',
      providesTags: [{ type: 'LiveFishTransport', id: 'MY_LIST' }],
    }),

    getAllTankerBookings: builder.query<{ success: boolean; data: LiveFishTransportBooking[] }, void>({
      query: () => '/aquaculture/admin/tankers',
      providesTags: [{ type: 'LiveFishTransport', id: 'ALL_LIST' }],
    }),

    updateTankerStatus: builder.mutation<
      { success: boolean; data: LiveFishTransportBooking },
      { id: string } & Partial<LiveFishTransportBooking>
    >({
      query: ({ id, ...body }) => ({
        url: `/aquaculture/admin/tankers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'LiveFishTransport', id: 'MY_LIST' }, { type: 'LiveFishTransport', id: 'ALL_LIST' }],
    }),
  }),
});

export const {
  useGetAquacultureOverviewStatsQuery,
  useGetHatcheryBatchesQuery,
  useGetHatcheryBatchByIdQuery,
  useGetArbitrageCalcQuery,
  useGetFcrCalcQuery,
  useCreateHatcheryBatchMutation,
  useGetMyHatcheryBatchesQuery,
  useUpdateHatcheryBatchMutation,
  useIngestPondTelemetryMutation,
  useGetPondTelemetryQuery,
  useGetFarmerLatestTelemetryQuery,
  useRecordFeedFcrMutation,
  useGetPondFcrLogsQuery,
  useGetFarmerFcrLogsQuery,
  useBookLiveFishTankerMutation,
  useGetMyTankerBookingsQuery,
  useGetAllTankerBookingsQuery,
  useUpdateTankerStatusMutation,
} = aquacultureApi;
