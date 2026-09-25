import { api } from '@/store/api';
import { SellerProduct, PaginationMeta } from '../catalog/catalogApi';

export interface Shop {
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
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface ShopProductCategorySummary {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  icon?: string | null;
  count: number;
  productCount?: number;
}

export interface ShopProductBrandSummary {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  logo?: string | null;
  count: number;
}

export interface ShopProductsResponse {
  shop: Shop;
  data: SellerProduct[];
  meta: PaginationMeta;
  categories: ShopProductCategorySummary[];
  brands: ShopProductBrandSummary[];
}

export interface ShopProductsParams {
  id: string;
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
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
    getShopProducts: builder.query<ShopProductsResponse, ShopProductsParams>({
      query: ({ id, ...params }) => {
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(
            ([, v]) => v !== undefined && v !== null && v !== ''
          )
        );
        return {
          url: `/shops/${id}/products`,
          params: cleanParams,
        };
      },
      providesTags: (result, error, { id }) => [{ type: 'Shop', id: `${id}-products` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShopsQuery,
  useGetShopByIdQuery,
  useGetShopProductsQuery,
} = shopsApi;

