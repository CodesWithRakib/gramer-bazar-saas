import { api } from '@/store/api';

export type StayType =
  | 'TRADITIONAL_MUD_HOUSE'
  | 'TEA_ESTATE_ECO_COTTAGE'
  | 'MANGO_LITCHI_ORCHARD_CAMP'
  | 'RIVER_BEEL_WATER_VILLA'
  | 'HILL_TRACT_BAMBOO_LODGE'
  | 'SUNDARBANS_MANGROVE_BORDER';

export type ExperienceCategory =
  | 'FRUIT_HARVEST_TASTING'
  | 'ARTISANAL_HONEY_EXTRACTION'
  | 'TRADITIONAL_FISHING_CATCH_COOK'
  | 'CLAY_STOVE_VILLAGE_COOKING'
  | 'POTTERY_HANDICRAFT_WORKSHOP'
  | 'ORGANIC_FARMING_HARVEST';

export type MealPlanOption =
  | 'ALL_INCLUSIVE_ORGANIC'
  | 'BREAKFAST_ONLY'
  | 'SELF_COOKING_FARM_INGREDIENTS'
  | 'NONE';

export type BookingEscrowStatus =
  | 'PENDING_DEPOSIT'
  | 'ESCROW_CONFIRMED_RESERVED'
  | 'CHECKED_IN_VERIFIED'
  | 'COMPLETED_PAYOUT_RELEASED'
  | 'CANCELLED_REFUNDED';

export interface AgroExperiencePackage {
  id: string;
  farmStayId: string;
  titleEn: string;
  titleBn: string;
  category: ExperienceCategory;
  durationHours: number;
  pricePerPersonBdt: number;
  minParticipants: number;
  maxParticipants: number;
  includesSafetyGear: boolean;
  includesFarmRefreshment: boolean;
  description: string | null;
  isActive: boolean;
  farmStay?: FarmStayListing;
  createdAt?: string;
  updatedAt?: string;
}

export interface FarmStayListing {
  id: string;
  hostId: string;
  titleEn: string;
  titleBn: string;
  stayType: StayType;
  district: string;
  upazila: string;
  villageAddress: string;
  latitude: number | null;
  longitude: number | null;
  hostName: string;
  hostPhone: string;
  hostNidVerified: boolean;
  maxGuests: number;
  bedroomCount: number;
  bedCount: number;
  hasAttachedBath: boolean;
  nightlyRateBdt: number;
  weekendRateBdt: number;
  allInclusiveMealCostPerPerson: number;
  hasSolarElectricity: boolean;
  hasPureTubeWellWater: boolean;
  hasOrganicFarmHarvestAccess: boolean;
  hasClayStoveCooking: boolean;
  hasTraditionalBoatTour: boolean;
  isActive: boolean;
  description: string | null;
  photos: string[] | null;
  experiences?: AgroExperiencePackage[];
  createdAt: string;
  updatedAt: string;
}

export interface FarmStayBooking {
  id: string;
  bookingNumber: string;
  guestUserId: string;
  guestName: string;
  guestPhone: string;
  guestNidPassport: string | null;
  farmStayId: string;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  adultGuestsCount: number;
  childGuestsCount: number;
  mealPlan: MealPlanOption;
  selectedExperienceIds: string[] | null;
  staySubtotalBdt: number;
  mealSubtotalBdt: number;
  experiencesSubtotalBdt: number;
  serviceFeeBdt: number;
  totalAmountBdt: number;
  escrowStatus: BookingEscrowStatus;
  checkInPinCode: string;
  specialRequests: string | null;
  checkedInAt: string | null;
  payoutReleasedAt: string | null;
  farmStay?: FarmStayListing;
  createdAt: string;
  updatedAt: string;
}

export interface AgroTourismOverviewStats {
  totalFarmStays: number;
  activeVerifiedHosts: number;
  totalActiveBookings: number;
  totalRuralTourismRevenueBdt: number;
  averageNightlyRateBdt: number;
}

export interface PriceCalculationResult {
  nightsCount: number;
  staySubtotalBdt: number;
  mealSubtotalBdt: number;
  experiencesSubtotalBdt: number;
  serviceFeeBdt: number;
  totalAmountBdt: number;
  mealPlanDescriptionBn: string;
}

export const agroTourismApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAgroTourismOverviewStats: builder.query<{ success: boolean; data: AgroTourismOverviewStats }, void>({
      query: () => '/agro-tourism/stats/overview',
      providesTags: ['FarmStay', 'AgroBooking'],
    }),

    getFarmStays: builder.query<
      { success: boolean; data: FarmStayListing[] },
      { district?: string; stayType?: StayType; guests?: number; maxNightlyRate?: number } | void
    >({
      query: (params) => ({
        url: '/agro-tourism/stays',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'FarmStay' as const, id })),
              { type: 'FarmStay', id: 'LIST' },
            ]
          : [{ type: 'FarmStay', id: 'LIST' }],
    }),

    getFarmStayById: builder.query<{ success: boolean; data: FarmStayListing }, string>({
      query: (id) => `/agro-tourism/stays/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'FarmStay', id }],
    }),

    getAgroExperiences: builder.query<
      { success: boolean; data: AgroExperiencePackage[] },
      string | void
    >({
      query: (farmStayId) => ({
        url: '/agro-tourism/experiences',
        params: farmStayId ? { farmStayId } : {},
      }),
      providesTags: [{ type: 'AgroExperience', id: 'LIST' }],
    }),

    calculateBookingPrice: builder.mutation<
      { success: boolean; data: PriceCalculationResult },
      {
        farmStayId: string;
        checkInDate: string;
        checkOutDate: string;
        adultGuestsCount: number;
        childGuestsCount?: number;
        mealPlan: MealPlanOption;
        selectedExperienceIds?: string[];
      }
    >({
      query: (body) => ({
        url: '/agro-tourism/calculate-price',
        method: 'POST',
        body,
      }),
    }),

    createBooking: builder.mutation<
      { success: boolean; data: FarmStayBooking },
      Partial<FarmStayBooking> & {
        farmStayId: string;
        checkInDate: string;
        checkOutDate: string;
        adultGuestsCount: number;
        childGuestsCount?: number;
        mealPlan: MealPlanOption;
        guestName: string;
        guestPhone: string;
        guestNidPassport?: string;
        specialRequests?: string;
        selectedExperienceIds?: string[];
      }
    >({
      query: (body) => ({
        url: '/agro-tourism/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AgroBooking', id: 'MY_LIST' }, { type: 'AgroBooking', id: 'ADMIN_LIST' }],
    }),

    getMyBookings: builder.query<{ success: boolean; data: FarmStayBooking[] }, void>({
      query: () => '/agro-tourism/bookings/my',
      providesTags: [{ type: 'AgroBooking', id: 'MY_LIST' }],
    }),

    getHostListings: builder.query<{ success: boolean; data: FarmStayListing[] }, void>({
      query: () => '/agro-tourism/host/my-listings',
      providesTags: [{ type: 'FarmStay', id: 'HOST_LIST' }],
    }),

    createFarmStay: builder.mutation<{ success: boolean; data: FarmStayListing }, Partial<FarmStayListing>>({
      query: (body) => ({
        url: '/agro-tourism/host/listings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'FarmStay', id: 'LIST' }, { type: 'FarmStay', id: 'HOST_LIST' }],
    }),

    updateFarmStay: builder.mutation<
      { success: boolean; data: FarmStayListing },
      { id: string } & Partial<FarmStayListing>
    >({
      query: ({ id, ...body }) => ({
        url: `/agro-tourism/host/listings/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'FarmStay', id },
        { type: 'FarmStay', id: 'LIST' },
        { type: 'FarmStay', id: 'HOST_LIST' },
      ],
    }),

    createExperience: builder.mutation<
      { success: boolean; data: AgroExperiencePackage },
      Partial<AgroExperiencePackage>
    >({
      query: (body) => ({
        url: '/agro-tourism/host/experiences',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AgroExperience', id: 'LIST' }],
    }),

    getHostBookings: builder.query<{ success: boolean; data: FarmStayBooking[] }, void>({
      query: () => '/agro-tourism/host/bookings',
      providesTags: [{ type: 'AgroBooking', id: 'HOST_LIST' }],
    }),

    verifyCheckIn: builder.mutation<
      { success: boolean; data: FarmStayBooking },
      { bookingNumber: string; checkInPinCode: string }
    >({
      query: (body) => ({
        url: '/agro-tourism/host/verify-checkin',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'AgroBooking', id: 'MY_LIST' },
        { type: 'AgroBooking', id: 'HOST_LIST' },
        { type: 'AgroBooking', id: 'ADMIN_LIST' },
      ],
    }),

    getAllAdminBookings: builder.query<{ success: boolean; data: FarmStayBooking[] }, void>({
      query: () => '/agro-tourism/admin/bookings',
      providesTags: [{ type: 'AgroBooking', id: 'ADMIN_LIST' }],
    }),

    releaseEscrowPayout: builder.mutation<{ success: boolean; data: FarmStayBooking }, string>({
      query: (id) => ({
        url: `/agro-tourism/admin/bookings/${id}/release-payout`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'AgroBooking', id: 'MY_LIST' },
        { type: 'AgroBooking', id: 'HOST_LIST' },
        { type: 'AgroBooking', id: 'ADMIN_LIST' },
      ],
    }),
  }),
});

export const {
  useGetAgroTourismOverviewStatsQuery,
  useGetFarmStaysQuery,
  useGetFarmStayByIdQuery,
  useGetAgroExperiencesQuery,
  useCalculateBookingPriceMutation,
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetHostListingsQuery,
  useCreateFarmStayMutation,
  useUpdateFarmStayMutation,
  useCreateExperienceMutation,
  useGetHostBookingsQuery,
  useVerifyCheckInMutation,
  useGetAllAdminBookingsQuery,
  useReleaseEscrowPayoutMutation,
} = agroTourismApi;
