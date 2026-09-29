import { api } from '../../store/api';
import { PaginationMeta } from '../catalog/catalogApi';
import { Delivery, DeliveryStatus } from '../deliveries/deliveriesApi';

export type RiderAvailability = 'OFFLINE' | 'AVAILABLE' | 'BUSY';
export type RiderEarningStatus = 'EARNED' | 'PAID';
export type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PayoutMethod = 'BANK_TRANSFER' | 'BKASH' | 'NAGAD' | 'ROCKET';

export interface RiderProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string | null;
  avatar?: string | null;
  nidNumber?: string | null;
  address?: string | null;
  preferredZone?: string | null;
  emergencyContact?: string | null;
  vehicleType: string;
  vehiclePlateNumber?: string | null;
  drivingLicenseNumber?: string | null;
  availability: RiderAvailability;
  isVerified: boolean;
  lastAvailableAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRiderProfileRequest {
  address?: string;
  preferredZone?: string;
  emergencyContact?: string;
  vehicleType?: string;
  vehiclePlateNumber?: string;
}

export interface RiderEarningsSummary {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarned: number;
  pendingPayout: number;
  paidOut: number;
  availableBalance: number;
  totalDeliveries: number;
}

export interface RiderEarning {
  id: string;
  deliveryId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: RiderEarningStatus;
  deliveredAt?: string | null;
  createdAt: string;
}

export interface RiderEarningsResponse {
  summary: RiderEarningsSummary;
  data: RiderEarning[];
  meta: PaginationMeta;
}

export interface RiderDashboardMetrics {
  todayDeliveries: number;
  pendingAssignments: number;
  activeDeliveries: number;
  todayCompleted: number;
  totalCompleted: number;
}

export interface RiderDashboardResponse {
  availability: RiderAvailability;
  isVerified: boolean;
  metrics: RiderDashboardMetrics;
  earnings: RiderEarningsSummary;
  activeDelivery: Delivery | null;
  newAssignments: Delivery[];
  recentDeliveries: Delivery[];
}

export interface RiderPayout {
  id: string;
  riderId?: string | null;
  sellerId?: string | null;
  amount: number;
  method: PayoutMethod;
  accountDetails: string;
  status: PayoutStatus;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiderHistoryParams {
  status?: DeliveryStatus;
  search?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface RiderEarningsParams {
  status?: RiderEarningStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const ridersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRiderProfile: builder.query<RiderProfile, void>({
      query: () => '/riders/me',
      providesTags: ['RiderProfile'],
    }),
    updateRiderProfile: builder.mutation<RiderProfile, UpdateRiderProfileRequest>({
      query: (body) => ({
        url: '/riders/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['RiderProfile'],
    }),
    updateRiderAvailability: builder.mutation<
      RiderProfile,
      { availability: Exclude<RiderAvailability, 'BUSY'> }
    >({
      query: (body) => ({
        url: '/riders/me/availability',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['RiderProfile', 'Order'],
    }),
    getRiderOperationalDashboard: builder.query<RiderDashboardResponse, void>({
      query: () => '/riders/me/dashboard',
      providesTags: ['RiderProfile', 'Order'],
    }),
    getRiderEarnings: builder.query<RiderEarningsResponse, RiderEarningsParams | void>({
      query: (params) => ({
        url: '/riders/me/earnings',
        params: params ?? undefined,
      }),
      providesTags: ['RiderEarning', 'Payout'],
    }),
    getRiderHistory: builder.query<
      { data: Delivery[]; meta: PaginationMeta },
      RiderHistoryParams | void
    >({
      query: (params) => ({
        url: '/deliveries/rider/history',
        params: params ?? undefined,
      }),
      providesTags: ['Order'],
    }),
    getRiderPayouts: builder.query<RiderPayout[], void>({
      query: () => '/payouts/rider/my-requests',
      providesTags: ['Payout'],
    }),
    requestRiderPayout: builder.mutation<
      RiderPayout,
      { amount: number; method: PayoutMethod; accountDetails: string }
    >({
      query: (body) => ({
        url: '/payouts/rider/request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payout', 'RiderEarning'],
    }),
  }),
});

export const {
  useGetRiderProfileQuery,
  useUpdateRiderProfileMutation,
  useUpdateRiderAvailabilityMutation,
  useGetRiderOperationalDashboardQuery,
  useGetRiderEarningsQuery,
  useGetRiderHistoryQuery,
  useGetRiderPayoutsQuery,
  useRequestRiderPayoutMutation,
} = ridersApi;
