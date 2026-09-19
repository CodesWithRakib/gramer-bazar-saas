import { api } from '../../store/api';

export interface Address {
  id: string;
  userId: string;
  title: string;
  contactName: string;
  contactPhone: string;
  countryId: string;
  divisionId: string;
  districtId: string;
  upazilaId: string;
  unionId: string;
  areaId: string;
  streetAddress: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
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
  order: {
    id: string;
    total: number;
    // other fields
  };
  paymentUrl: string | null;
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
    getAddresses: builder.query<Address[], void>({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),
    addAddress: builder.mutation<Address, Partial<Address>>({
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
