import { api } from '../../store/api';
import { PaginationMeta } from '../catalog/catalogApi';

export interface ProductRequestHistoryItem {
  id: string;
  status: string;
  remark: string | null;
  createdAt: string;
}

export interface ProductRequest {
  id: string;
  requestedProductName: string;
  description: string | null;
  preferredInformation: string | null;
  status: string;
  linkedProductId: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory?: ProductRequestHistoryItem[];
  user?: {
    id: string;
    name: string;
    phone: string;
  };
}

export interface CreateProductRequestDto {
  requestedProductName: string;
  description?: string;
  preferredInformation?: string;
}

export interface UpdateProductRequestStatusDto {
  status: string;
  adminNotes?: string;
  linkedProductId?: string;
  remark?: string;
}

export const productRequestsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Customer endpoints
    createProductRequest: builder.mutation<ProductRequest, CreateProductRequestDto>({
      query: (body) => ({
        url: '/product-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProductRequest'],
    }),
    getCustomerProductRequests: builder.query<ProductRequest[], void>({
      query: () => '/product-requests',
      providesTags: ['ProductRequest'],
    }),
    getCustomerProductRequestById: builder.query<ProductRequest, string>({
      query: (id) => `/product-requests/${id}`,
      providesTags: (result, error, id) => [{ type: 'ProductRequest', id }],
    }),

    // Admin endpoints
    getAdminProductRequests: builder.query<{ data: ProductRequest[]; meta: PaginationMeta }, { status?: string; search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        let url = '/admin/product-requests';
        if (params) {
          const searchParams = new URLSearchParams();
          if (params.status) searchParams.set('status', params.status);
          if (params.search) searchParams.set('search', params.search);
          if (params.page) searchParams.set('page', params.page.toString());
          if (params.limit) searchParams.set('limit', params.limit.toString());
          if (searchParams.toString()) url += `?${searchParams.toString()}`;
        }
        return url;
      },
      providesTags: ['ProductRequest'],
    }),
    getAdminProductRequestById: builder.query<ProductRequest, string>({
      query: (id) => `/admin/product-requests/${id}`,
      providesTags: (result, error, id) => [{ type: 'ProductRequest', id }],
    }),
    updateProductRequestStatus: builder.mutation<ProductRequest, { id: string; data: UpdateProductRequestStatusDto }>({
      query: ({ id, data }) => ({
        url: `/admin/product-requests/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ProductRequest', id }, 'ProductRequest'],
    }),
  }),
});

export const {
  useCreateProductRequestMutation,
  useGetCustomerProductRequestsQuery,
  useGetCustomerProductRequestByIdQuery,
  useGetAdminProductRequestsQuery,
  useGetAdminProductRequestByIdQuery,
  useUpdateProductRequestStatusMutation,
} = productRequestsApi;
