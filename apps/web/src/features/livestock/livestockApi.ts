import { api } from '@/store/api';

export interface LivestockListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerDistrict: string;
  sellerUpazila: string;
  earTagNumber: string;
  title: string;
  description: string | null;
  category: 'DAIRY_COW' | 'BEEF_CATTLE' | 'BULL_CALF' | 'GOAT' | 'SHEEP' | 'BUFFALO';
  breed: string;
  gender: 'MALE' | 'FEMALE';
  liveWeightKg: number;
  teethCount: number;
  ageMonths: number;
  dailyMilkYieldLiters: number | null;
  parity: number | null;
  isPregnant: boolean;
  pregnancyMonths: number | null;
  colorPattern: string;
  askingPrice: number;
  negotiable: boolean;
  qurbaniEligible: boolean;
  mediaUrls: string[];
  healthStatus: 'PENDING_INSPECTION' | 'CERTIFIED_HEALTHY' | 'TREATMENT_UNDERWAY' | 'QUARANTINE_MANDATED';
  listingStatus: 'DRAFT' | 'AVAILABLE' | 'UNDER_ESCROW' | 'SOLD' | 'DELIVERED' | 'WITHDRAWN';
  buyerId: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  escrowStatus: 'HELD_IN_ESCROW' | 'RELEASED_TO_SELLER' | 'REFUNDED_TO_BUYER' | 'DISPUTED' | null;
  escrowAmount: number | null;
  createdAt: string;
  updatedAt: string;
  qurbaniCompliance?: {
    isCompliant: boolean;
    reasonsBn: string[];
    reasonsEn: string[];
  };
  estimatedMeatYield?: {
    liveWeightKg: number;
    dressingPercentage: number;
    carcassWeightKg: number;
    bonelessMeatKg: number;
    edibleOffalKg: number;
    estimatedMeatValueBdt: number;
  };
}

export interface VaccineRecord {
  vaccine: string;
  doseDate: string;
  nextDueDate: string;
  batchNo: string;
  administeredBy: string;
}

export interface LivestockHealthPassport {
  id: string;
  earTagNumber: string;
  livestockId: string;
  veterinaryOfficerName: string;
  veterinaryRegNumber: string;
  upazilaHospital: string;
  certifiedAt: string;
  healthCertification: 'PENDING_INSPECTION' | 'CERTIFIED_HEALTHY' | 'TREATMENT_UNDERWAY' | 'QUARANTINE_MANDATED';
  bodyTemperatureCelsius: number;
  dewormingDate: string | null;
  vaccinationLedger: VaccineRecord[];
  healthRemarks: string | null;
  certificateQrCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArtificialInseminationBooking {
  id: string;
  bookingNumber: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerDistrict: string;
  farmerUpazila: string;
  targetDamEarTag: string;
  targetDamBreed: string;
  desiredSireBreed: string;
  strawSource: string;
  sireBullId: string | null;
  heatObservationDate: string;
  status: 'REQUESTED' | 'TECHNICIAN_ASSIGNED' | 'INSEMINATION_COMPLETED' | 'PREGNANCY_CONFIRMED' | 'FAILED';
  technicianName: string | null;
  technicianPhone: string | null;
  fee: number;
  inseminationDate: string | null;
  pregnancyCheckDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LivestockTransportBooking {
  id: string;
  bookingNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  livestockId: string;
  earTagNumber: string;
  pickupDistrict: string;
  pickupUpazila: string;
  pickupAddress: string;
  dropoffDistrict: string;
  dropoffUpazila: string;
  dropoffAddress: string;
  vehicleType: string;
  fareAmount: number;
  hasTransitInsurance: boolean;
  insuranceFee: number;
  status: 'SCHEDULED' | 'LOADING' | 'IN_TRANSIT' | 'ARRIVED_INSPECTED' | 'CANCELLED';
  driverName: string | null;
  driverPhone: string | null;
  vehiclePlateNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LivestockOverviewStats {
  totalListings: number;
  availableCattle: number;
  totalEscrowHeldBdt: number;
  dlsCertifiedPercentage: number;
  completedAIBreedings: number;
  activeTransports: number;
}

export const livestockApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLivestockOverviewStats: builder.query<{ success: boolean; data: LivestockOverviewStats }, void>({
      query: () => '/livestock/stats/overview',
      providesTags: ['LivestockListing', 'AIBooking', 'LivestockTransport'],
    }),

    getLivestockListings: builder.query<
      { success: boolean; data: LivestockListing[] },
      { category?: string; breed?: string; district?: string; qurbaniOnly?: boolean; minWeight?: number; maxPrice?: number } | void
    >({
      query: (params) => ({
        url: '/livestock/listings',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'LivestockListing' as const, id })),
              { type: 'LivestockListing', id: 'LIST' },
            ]
          : [{ type: 'LivestockListing', id: 'LIST' }],
    }),

    getLivestockListingById: builder.query<{ success: boolean; data: LivestockListing }, string>({
      query: (id) => `/livestock/listings/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'LivestockListing', id }],
    }),

    getLivestockListingByEarTag: builder.query<{ success: boolean; data: LivestockListing }, string>({
      query: (earTag) => `/livestock/listings/tag/${earTag}`,
      providesTags: (_res, _err, earTag) => [{ type: 'LivestockListing', id: earTag }],
    }),

    getMeatYieldCalc: builder.query<
      {
        success: boolean;
        data: {
          liveWeightKg: number;
          dressingPercentage: number;
          carcassWeightKg: number;
          bonelessMeatKg: number;
          edibleOffalKg: number;
          estimatedMeatValueBdt: number;
        };
      },
      { weightKg: number; category: string }
    >({
      query: (params) => ({
        url: '/livestock/meat-yield-calc',
        params,
      }),
    }),

    getAIWindowCalc: builder.query<
      {
        success: boolean;
        data: {
          heatObservedAt: string;
          windowStart: string;
          windowEnd: string;
          ruleDescriptionBn: string;
          ruleDescriptionEn: string;
        };
      },
      { heatObservedAt: string }
    >({
      query: (params) => ({
        url: '/livestock/ai-window-calc',
        params,
      }),
    }),

    getHealthPassport: builder.query<{ success: boolean; data: LivestockHealthPassport }, string>({
      query: (earTag) => `/livestock/passport/${earTag}`,
      providesTags: (_res, _err, earTag) => [{ type: 'LivestockPassport', id: earTag }],
    }),

    createLivestockListing: builder.mutation<{ success: boolean; data: LivestockListing }, Partial<LivestockListing>>({
      query: (body) => ({
        url: '/livestock/listings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'LivestockListing', id: 'LIST' }],
    }),

    getSellerLivestockListings: builder.query<{ success: boolean; data: LivestockListing[] }, void>({
      query: () => '/livestock/seller/my-listings',
      providesTags: [{ type: 'LivestockListing', id: 'SELLER_LIST' }],
    }),

    updateLivestockListing: builder.mutation<
      { success: boolean; data: LivestockListing },
      { id: string } & Partial<LivestockListing>
    >({
      query: ({ id, ...body }) => ({
        url: `/livestock/listings/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'LivestockListing', id },
        { type: 'LivestockListing', id: 'LIST' },
        { type: 'LivestockListing', id: 'SELLER_LIST' },
      ],
    }),

    commitEscrowPurchase: builder.mutation<
      { success: boolean; data: LivestockListing },
      { id: string; buyerName: string; buyerPhone: string; escrowAmount: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/livestock/listings/${id}/escrow`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'LivestockListing', id },
        { type: 'LivestockListing', id: 'LIST' },
        { type: 'LivestockListing', id: 'SELLER_LIST' },
      ],
    }),

    releaseEscrow: builder.mutation<{ success: boolean; data: LivestockListing }, string>({
      query: (id) => ({
        url: `/livestock/listings/${id}/escrow/release`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'LivestockListing', id },
        { type: 'LivestockListing', id: 'LIST' },
        { type: 'LivestockListing', id: 'SELLER_LIST' },
      ],
    }),

    refundEscrow: builder.mutation<{ success: boolean; data: LivestockListing }, string>({
      query: (id) => ({
        url: `/livestock/listings/${id}/escrow/refund`,
        method: 'POST',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'LivestockListing', id },
        { type: 'LivestockListing', id: 'LIST' },
        { type: 'LivestockListing', id: 'SELLER_LIST' },
      ],
    }),

    recordHealthPassport: builder.mutation<
      { success: boolean; data: LivestockHealthPassport },
      Partial<LivestockHealthPassport>
    >({
      query: (body) => ({
        url: '/livestock/passport',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { earTagNumber }) => [
        { type: 'LivestockPassport', id: earTagNumber },
        { type: 'LivestockListing', id: 'LIST' },
      ],
    }),

    addVaccineRecord: builder.mutation<
      { success: boolean; data: LivestockHealthPassport },
      { earTag: string; vaccine: string; doseDate: string; nextDueDate: string; batchNo: string; administeredBy: string }
    >({
      query: ({ earTag, ...body }) => ({
        url: `/livestock/passport/${earTag}/vaccine`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { earTag }) => [{ type: 'LivestockPassport', id: earTag }],
    }),

    createAIBooking: builder.mutation<
      { success: boolean; data: ArtificialInseminationBooking },
      Partial<ArtificialInseminationBooking>
    >({
      query: (body) => ({
        url: '/livestock/ai/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AIBooking', id: 'MY_LIST' }, { type: 'AIBooking', id: 'ALL_LIST' }],
    }),

    getMyAIBookings: builder.query<{ success: boolean; data: ArtificialInseminationBooking[] }, void>({
      query: () => '/livestock/ai/bookings/my',
      providesTags: [{ type: 'AIBooking', id: 'MY_LIST' }],
    }),

    getAllAIBookings: builder.query<{ success: boolean; data: ArtificialInseminationBooking[] }, void>({
      query: () => '/livestock/admin/ai/bookings',
      providesTags: [{ type: 'AIBooking', id: 'ALL_LIST' }],
    }),

    updateAIBookingStatus: builder.mutation<
      { success: boolean; data: ArtificialInseminationBooking },
      { id: string } & Partial<ArtificialInseminationBooking>
    >({
      query: ({ id, ...body }) => ({
        url: `/livestock/admin/ai/bookings/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'AIBooking', id: 'MY_LIST' }, { type: 'AIBooking', id: 'ALL_LIST' }],
    }),

    createTransportBooking: builder.mutation<
      { success: boolean; data: LivestockTransportBooking },
      Partial<LivestockTransportBooking>
    >({
      query: (body) => ({
        url: '/livestock/transport/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'LivestockTransport', id: 'MY_LIST' }, { type: 'LivestockTransport', id: 'ALL_LIST' }],
    }),

    getMyTransportBookings: builder.query<{ success: boolean; data: LivestockTransportBooking[] }, void>({
      query: () => '/livestock/transport/bookings/my',
      providesTags: [{ type: 'LivestockTransport', id: 'MY_LIST' }],
    }),

    getAllTransportBookings: builder.query<{ success: boolean; data: LivestockTransportBooking[] }, void>({
      query: () => '/livestock/admin/transport/bookings',
      providesTags: [{ type: 'LivestockTransport', id: 'ALL_LIST' }],
    }),

    updateTransportStatus: builder.mutation<
      { success: boolean; data: LivestockTransportBooking },
      { id: string } & Partial<LivestockTransportBooking>
    >({
      query: ({ id, ...body }) => ({
        url: `/livestock/admin/transport/bookings/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'LivestockTransport', id: 'MY_LIST' }, { type: 'LivestockTransport', id: 'ALL_LIST' }],
    }),
  }),
});

export const {
  useGetLivestockOverviewStatsQuery,
  useGetLivestockListingsQuery,
  useGetLivestockListingByIdQuery,
  useGetLivestockListingByEarTagQuery,
  useGetMeatYieldCalcQuery,
  useGetAIWindowCalcQuery,
  useGetHealthPassportQuery,
  useCreateLivestockListingMutation,
  useGetSellerLivestockListingsQuery,
  useUpdateLivestockListingMutation,
  useCommitEscrowPurchaseMutation,
  useReleaseEscrowMutation,
  useRefundEscrowMutation,
  useRecordHealthPassportMutation,
  useAddVaccineRecordMutation,
  useCreateAIBookingMutation,
  useGetMyAIBookingsQuery,
  useGetAllAIBookingsQuery,
  useUpdateAIBookingStatusMutation,
  useCreateTransportBookingMutation,
  useGetMyTransportBookingsQuery,
  useGetAllTransportBookingsQuery,
  useUpdateTransportStatusMutation,
} = livestockApi;
