import { api } from "../../store/api";

export interface Address {
  id: string;
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactName: string;
  contactPhone: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactName: string;
  contactPhone: string;
  isDefault?: boolean;
}

export const addressesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => "/addresses",
      providesTags: ["Address"],
    }),
    createAddress: builder.mutation<Address, CreateAddressRequest>({
      query: (body) => ({
        url: "/addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Address"],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
} = addressesApi;
