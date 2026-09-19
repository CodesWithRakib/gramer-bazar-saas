import { api } from "../../store/api";
import { Review } from "../reviews/reviewsApi";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: string;
  parentId?: string | null;
  nameEn: string;
  nameBn: string;
  slug: string;
  icon?: string | null;
  isRegulated: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  logo?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  nameEn: string;
  nameBn: string;
  images: string[] | null;
  price?: number | string;
  discountPrice?: number | string | null;
}

export interface Product {
  id: string;
  nameEn: string;
  nameBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  slug: string;
  categoryId: string;
  category?: Category;
  brandId: string | null;
  brand?: Brand;
  minPrice: number;
  maxPrice: number;
  images: string[];
  totalStock: number;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
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
      descriptionEn?: string;
      descriptionBn?: string;
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
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export const catalogApi = api
  .enhanceEndpoints({ addTagTypes: ["Catalog", "Category"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getPublicCategories: builder.query<Category[], void>({
        query: () => "/public/categories",
        providesTags: ["Category"],
      }),
      getAdminCategories: builder.query<
        { data: Category[]; meta: PaginationMeta },
        { page?: number; limit?: number; search?: string }
      >({
        query: (params) => ({
          url: "/categories",
          params,
        }),
        providesTags: ["Category"],
      }),
      getAdminBrands: builder.query<
        { data: Brand[]; meta: PaginationMeta },
        { page?: number; limit?: number; search?: string }
      >({
        query: (params) => ({
          url: "/brands",
          params,
        }),
        providesTags: ["Catalog"],
      }),
      getAdminProducts: builder.query<
        { data: Product[]; meta: PaginationMeta },
        { page?: number; limit?: number; search?: string }
      >({
        query: (params) => ({
          url: "/products",
          params,
        }),
        providesTags: ["Catalog"],
      }),
      createAdminCategory: builder.mutation<Category, Partial<Category>>({
        query: (body) => ({
          url: "/categories",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Category"],
      }),
      updateAdminCategory: builder.mutation<
        Category,
        { id: string; data: Partial<Category> }
      >({
        query: ({ id, data }) => ({
          url: `/categories/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["Category"],
      }),
      createAdminBrand: builder.mutation<Brand, Partial<Brand>>({
        query: (body) => ({
          url: "/brands",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Catalog"],
      }),
      updateAdminBrand: builder.mutation<
        Brand,
        { id: string; data: Partial<Brand> }
      >({
        query: ({ id, data }) => ({
          url: `/brands/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["Catalog"],
      }),
      searchProducts: builder.query<SearchResponse, SearchParams>({
        query: (params) => {
          // Strip out undefined, null, or empty string values
          const cleanParams = Object.fromEntries(
            Object.entries(params).filter(
              ([_, v]) => v !== undefined && v !== null && v !== "",
            ),
          );
          return {
            url: "/public/catalog/search",
            params: cleanParams as Record<string, string | number>,
          };
        },
        providesTags: ["Catalog"],
      }),
      getFeaturedProducts: builder.query<SearchResponse, void>({
        query: () => "/public/catalog/featured",
        providesTags: ["Catalog"],
      }),
      getProductDetails: builder.query<SellerProduct[], string>({
        query: (slug) => `/public/catalog/${slug}`,
        providesTags: (result, error, slug) => [{ type: "Catalog", id: slug }],
      }),
      getRelatedProducts: builder.query<SellerProduct[], string>({
        query: (slug) => `/public/catalog/${slug}/related`,
        providesTags: (result, error, slug) => [
          { type: "Catalog", id: `related-${slug}` },
        ],
      }),
      getProductReviews: builder.query<
        { data: Review[]; meta: PaginationMeta },
        string
      >({
        query: (productId) => `/public/reviews/product/${productId}`,
      }),
      validateCart: builder.mutation<
        { valid: boolean },
        { items: { sellerProductId: string; quantity: number }[] }
      >({
        query: (body) => ({
          url: "/public/cart/validate",
          method: "POST",
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
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useCreateAdminBrandMutation,
  useUpdateAdminBrandMutation,
} = catalogApi;
