import { api } from "../../store/api";

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
  image?: string | null;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  sortOrder?: number;
  isRegulated: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  children?: Category[];
}

export interface Brand {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  logo?: string | null;
  isActive: boolean;
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  storagePath: string;
  filename: string;
  originalFilename?: string | null;
  mimeType?: string;
  sizeBytes?: number;
  isPrimary: boolean;
  sortOrder: number;
  altText?: string | null;
  sourceUrl?: string | null;
  sourceAttribution?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  nameEn: string;
  nameBn: string;
  sku?: string | null;
  images: string[] | null;
  price?: number | string;
  discountPrice?: number | string | null;
}

export interface Product {
  id: string;
  nameEn: string;
  nameBn: string;
  shortDescriptionEn?: string | null;
  shortDescriptionBn?: string | null;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  slug: string;
  categoryId: string;
  category?: Category;
  subCategoryId?: string | null;
  subCategory?: Category | null;
  brandId: string | null;
  brand?: Brand | null;
  sku?: string | null;
  barcode?: string | null;
  price: number | string;
  compareAtPrice?: number | string | null;
  stock: number;
  unit: string;
  status: string;
  isFeatured: boolean;
  isActive: boolean;
  source?: string | null;
  sourceProductId?: string | null;
  sourceUrl?: string | null;
  sourcePrice?: number | string | null;
  sourceCurrency?: string | null;
  images: ProductImage[];
  variants?: ProductVariant[];
  totalStock?: number;
  isAvailable?: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  nameEn: string;
  nameBn: string;
  shortDescriptionEn?: string | null;
  shortDescriptionBn?: string | null;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  categoryId: string;
  subCategoryId?: string | null;
  brandId?: string | null;
  sku?: string | null;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  unit: string;
  status?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface ImportLog {
  id: string;
  source: string;
  mode: 'DRY_RUN' | 'IMPORT' | 'RETRY_IMAGES';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalFetched: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  duplicatesCount: number;
  failedCount: number;
  imageFailuresCount: number;
  mappingFailuresCount: number;
  errorSummary?: string | null;
  details?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
}

export interface RunImportDto {
  source: 'dummyjson' | 'openfoodfacts';
  mode?: 'DRY_RUN' | 'IMPORT' | 'RETRY_IMAGES';
  limit?: number;
  category?: string;
  updateExisting?: boolean;
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
      shortDescriptionEn?: string | null;
      shortDescriptionBn?: string | null;
      descriptionEn?: string | null;
      descriptionBn?: string | null;
      slug: string;
      unit?: string;
      compareAtPrice?: number | string | null;
      category: Category;
      subCategory?: Category | null;
      brand?: Brand | null;
      averageRating?: number;
      totalReviews?: number;
    };
  };
  shop: {
    id: string;
    nameEn: string;
    nameBn: string;
    sellerId: string;
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
  categorySlug?: string;
  subCategoryId?: string;
  subCategorySlug?: string;
  brandId?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CategorySection {
  category: Category & { subCategories: Array<Category & { productCount: number }> };
  products: SellerProduct[];
}

export interface SearchSuggestions {
  products: Array<{
    id: string;
    nameEn: string;
    nameBn: string;
    slug: string;
    price: number;
    unit: string;
    thumbnail: string | null;
  }>;
  categories: Array<{
    id: string;
    nameEn: string;
    nameBn: string;
    slug: string;
    icon: string | null;
  }>;
  brands: Array<{
    id: string;
    nameEn: string;
    nameBn: string;
    slug: string;
  }>;
}

export const catalogApi = api
  .enhanceEndpoints({ addTagTypes: ["Catalog", "Category"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getPublicCategories: builder.query<Category[], void>({
        query: () => "/public/categories",
        providesTags: ["Category"],
      }),
      getPublicCategoryTree: builder.query<Category[], void>({
        query: () => "/public/categories/tree",
        providesTags: ["Category"],
      }),
      getCategorySections: builder.query<CategorySection[], void>({
        query: () => "/public/catalog/category-sections",
        providesTags: ["Catalog", "Category"],
      }),
      getSearchSuggestions: builder.query<SearchSuggestions, string>({
        query: (q) => `/public/catalog/suggestions?q=${encodeURIComponent(q)}`,
      }),
      getPopularProducts: builder.query<SearchResponse, number | void>({
        query: (limit = 8) => `/public/catalog/popular?limit=${limit}`,
        providesTags: ["Catalog"],
      }),
      getPublicBrands: builder.query<Brand[], { categoryId?: string; search?: string } | void>({
        query: (params) => {
          if (!params) return "/public/catalog/brands";
          const searchParams = new URLSearchParams();
          if (params.categoryId) searchParams.append("categoryId", params.categoryId);
          if (params.search) searchParams.append("search", params.search);
          const queryString = searchParams.toString();
          return queryString ? `/public/catalog/brands?${queryString}` : "/public/catalog/brands";
        },
        providesTags: ["Catalog"],
      }),
      getBrandsByCategory: builder.query<Brand[], string>({
        query: (categoryId) => `/brands/by-category/${categoryId}`,
        providesTags: ["Catalog"],
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
              ([, v]) => v !== undefined && v !== null && v !== "",
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
      getCategoriesTree: builder.query<Category[], void>({
        query: () => "/categories/tree",
        providesTags: ["Category"],
      }),
      deleteAdminCategory: builder.mutation<void, string>({
        query: (id) => ({
          url: `/categories/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Category"],
      }),
      createAdminProduct: builder.mutation<Product, CreateProductDto>({
        query: (body) => ({
          url: "/products",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Catalog"],
      }),
      updateAdminProduct: builder.mutation<
        Product,
        { id: string; data: Partial<CreateProductDto> }
      >({
        query: ({ id, data }) => ({
          url: `/products/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["Catalog"],
      }),
      deleteAdminProduct: builder.mutation<void, string>({
        query: (id) => ({
          url: `/products/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Catalog"],
      }),
      uploadProductImages: builder.mutation<
        ProductImage[],
        { productId: string; formData: FormData }
      >({
        query: ({ productId, formData }) => ({
          url: `/products/${productId}/images`,
          method: "POST",
          body: formData,
        }),
        invalidatesTags: ["Catalog"],
      }),
      setPrimaryProductImage: builder.mutation<
        ProductImage,
        { productId: string; imageId: string }
      >({
        query: ({ productId, imageId }) => ({
          url: `/products/${productId}/images/${imageId}/primary`,
          method: "PATCH",
        }),
        invalidatesTags: ["Catalog"],
      }),
      deleteProductImage: builder.mutation<
        void,
        { productId: string; imageId: string }
      >({
        query: ({ productId, imageId }) => ({
          url: `/products/${productId}/images/${imageId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Catalog"],
      }),
      reorderProductImages: builder.mutation<
        void,
        { productId: string; imageIds: string[] }
      >({
        query: ({ productId, imageIds }) => ({
          url: `/products/${productId}/images/reorder`,
          method: "PATCH",
          body: { imageIds },
        }),
        invalidatesTags: ["Catalog"],
      }),
      runProductImport: builder.mutation<
        { success: boolean; log: ImportLog },
        RunImportDto
      >({
        query: (body) => ({
          url: "/admin/importer/run",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Catalog", "Category"],
      }),
      getImportLogs: builder.query<
        { items: ImportLog[]; meta: PaginationMeta },
        { page?: number; limit?: number }
      >({
        query: (params) => ({
          url: "/admin/importer/logs",
          params,
        }),
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
  useGetPublicCategoryTreeQuery,
  useGetCategorySectionsQuery,
  useGetSearchSuggestionsQuery,
  useGetPopularProductsQuery,
  useGetPublicBrandsQuery,
  useGetBrandsByCategoryQuery,
  useGetCategoriesTreeQuery,
  useGetAdminCategoriesQuery,
  useGetAdminBrandsQuery,
  useGetAdminProductsQuery,
  useSearchProductsQuery,
  useGetFeaturedProductsQuery,
  useGetProductDetailsQuery,
  useGetRelatedProductsQuery,
  useValidateCartMutation,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useCreateAdminBrandMutation,
  useUpdateAdminBrandMutation,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useUploadProductImagesMutation,
  useSetPrimaryProductImageMutation,
  useDeleteProductImageMutation,
  useReorderProductImagesMutation,
  useRunProductImportMutation,
  useGetImportLogsQuery,
} = catalogApi;
