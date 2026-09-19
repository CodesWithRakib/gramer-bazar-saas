import { api } from '../../store/api';

export interface DashboardMetrics {
  lowStockCount: number;
  activeOrdersCount: number;
  totalSales: number;
}

export interface SellerShop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface SellerInventory {
  id: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
}

export interface SellerProductItem {
  id: string;
  price: number;
  discountPrice: number | null;
  sellerSku: string | null;
  isActive: boolean;
  inventory: SellerInventory;
  productVariant: {
    id: string;
    sku: string;
    attributes: Record<string, string>;
    product: {
      id: string;
      name: string;
    };
  };
}

export const sellerPortalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSellerDashboard: builder.query<DashboardMetrics, void>({
      query: () => '/seller-portal/dashboard',
      providesTags: ['Order', 'Catalog'],
    }),
    getSellerShop: builder.query<SellerShop, void>({
      query: () => '/seller-portal/shop',
      providesTags: ['User'],
    }),
    updateSellerShop: builder.mutation<SellerShop, Partial<SellerShop>>({
      query: (body) => ({
        url: '/seller-portal/shop',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getSellerProducts: builder.query<any[], string | void>({
      query: (search) => {
        let url = '/seller-portal/products';
        if (search) {
          url += `?search=${encodeURIComponent(search)}`;
        }
        return url;
      },
      providesTags: ['Catalog'],
    }),
    addSellerProduct: builder.mutation<SellerProductItem, any>({
      query: (body) => ({
        url: '/seller-portal/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Catalog'],
    }),
    updateSellerProduct: builder.mutation<SellerProductItem, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/seller-portal/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Catalog'],
    }),
    updateInventory: builder.mutation<SellerInventory, { id: string; quantity: number }>({
      query: ({ id, quantity }) => ({
        url: `/inventory/${id}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Catalog'],
    }),
    getSellerOrders: builder.query<any[], void>({
      query: () => '/seller-portal/orders',
      providesTags: ['Order'],
    }),
    getSellerOrderById: builder.query<any, string>({
      query: (id) => `/seller-portal/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
  }),
});

export const {
  useGetSellerDashboardQuery,
  useGetSellerShopQuery,
  useUpdateSellerShopMutation,
  useGetSellerProductsQuery,
  useAddSellerProductMutation,
  useUpdateSellerProductMutation,
  useUpdateInventoryMutation,
  useGetSellerOrdersQuery,
  useGetSellerOrderByIdQuery,
} = sellerPortalApi;
