import { api } from '../../store/api';

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<{ data: any[], meta: any }, { productId: string, page?: number, limit?: number }>({
      query: ({ productId, page = 1, limit = 10 }) => `/reviews/product/${productId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }],
    }),
    addReview: builder.mutation<any, { productId: string, rating: number, comment?: string }>({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }, 'Review'],
    }),
    getUserReviews: builder.query<any[], void>({
      query: () => '/reviews/user',
      providesTags: ['Review'],
    }),
    getAdminReviews: builder.query<{ data: any[]; meta: any }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/reviews/admin',
        params,
      }),
      providesTags: ['Review'],
    }),
    moderateReview: builder.mutation<any, { id: string, isApproved: boolean }>({
      query: ({ id, isApproved }) => ({
        url: `/reviews/admin/${id}/moderate`,
        method: 'PATCH',
        body: { isApproved },
      }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useAddReviewMutation,
  useGetUserReviewsQuery,
  useGetAdminReviewsQuery,
  useModerateReviewMutation,
} = reviewsApi;
