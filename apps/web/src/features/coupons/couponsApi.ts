import { api } from '../../store/api';
import { PaginationMeta } from '../catalog/catalogApi';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usedCount: number;
  customerUsageLimit: number;
  isActive: boolean;
  shopId: string | null;
  createdAt: string;
}

export const couponsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCoupons: builder.query<{ data: Coupon[]; meta: PaginationMeta }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/admin/coupons',
        params,
      }),
      providesTags: ['Coupon'],
    }),
    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (body) => ({
        url: '/admin/coupons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation<Coupon, { id: string; data: Partial<Coupon> }>({
      query: ({ id, data }) => ({
        url: `/admin/coupons/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),
    getSellerCoupons: builder.query<{ data: Coupon[]; meta: PaginationMeta }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/seller/coupons',
        params,
      }),
      providesTags: ['Coupon'],
    }),
    createSellerCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (body) => ({
        url: '/seller/coupons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Coupon'],
    }),
    updateSellerCoupon: builder.mutation<Coupon, { id: string; data: Partial<Coupon> }>({
      query: ({ id, data }) => ({
        url: `/seller/coupons/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Coupon'],
    }),
    deleteSellerCoupon: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/seller/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupon'],
    }),
    getShopCoupons: builder.query<Coupon[], string>({
      query: (shopId) => `/coupons/shop/${shopId}`,
      providesTags: ['Coupon'],
    }),
    validateCoupon: builder.mutation<{ discountAmount: number; subtotalAfterDiscount: number; code: string; couponId: string }, { code: string; subtotal: number }>({
      query: (body) => ({
        url: '/coupons/validate',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetSellerCouponsQuery,
  useCreateSellerCouponMutation,
  useUpdateSellerCouponMutation,
  useDeleteSellerCouponMutation,
  useGetShopCouponsQuery,
  useValidateCouponMutation,
} = couponsApi;
