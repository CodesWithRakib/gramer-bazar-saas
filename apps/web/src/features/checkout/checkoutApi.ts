import { api } from '../../store/api';
import { PaymentMethod } from '../../../../api/src/orders/enums/order-status.enum'; // Actually, let's redefine locally to avoid coupling to api/src.

export enum FrontendPaymentMethod {
  COD = 'COD',
  ONLINE = 'ONLINE',
}

export interface CheckoutRequest {
  addressId: string;
  paymentMethod: FrontendPaymentMethod;
  items: {
    sellerProductId: string;
    quantity: number;
  }[];
}

export interface CheckoutResponse {
  id: string;
  total: number;
  // other fields
}

export const checkoutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({
        url: '/orders/checkout',
        method: 'POST',
        body,
      }),
    }),
    getAddresses: builder.query<any[], void>({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),
    addAddress: builder.mutation<any, any>({
      query: (body) => ({
        url: '/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Address'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
} = checkoutApi;
