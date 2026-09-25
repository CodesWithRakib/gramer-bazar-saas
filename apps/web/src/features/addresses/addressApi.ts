import { api } from '../../store/api';
import { Location, Area } from '../locations/locationApi';

export interface Address {
  id: string;
  title: string;
  contactName: string;
  contactPhone: string;
  countryId?: string;
  country?: Location;
  divisionId?: string;
  division?: Location;
  districtId?: string;
  district?: Location;
  upazilaId?: string;
  upazila?: Location;
  unionId?: string;
  union?: Location;
  areaId?: string;
  area?: Area;
  streetAddress: string;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateAddressRequest = Omit<Address, 'id' | 'createdAt' | 'updatedAt' | 'country' | 'division' | 'district' | 'upazila' | 'union' | 'area'>;
export type UpdateAddressRequest = Partial<CreateAddressRequest>;


export const addressApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),
    getAddressById: builder.query<Address, string>({
      query: (id) => `/addresses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Address', id }],
    }),
    createAddress: builder.mutation<Address, CreateAddressRequest>({
      query: (body) => ({
        url: '/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Address'],
    }),
    updateAddress: builder.mutation<Address, { id: string; body: UpdateAddressRequest }>({
      query: ({ id, body }) => ({
        url: `/addresses/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Address', id }, 'Address'],
    }),
    deleteAddress: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAddressesQuery,
  useGetAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
