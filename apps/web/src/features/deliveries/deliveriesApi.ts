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
  assignedAt: string;
  pickupTime: string;
  deliveryTime: string;
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

export const deliveriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ADMIN ENDPOINTS
    getAdminDeliveries: builder.query<{ data: Delivery[]; meta: PaginationMeta }, { page?: number; limit?: number; search?: string }>({
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
    getRiderDeliveries: builder.query<Delivery[], void>({
      query: () => '/deliveries/rider/assigned',
      providesTags: ['Order'],
    }),
    getRiderDeliveryDetails: builder.query<Delivery, string>({
      query: (id) => `/deliveries/rider/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    updateDeliveryStatus: builder.mutation<Delivery, { id: string; status: DeliveryStatus; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/deliveries/rider/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
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
  useGetRiderDeliveriesQuery,
  useGetRiderDeliveryDetailsQuery,
  useUpdateDeliveryStatusMutation,
  useGetCustomerDeliveryQuery,
} = deliveriesApi;
