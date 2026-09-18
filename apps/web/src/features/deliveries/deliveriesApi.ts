import { api } from '../../store/api';

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
    getAdminDeliveries: builder.query<{ data: any[]; meta: any }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/deliveries/admin',
        params,
      }),
      providesTags: ['Order'],
    }),
    getRiders: builder.query<any[], void>({
      query: () => '/deliveries/admin/riders',
      providesTags: ['User'],
    }),
    assignDelivery: builder.mutation<any, { orderId: string; riderId: string }>({
      query: (body) => ({
        url: '/deliveries/admin/assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    // RIDER ENDPOINTS
    getRiderDeliveries: builder.query<any[], void>({
      query: () => '/deliveries/rider/assigned',
      providesTags: ['Order'],
    }),
    getRiderDeliveryDetails: builder.query<any, string>({
      query: (id) => `/deliveries/rider/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    updateDeliveryStatus: builder.mutation<any, { id: string; status: DeliveryStatus; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/deliveries/rider/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }, 'Order'],
    }),

    // CUSTOMER ENDPOINTS
    getCustomerDelivery: builder.query<any, string>({
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
