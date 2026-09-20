import { api } from '../../store/api';
import { PaginationMeta } from '../catalog/catalogApi';
import { Product } from '../catalog/catalogApi';

export interface FlashSaleItem {
  id: string;
  flashSaleId: string;
  sellerProductId: string;
  sellerProduct?: {
    id: string;
    product: Product;
    price: number;
    shopId: string;
  };
  discountPrice: number;
  quantityAvailable: number;
  quantitySold: number;
}

export interface FlashSale {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerImage: string | null;
  items?: FlashSaleItem[];
  createdAt: string;
}

export const flashSalesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActiveFlashSales: builder.query<FlashSale[], void>({
      query: () => '/flash-sales/active',
      providesTags: ['FlashSale'],
    }),
    getFlashSaleById: builder.query<FlashSale, string>({
      query: (id) => `/flash-sales/${id}`,
      providesTags: (result, error, id) => [{ type: 'FlashSale', id }],
    }),
    getAdminFlashSales: builder.query<{ data: FlashSale[]; meta: PaginationMeta }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/flash-sales',
        params,
      }),
      providesTags: ['FlashSale'],
    }),
    createFlashSale: builder.mutation<FlashSale, Partial<FlashSale>>({
      query: (body) => ({
        url: '/flash-sales',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FlashSale'],
    }),
    updateFlashSale: builder.mutation<FlashSale, { id: string; data: Partial<FlashSale> }>({
      query: ({ id, data }) => ({
        url: `/flash-sales/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['FlashSale'],
    }),
    deleteFlashSale: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/flash-sales/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FlashSale'],
    }),
  }),
});

export const {
  useGetActiveFlashSalesQuery,
  useGetFlashSaleByIdQuery,
  useGetAdminFlashSalesQuery,
  useCreateFlashSaleMutation,
  useUpdateFlashSaleMutation,
  useDeleteFlashSaleMutation,
} = flashSalesApi;
