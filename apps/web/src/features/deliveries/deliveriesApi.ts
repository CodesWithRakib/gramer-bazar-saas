import { api } from '../../store/api';
import { PaginationMeta } from '../catalog/catalogApi';
import { User } from '../users/usersApi';
import { Order } from '../orders/ordersApi';

export interface Delivery {
  id: string;
  orderId: string;
  order: Order;
  riderId: string;
  rider: User;
  status: DeliveryStatus;
  courierProvider?: 'MOCK' | 'STEADFAST' | 'PATHAO' | null;
  consignmentId?: string | null;
  trackingCode?: string | null;
  courierStatus?: string | null;
  riderEarning?: number | null;
  assignedAt: string;
  pickupTime: string;
  deliveryTime: string;
  currentLat?: number;
  currentLng?: number;
  lastLocationUpdatedAt?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export enum DeliveryStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface RiderDashboardMetrics {
  assignedCount: number;
  activeCount: number;
  completedCount: number;
  totalEarnings: number;
}

export interface RiderDeliveryTrendPoint {
  name: string;
  completed: number;
  pending: number;
  earnings: number;
}

export interface RiderDashboardResponse {
  metrics: RiderDashboardMetrics;
  deliveriesTrend: RiderDeliveryTrendPoint[];
  recentDeliveries: Delivery[];
}

export const deliveriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ADMIN ENDPOINTS
    getAdminDeliveries: builder.query<
      { data: Delivery[]; meta: PaginationMeta },
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: '/deliveries/admin',
        params,
      }),
      providesTags: ['Order'],
    }),
    getRiders: builder.query<User[], void>({
      query: () => '/deliveries/admin/riders',
      providesTags: ['User'],
    }),
    assignDelivery: builder.mutation<Delivery, { orderId: string; riderId: string }>({
      query: (body) => ({
        url: '/deliveries/admin/assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    // RIDER ENDPOINTS
    getRiderDashboard: builder.query<RiderDashboardResponse, void>({
      query: () => '/deliveries/rider/dashboard',
      providesTags: ['Order'],
    }),
    getRiderDeliveries: builder.query<Delivery[], void>({
      query: () => '/deliveries/rider/assigned',
      providesTags: ['Order'],
    }),
    getRiderDeliveryDetails: builder.query<Delivery, string>({
      query: (id) => `/deliveries/rider/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    updateDeliveryStatus: builder.mutation<
      Delivery,
      { id: string; status: DeliveryStatus; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/deliveries/rider/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),
    updateRiderLocation: builder.mutation<Delivery, { id: string; lat: number; lng: number }>({
      query: ({ id, ...body }) => ({
        url: `/deliveries/rider/${id}/location`,
        method: 'PATCH',
        body,
      }),
      // Don't invalidate entire order list for location updates to avoid excessive re-fetching,
      // it mainly updates the specific delivery query anyway.
    }),

    // COURIER 3PL ENDPOINTS
    bookCourier: builder.mutation<
      {
        success: boolean;
        consignmentId: string;
        trackingCode: string;
        courierStatus: string;
        courierProvider: string;
      },
      { orderId: string; provider?: 'MOCK' | 'STEADFAST' | 'PATHAO'; note?: string }
    >({
      query: (body) => ({
        url: '/courier/admin/book',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
    trackCourier: builder.query<
      {
        provider: string;
        trackingCode: string;
        status: string;
        raw?: any;
      },
      string
    >({
      query: (trackingCode) => `/courier/track/${trackingCode}`,
    }),

    // CUSTOMER ENDPOINTS
    getCustomerDelivery: builder.query<Delivery, string>({
      query: (orderId) => `/deliveries/customer/${orderId}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
  }),
});

export const {
  useGetAdminDeliveriesQuery,
  useGetRidersQuery,
  useAssignDeliveryMutation,
  useBookCourierMutation,
  useTrackCourierQuery,
  useGetRiderDashboardQuery,
  useGetRiderDeliveriesQuery,
  useGetRiderDeliveryDetailsQuery,
  useUpdateDeliveryStatusMutation,
  useUpdateRiderLocationMutation,
  useGetCustomerDeliveryQuery,
} = deliveriesApi;
