import { api } from '@/store/api';

export type MachineryCategory =
  | 'POWER_TILLER'
  | 'TRACTOR'
  | 'COMBINE_HARVESTER'
  | 'IRRIGATION_PUMP_DIESEL'
  | 'IRRIGATION_PUMP_SOLAR'
  | 'PADDY_THRESHER'
  | 'SPRAYING_DRONE'
  | 'SEED_PLANTER'
  | 'OTHER';

export type PricingBasis = 'PER_BIGHA' | 'PER_HOUR' | 'PER_DAY';
export type FuelOption = 'FUEL_INCLUDED' | 'FUEL_EXCLUDED';
export type OperatorOption = 'OPERATOR_INCLUDED' | 'SELF_OPERATED';
export type MachineryStatus = 'AVAILABLE' | 'MAINTENANCE' | 'BUSY' | 'INACTIVE';
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';
export type MachineryPaymentStatus = 'ESCROW_HOLD' | 'PAID' | 'REFUNDED' | 'PARTIAL_RELEASE';
export type InspectionType = 'PRE_DISPATCH' | 'POST_RETURN';

export interface MachineryItem {
  id: string;
  ownerId: string;
  owner?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    phone: string;
  };
  titleEn: string;
  titleBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  category: MachineryCategory;
  modelNumber?: string;
  pricingBasis: PricingBasis;
  baseRate: number;
  securityDeposit: number;
  fuelOption: FuelOption;
  operatorOption: OperatorOption;
  operatorDailyAllowance: number;
  status: MachineryStatus;
  images?: string[];
  division: string;
  district: string;
  upazila: string;
  union?: string;
  village?: string;
  serviceRadiusKm: number;
  neighborClusterDiscountPct: number;
  createdAt: string;
  updatedAt: string;
}

export interface MachineryBooking {
  id: string;
  bookingReference: string;
  machineryId: string;
  machinery?: MachineryItem;
  renterId: string;
  renterName: string;
  renterPhone: string;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  plotUnion?: string;
  plotVillage?: string;
  plotSizeValue: number;
  startDate: string;
  endDate: string;
  baseRate: number;
  totalRentalFee: number;
  fuelOption: FuelOption;
  fuelSurcharge: number;
  operatorOption: OperatorOption;
  operatorFee: number;
  isClusterDiscountApplied: boolean;
  clusterDiscountAmount: number;
  securityDeposit: number;
  grandTotal: number;
  status: BookingStatus;
  paymentStatus: MachineryPaymentStatus;
  clusterTag?: string;
  notes?: string;
  cancellationReason?: string;
  inspections?: MachineryInspection[];
  createdAt: string;
  updatedAt: string;
}

export interface MachineryInspection {
  id: string;
  bookingId: string;
  machineryId: string;
  inspectorId: string;
  inspectionType: InspectionType;
  meterHours: number;
  fuelLevelPct: number;
  isEngineOperational: boolean;
  isOperational: boolean;
  damageNotes?: string;
  damagePhotos?: string[];
  claimDamageDeduction: number;
  isApprovedByRenter: boolean;
  createdAt: string;
}

export interface QuoteMachineryBookingDto {
  machineryId: string;
  plotSizeValue: number;
  startDate: string;
  endDate: string;
  plotDistrict: string;
  plotUpazila: string;
  plotUnion?: string;
  plotVillage?: string;
  fuelOption?: FuelOption;
  operatorOption?: OperatorOption;
}

export interface QuoteResult {
  item: MachineryItem;
  plotSizeValue: number;
  baseRate: number;
  totalRentalFee: number;
  fuelSurcharge: number;
  operatorFee: number;
  isClusterDiscountApplied: boolean;
  clusterDiscountAmount: number;
  securityDeposit: number;
  grandTotal: number;
  clusterTag: string | null;
}

export interface CreateMachineryBookingDto extends QuoteMachineryBookingDto {
  renterName: string;
  renterPhone: string;
  plotAddress: string;
  notes?: string;
}

export interface CreateMachineryItemDto {
  titleEn: string;
  titleBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  category: MachineryCategory;
  modelNumber?: string;
  pricingBasis: PricingBasis;
  baseRate: number;
  securityDeposit?: number;
  fuelOption: FuelOption;
  operatorOption: OperatorOption;
  operatorDailyAllowance?: number;
  images?: string[];
  division: string;
  district: string;
  upazila: string;
  union?: string;
  village?: string;
  serviceRadiusKm?: number;
  neighborClusterDiscountPct?: number;
}

export interface CreateMachineryInspectionDto {
  inspectionType: InspectionType;
  meterHours: number;
  fuelLevelPct: number;
  isEngineOperational: boolean;
  isOperational: boolean;
  damageNotes?: string;
  damagePhotos?: string[];
  claimDamageDeduction?: number;
}

export interface QueryMachineryDto {
  category?: MachineryCategory;
  district?: string;
  upazila?: string;
  pricingBasis?: PricingBasis;
  minRate?: number;
  maxRate?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export const machineryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMachineryItems: builder.query<{ items: MachineryItem[]; total: number; page: number; limit: number }, QueryMachineryDto>({
      query: (params) => ({
        url: '/machinery-rental/items',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'MachineryItem' as const, id })),
              { type: 'MachineryItem', id: 'LIST' },
            ]
          : [{ type: 'MachineryItem', id: 'LIST' }],
    }),

    getMachineryItemById: builder.query<MachineryItem, string>({
      query: (id) => `/machinery-rental/items/${id}`,
      providesTags: (result, error, id) => [{ type: 'MachineryItem', id }],
    }),

    calculateQuote: builder.mutation<QuoteResult, QuoteMachineryBookingDto>({
      query: (body) => ({
        url: '/machinery-rental/quote',
        method: 'POST',
        body,
      }),
    }),

    createMachineryBooking: builder.mutation<MachineryBooking, CreateMachineryBookingDto>({
      query: (body) => ({
        url: '/machinery-rental/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MachineryBooking', id: 'LIST' }],
    }),

    getMyMachineryBookings: builder.query<MachineryBooking[], void>({
      query: () => '/machinery-rental/my-bookings',
      providesTags: [{ type: 'MachineryBooking', id: 'MY_LIST' }],
    }),

    getMachineryBookingById: builder.query<MachineryBooking, string>({
      query: (id) => `/machinery-rental/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'MachineryBooking', id }],
    }),

    updateMachineryBookingStatus: builder.mutation<
      MachineryBooking,
      { id: string; status: BookingStatus; cancellationReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/machinery-rental/bookings/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MachineryBooking', id },
        { type: 'MachineryBooking', id: 'LIST' },
        { type: 'MachineryBooking', id: 'MY_LIST' },
      ],
    }),

    // Owner fleet management
    getOwnerMachineryItems: builder.query<MachineryItem[], void>({
      query: () => '/machinery-rental/owner/items',
      providesTags: [{ type: 'MachineryItem', id: 'OWNER_LIST' }],
    }),

    createMachineryItem: builder.mutation<MachineryItem, CreateMachineryItemDto>({
      query: (body) => ({
        url: '/machinery-rental/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'MachineryItem', id: 'LIST' },
        { type: 'MachineryItem', id: 'OWNER_LIST' },
      ],
    }),

    updateMachineryItem: builder.mutation<
      MachineryItem,
      { id: string; data: Partial<CreateMachineryItemDto> & { status?: MachineryStatus } }
    >({
      query: ({ id, data }) => ({
        url: `/machinery-rental/items/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MachineryItem', id },
        { type: 'MachineryItem', id: 'LIST' },
        { type: 'MachineryItem', id: 'OWNER_LIST' },
      ],
    }),

    getOwnerMachineryBookings: builder.query<MachineryBooking[], void>({
      query: () => '/machinery-rental/owner/bookings',
      providesTags: [{ type: 'MachineryBooking', id: 'OWNER_BOOKINGS' }],
    }),

    submitMachineryInspection: builder.mutation<
      MachineryInspection,
      { id: string; data: CreateMachineryInspectionDto }
    >({
      query: ({ id, data }) => ({
        url: `/machinery-rental/bookings/${id}/inspect`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MachineryBooking', id },
        { type: 'MachineryBooking', id: 'OWNER_BOOKINGS' },
        { type: 'MachineryBooking', id: 'LIST' },
        { type: 'MachineryBooking', id: 'MY_LIST' },
      ],
    }),

    // Admin endpoints
    getAdminMachineryBookings: builder.query<MachineryBooking[], { status?: BookingStatus } | void>({
      query: (params) => ({
        url: '/machinery-rental/admin/bookings',
        method: 'GET',
        params: params || {},
      }),
      providesTags: [{ type: 'MachineryBooking', id: 'ADMIN_LIST' }],
    }),

    resolveMachineryDeposit: builder.mutation<
      MachineryBooking,
      { id: string; refundDepositAmount: number; deductDamageAmount: number; adminNotes: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/machinery-rental/admin/bookings/${id}/resolve-deposit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'MachineryBooking', id },
        { type: 'MachineryBooking', id: 'ADMIN_LIST' },
      ],
    }),
  }),
});

export const {
  useGetMachineryItemsQuery,
  useGetMachineryItemByIdQuery,
  useCalculateQuoteMutation,
  useCreateMachineryBookingMutation,
  useGetMyMachineryBookingsQuery,
  useGetMachineryBookingByIdQuery,
  useUpdateMachineryBookingStatusMutation,
  useGetOwnerMachineryItemsQuery,
  useCreateMachineryItemMutation,
  useUpdateMachineryItemMutation,
  useGetOwnerMachineryBookingsQuery,
  useSubmitMachineryInspectionMutation,
  useGetAdminMachineryBookingsQuery,
  useResolveMachineryDepositMutation,
} = machineryApi;
