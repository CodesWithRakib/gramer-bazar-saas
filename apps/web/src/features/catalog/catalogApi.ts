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
    getAdminCategories: builder.query<{ data: Category[]; meta: any }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/categories',
        params,
      }),
      providesTags: ['Category'],
    }),
    getAdminBrands: builder.query<{ data: any[]; meta: any }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/brands',
        params,
      }),
      providesTags: ['Catalog'],
    }),
    getAdminProducts: builder.query<{ data: any[]; meta: any }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Catalog'],
    }),
    searchProducts: builder.query<SearchResponse, SearchParams>({
      query: (params) => {
        // Strip out undefined, null, or empty string values
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        return {
          url: '/public/catalog/search',
          params: cleanParams as Record<string, string | number>,
        };
      },
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
    getRelatedProducts: builder.query<SellerProduct[], string>({
      query: (slug) => `/public/catalog/${slug}/related`,
      providesTags: (result, error, slug) => [{ type: 'Catalog', id: `related-${slug}` }],
    }),
    getProductReviews: builder.query<{ data: any[], meta: any }, string>({
      query: (productId) => `/public/reviews/product/${productId}`,
    }),
    validateCart: builder.mutation<any, { items: { sellerProductId: string, quantity: number }[] }>({
      query: (body) => ({
        url: '/public/cart/validate',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetPublicCategoriesQuery,
  useGetAdminCategoriesQuery,
  useGetAdminBrandsQuery,
  useGetAdminProductsQuery,
  useSearchProductsQuery,
  useGetFeaturedProductsQuery,
  useGetProductDetailsQuery,
  useGetRelatedProductsQuery,
  useGetProductReviewsQuery,
  useValidateCartMutation,
} = catalogApi;
