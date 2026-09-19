import { api } from '@/store/api';

export interface Shop {
  id: string;
  sellerId: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export const shopsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query<Shop[], void>({
      query: () => '/shops',
      providesTags: ['Shop'],
    }),
    getShopById: builder.query<Shop, string>({
      query: (id) => `/shops/${id}`,
      providesTags: (result, error, id) => [{ type: 'Shop', id }],
    }),
    // Public queries could also use shop slug, but for now ID is fine since the backend /shops/:id is configured.
  }),
  overrideExisting: false,
});

export const {
  useGetShopsQuery,
  useGetShopByIdQuery,
} = shopsApi;
