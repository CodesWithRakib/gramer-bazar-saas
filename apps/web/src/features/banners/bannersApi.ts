import { api } from '@/store/api';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerRequest {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export const bannersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicBanners: builder.query<Banner[], void>({
      query: () => '/banners/public',
      providesTags: ['Banner'],
    }),
    getAdminBanners: builder.query<Banner[], void>({
      query: () => '/banners',
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation<Banner, CreateBannerRequest>({
      query: (body) => ({
        url: '/banners',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation<Banner, { id: string; data: Partial<CreateBannerRequest> }>({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPublicBannersQuery,
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannersApi;
