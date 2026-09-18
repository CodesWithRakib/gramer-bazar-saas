import { api } from '../../store/api';

export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  icon?: string | null;
  children?: Category[];
}

export interface SellerProduct {
  id: string;
  price: string | number;
  discountPrice?: string | number | null;
  productVariant: {
    id: string;
    nameEn: string;
    nameBn: string;
    images: string[] | null;
    product: {
      id: string;
      nameEn: string;
      nameBn: string;
      slug: string;
      category: Category;
    };
  };
  shop: {
    id: string;
    nameEn: string;
    nameBn: string;
  };
  inventory: {
    quantity: number;
  };
}

export interface SearchResponse {
  data: SellerProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchParams {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export const catalogApi = api.enhanceEndpoints({ addTagTypes: ['Catalog', 'Category'] }).injectEndpoints({
  endpoints: (builder) => ({
    getPublicCategories: builder.query<Category[], void>({
      query: () => '/public/categories',
      providesTags: ['Category'],
    }),
    searchProducts: builder.query<SearchResponse, SearchParams>({
      query: (params) => ({
        url: '/public/catalog/search',
        params: params as Record<string, string | number>,
      }),
      providesTags: ['Catalog'],
    }),
    getFeaturedProducts: builder.query<SearchResponse, void>({
      query: () => '/public/catalog/featured',
      providesTags: ['Catalog'],
    }),
    getProductDetails: builder.query<SellerProduct[], string>({
      query: (slug) => `/public/catalog/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Catalog', id: slug }],
    }),
  }),
});

export const {
  useGetPublicCategoriesQuery,
  useSearchProductsQuery,
  useGetFeaturedProductsQuery,
  useGetProductDetailsQuery,
} = catalogApi;
