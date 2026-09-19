import { api } from '../../store/api';
import { PaginationMeta } from '../catalog/catalogApi';

export interface Review {
  id: string;
  productId: string;
  product?: {
    id: string;
    nameEn: string;
    nameBn: string;
    slug?: string;
    images?: string[];
  };
  userId: string;
  user?: {
    id: string;
    name?: string;
    nameEn?: string;
    nameBn?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<{ data: Review[], meta: PaginationMeta }, { productId: string, page?: number, limit?: number }>({
      query: ({ productId, page = 1, limit = 10 }) => `/reviews/product/${productId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }],
    }),
    addReview: builder.mutation<Review, { productId: string, rating: number, comment?: string }>({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }, 'Review'],
    }),
    getUserReviews: builder.query<Review[], void>({
      query: () => '/reviews/user',
      providesTags: ['Review'],
    }),
    getAdminReviews: builder.query<{ data: Review[]; meta: PaginationMeta }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/reviews/admin',
        params,
      }),
      providesTags: ['Review'],
    }),
    moderateReview: builder.mutation<Review, { id: string, isApproved: boolean }>({
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
