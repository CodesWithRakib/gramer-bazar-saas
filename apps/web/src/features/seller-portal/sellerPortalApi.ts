import { api } from '../../store/api';
import { Order } from '../orders/ordersApi';

export interface DashboardMetrics {
  lowStockCount: number;
  activeOrdersCount: number;
  totalSales: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalAmount: string | number;
    status: string;
    createdAt: string;
  }>;
  revenueData: Array<{
    name: string;
    revenue: number;
  }>;
}

export interface SellerShop {
  id: string;
  sellerId: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  shortDescription?: string | null;
  description: string | null;
  logo: string | null;
  banner: string | null;
  isVerified: boolean;
  isActive: boolean;
  phone?: string | null;
  secondaryPhone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  address?: string | null;
  area?: string | null;
  district?: string | null;
  upazila?: string | null;
  union?: string | null;
  village?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: string | null;
  deliveryInfo?: string | null;
  productCount?: number;
  averageRating?: number;
  totalReviews?: number;
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
      nameEn: string;
      nameBn: string;
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
    uploadShopLogo: builder.mutation<{ logoUrl: string }, FormData>({
      query: (body) => ({
        url: '/seller-portal/shop/logo',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    uploadShopBanner: builder.mutation<{ bannerUrl: string }, FormData>({
      query: (body) => ({
        url: '/seller-portal/shop/banner',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    getSellerProducts: builder.query<SellerProductItem[], string | void>({
      query: (search) => {
        let url = '/seller-portal/products';
        if (search) {
          url += `?search=${encodeURIComponent(search)}`;
        }
        return url;
      },
      providesTags: ['Catalog'],
    }),
    addSellerProduct: builder.mutation<SellerProductItem, Partial<SellerProductItem>>({
      query: (body) => ({
        url: '/seller-portal/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Catalog'],
    }),
    updateSellerProduct: builder.mutation<SellerProductItem, { id: string; data: Partial<SellerProductItem> }>({
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
    getSellerOrders: builder.query<Order[], void>({
      query: () => '/seller-portal/orders',
      providesTags: ['Order'],
    }),
    getSellerOrderById: builder.query<Order, string>({
      query: (id) => `/seller-portal/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
  }),
});

export const {
  useGetSellerDashboardQuery,
  useGetSellerShopQuery,
  useUpdateSellerShopMutation,
  useUploadShopLogoMutation,
  useUploadShopBannerMutation,
  useGetSellerProductsQuery,
  useAddSellerProductMutation,
  useUpdateSellerProductMutation,
  useUpdateInventoryMutation,
  useGetSellerOrdersQuery,
  useGetSellerOrderByIdQuery,
} = sellerPortalApi;
