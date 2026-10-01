import { api } from '@/store/api';
import type { PaginationMeta } from '@/features/catalog/catalogApi';
import type { OrderStatus } from '@/features/orders/ordersApi';

// ------------------------------------------------------------------ catalog

export interface SellerCategoryOption {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  icon: string | null;
  parentId?: string | null;
}

export interface SellerBrandOption {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  logo: string | null;
}

// --------------------------------------------------------------------- shop

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
  totalOrders?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateSellerShopPayload = Partial<
  Pick<
    SellerShop,
    | 'nameEn'
    | 'nameBn'
    | 'shortDescription'
    | 'description'
    | 'phone'
    | 'secondaryPhone'
    | 'whatsapp'
    | 'email'
    | 'website'
    | 'facebook'
    | 'instagram'
    | 'address'
    | 'area'
    | 'district'
    | 'upazila'
    | 'union'
    | 'village'
    | 'openingHours'
    | 'deliveryInfo'
    | 'isActive'
  >
>;

export interface ShopImageUploadResponse extends SellerShop {
  logo: string | null;
  banner: string | null;
}

// ----------------------------------------------------------------- products

export type StockState = 'OUT_OF_STOCK' | 'LOW' | 'IN_STOCK';

export interface SellerProductImage {
  id: string;
  url: string;
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  isPrimary: boolean;
  sortOrder: number;
  altText: string | null;
}

export interface SellerProduct {
  id: string;
  shopId: string;
  productVariantId: string;
  productId: string;
  /** `true` when this shop created the underlying catalog product. */
  isOwned: boolean;
  nameEn: string;
  nameBn: string;
  shortDescriptionEn?: string | null;
  shortDescriptionBn?: string | null;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  slug?: string | null;
  sku?: string | null;
  sellerSku?: string | null;
  unit?: string | null;
  categoryId?: string | null;
  categoryNameEn?: string | null;
  categoryNameBn?: string | null;
  subCategoryId?: string | null;
  subCategoryNameEn?: string | null;
  subCategoryNameBn?: string | null;
  brandId?: string | null;
  brandNameEn?: string | null;
  brandNameBn?: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  isActive: boolean;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  stockState: StockState;
  isLowStock: boolean;
  images: SellerProductImage[];
  totalSold: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProductList {
  data: SellerProduct[];
  meta: PaginationMeta;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface CreateSellerProductPayload {
  nameEn: string;
  nameBn: string;
  categoryId: string;
  subCategoryId?: string;
  brandId?: string;
  shortDescriptionEn?: string;
  shortDescriptionBn?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  lowStockThreshold?: number;
  sku?: string;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateSellerProductPayload {
  price?: number;
  discountPrice?: number | null;
  sellerSku?: string | null;
  isActive?: boolean;
  quantity?: number;
  lowStockThreshold?: number;
  nameEn?: string;
  nameBn?: string;
  categoryId?: string;
  subCategoryId?: string | null;
  brandId?: string | null;
  shortDescriptionEn?: string | null;
  shortDescriptionBn?: string | null;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  unit?: string | null;
}

export interface SellerProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';
  stock?: 'ALL' | 'LOW_STOCK' | 'IN_STOCK' | 'OUT_OF_STOCK';
  categoryId?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
}

// ------------------------------------------------------------------- orders

export interface SellerOrderCustomer {
  name: string;
  phone: string | null;
  contactName?: string | null;
  streetAddress?: string | null;
  district?: string | null;
  upazila?: string | null;
}

export interface SellerOrderItem {
  id: string;
  sellerProductId: string;
  nameEn: string;
  nameBn: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SellerOrderSummary {
  id: string;
  reference: string;
  status: OrderStatus;
  sellerSubtotal: number;
  itemCount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  customer: SellerOrderCustomer;
  /** Statuses the backend will accept for this order from this seller. */
  allowedNextStatuses: OrderStatus[];
}

export interface SellerOrderDetail extends SellerOrderSummary {
  /** Present only on the detail payload — used to start a chat about the order. */
  customerUserId: string | null;
  items: SellerOrderItem[];
  statusHistory: Array<{ status: OrderStatus; note: string | null; createdAt: string }>;
  riderName?: string | null;
  riderPhone?: string | null;
  deliveryStatus?: string | null;
  note?: string | null;
}

export interface SellerOrderList {
  data: SellerOrderSummary[];
  meta: PaginationMeta;
  awaitingActionCount: number;
}

export interface SellerOrderQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  needsAction?: 'true';
}

// ---------------------------------------------------------------- dashboard

export interface SellerWalletSnapshot {
  balance: number;
  pendingClearance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingPayoutAmount: number;
  hasWallet: boolean;
}

export interface SellerDashboardRecentOrder {
  id: string;
  customerName: string;
  customerPhone: string | null;
  totalAmount: number;
  itemCount: number;
  status: OrderStatus;
  allowedNextStatuses: OrderStatus[];
  createdAt: string;
}

export interface SellerDashboardTopProduct {
  listingId: string;
  productId: string;
  nameEn: string;
  nameBn: string;
  image: string | null;
  quantitySold: number;
  revenue: number;
}

export interface SellerLowStockProduct {
  id: string;
  nameEn: string;
  nameBn: string;
  sku?: string | null;
  quantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
}

export interface SellerDashboardMetrics {
  lowStockCount: number;
  outOfStockCount: number;
  activeOrdersCount: number;
  pendingOrdersCount: number;
  awaitingActionCount: number;
  completedOrdersCount: number;
  totalOrders: number;
  totalProducts: number;
  totalSales: number;
  todaySales: number;
  todayOrders: number;
  monthSales: number;
  monthOrders: number;
  stockValue: number;
  activeCouponsCount: number;
  wallet: SellerWalletSnapshot;
  recentOrders: SellerDashboardRecentOrder[];
  revenueData: Array<{ name: string; date: string; revenue: number; orders: number }>;
  orderStatusDistribution: Array<{ status: string; count: number }>;
  topProducts: SellerDashboardTopProduct[];
  lowStockProducts: SellerLowStockProduct[];
}

// ---------------------------------------------------------------- analytics

export interface SellerAnalytics {
  shopId: string;
  generatedAt: string;
  sales: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    lifetime: number;
    averageOrderValueThisMonth: number;
    unitsSoldThisMonth: number;
  };
  orders: {
    today: number;
    thisMonth: number;
    lifetime: number;
    awaitingAction: number;
    completed: number;
    cancelled: number;
    statusDistribution: Array<{ status: string; count: number }>;
  };
  inventory: {
    activeListings: number;
    lowStockCount: number;
    outOfStockCount: number;
    stockValue: number;
  };
  promotions: { activeCoupons: number; totalCoupons: number };
  bestSellers: SellerDashboardTopProduct[];
  revenueByCategory: Array<{
    categoryId: string;
    nameEn: string;
    nameBn: string;
    revenue: number;
    quantitySold: number;
  }>;
  revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
}

// ----------------------------------------------------------------- reviews

export interface SellerReviewItem {
  id: string;
  productId: string;
  productNameEn: string;
  productNameBn: string;
  productSlug: string | null;
  productImage: string | null;
  customerName: string;
  rating: number;
  comment: string | null;
  images: string[];
  isApproved: boolean;
  sellerReply: string | null;
  sellerRepliedAt: string | null;
  createdAt: string;
}

export interface SellerReviewList {
  data: SellerReviewItem[];
  meta: PaginationMeta;
}

export interface SellerReviewSummary {
  averageRating: number;
  totalReviews: number;
  unrepliedCount: number;
  distribution: Array<{ rating: number; count: number }>;
}

export interface SellerReviewQuery {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  replyState?: 'ALL' | 'REPLIED' | 'UNREPLIED';
}

// ---------------------------------------------------------------- endpoints

export const sellerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard & analytics
    getSellerDashboard: builder.query<SellerDashboardMetrics, void>({
      query: () => '/seller-portal/dashboard',
      providesTags: ['SellerAnalytics'],
    }),
    getSellerAnalytics: builder.query<SellerAnalytics, number | void>({
      query: (days) => ({
        url: '/seller-portal/analytics',
        params: days ? { days } : undefined,
      }),
      providesTags: ['SellerAnalytics'],
    }),

    // Shop
    getSellerShop: builder.query<SellerShop, void>({
      query: () => '/seller-portal/shop',
      providesTags: ['Shop'],
    }),
    updateSellerShop: builder.mutation<SellerShop, UpdateSellerShopPayload>({
      query: (body) => ({
        url: '/seller-portal/shop',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),
    uploadShopLogo: builder.mutation<ShopImageUploadResponse, FormData>({
      query: (body) => ({
        url: '/seller-portal/shop/logo',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),
    uploadShopBanner: builder.mutation<ShopImageUploadResponse, FormData>({
      query: (body) => ({
        url: '/seller-portal/shop/banner',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),

    // Product form metadata
    getSellerCategories: builder.query<SellerCategoryOption[], void>({
      query: () => '/seller-portal/catalog/categories',
      providesTags: ['Catalog'],
    }),
    getSellerBrands: builder.query<SellerBrandOption[], void>({
      query: () => '/seller-portal/catalog/brands',
      providesTags: ['Catalog'],
    }),

    // Products
    getSellerProducts: builder.query<SellerProductList, SellerProductQuery | void>({
      query: (params) => ({
        url: '/seller-portal/products',
        params: params ?? undefined,
      }),
      providesTags: ['SellerProduct'],
    }),
    getSellerProduct: builder.query<SellerProduct, string>({
      query: (id) => `/seller-portal/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'SellerProduct' as const, id }],
    }),
    createSellerProduct: builder.mutation<SellerProduct, CreateSellerProductPayload>({
      query: (body) => ({
        url: '/seller-portal/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SellerProduct', 'SellerAnalytics', 'Catalog'],
    }),
    updateSellerProduct: builder.mutation<
      SellerProduct,
      { id: string; data: UpdateSellerProductPayload }
    >({
      query: ({ id, data }) => ({
        url: `/seller-portal/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SellerProduct' as const, id },
        'SellerProduct',
        'SellerAnalytics',
      ],
    }),
    archiveSellerProduct: builder.mutation<SellerProduct, string>({
      query: (id) => ({
        url: `/seller-portal/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SellerProduct', 'SellerAnalytics'],
    }),
    bulkUpdateSellerStock: builder.mutation<
      { updated: number },
      { items: Array<{ id: string; quantity: number; lowStockThreshold?: number }> }
    >({
      query: (body) => ({
        url: '/seller-portal/inventory/bulk',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['SellerProduct', 'SellerAnalytics'],
    }),

    // Product media
    uploadSellerProductImages: builder.mutation<SellerProduct, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/seller-portal/products/${id}/images`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SellerProduct' as const, id },
        'SellerProduct',
      ],
    }),
    setSellerProductPrimaryImage: builder.mutation<SellerProduct, { id: string; imageId: string }>({
      query: ({ id, imageId }) => ({
        url: `/seller-portal/products/${id}/images/${imageId}/primary`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SellerProduct' as const, id },
        'SellerProduct',
      ],
    }),
    reorderSellerProductImages: builder.mutation<SellerProduct, { id: string; imageIds: string[] }>(
      {
        query: ({ id, imageIds }) => ({
          url: `/seller-portal/products/${id}/images/reorder`,
          method: 'PATCH',
          body: { imageIds },
        }),
        invalidatesTags: (result, error, { id }) => [
          { type: 'SellerProduct' as const, id },
          'SellerProduct',
        ],
      }
    ),
    deleteSellerProductImage: builder.mutation<SellerProduct, { id: string; imageId: string }>({
      query: ({ id, imageId }) => ({
        url: `/seller-portal/products/${id}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SellerProduct' as const, id },
        'SellerProduct',
      ],
    }),

    // Orders
    getSellerOrders: builder.query<SellerOrderList, SellerOrderQuery | void>({
      query: (params) => ({
        url: '/seller-portal/orders',
        params: params ?? undefined,
      }),
      providesTags: ['Order'],
    }),
    getSellerOrderById: builder.query<SellerOrderDetail, string>({
      query: (id) => `/seller-portal/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order' as const, id }, 'Order'],
    }),
    /** Transitions order status via the dedicated seller portal endpoint. */
    transitionSellerOrder: builder.mutation<
      SellerOrderDetail,
      { id: string; targetStatus: OrderStatus; reason?: string }
    >({
      query: ({ id, targetStatus, reason }) => ({
        url: `/seller-portal/orders/${id}/status`,
        method: 'PATCH',
        body: { targetStatus, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order' as const, id },
        'Order',
        'SellerAnalytics',
      ],
    }),
    uploadSellerAvatar: builder.mutation<{ avatarUrl: string; user: unknown }, FormData>({
      query: (body) => ({
        url: '/seller-portal/profile/avatar',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Reviews
    getSellerReviews: builder.query<SellerReviewList, SellerReviewQuery | void>({
      query: (params) => ({
        url: '/seller-portal/reviews',
        params: params ?? undefined,
      }),
      providesTags: ['Review'],
    }),
    getSellerReviewSummary: builder.query<SellerReviewSummary, void>({
      query: () => '/seller-portal/reviews/summary',
      providesTags: ['Review'],
    }),
    replyToSellerReview: builder.mutation<SellerReviewItem, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: `/seller-portal/reviews/${id}/reply`,
        method: 'PATCH',
        body: { message },
      }),
      invalidatesTags: ['Review'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSellerDashboardQuery,
  useGetSellerAnalyticsQuery,
  useGetSellerShopQuery,
  useUpdateSellerShopMutation,
  useUploadShopLogoMutation,
  useUploadShopBannerMutation,
  useGetSellerCategoriesQuery,
  useGetSellerBrandsQuery,
  useGetSellerProductsQuery,
  useGetSellerProductQuery,
  useCreateSellerProductMutation,
  useUpdateSellerProductMutation,
  useArchiveSellerProductMutation,
  useBulkUpdateSellerStockMutation,
  useUploadSellerProductImagesMutation,
  useSetSellerProductPrimaryImageMutation,
  useReorderSellerProductImagesMutation,
  useDeleteSellerProductImageMutation,
  useGetSellerOrdersQuery,
  useGetSellerOrderByIdQuery,
  useTransitionSellerOrderMutation,
  useUploadSellerAvatarMutation,
  useGetSellerReviewsQuery,
  useGetSellerReviewSummaryQuery,
  useReplyToSellerReviewMutation,
} = sellerApi;
