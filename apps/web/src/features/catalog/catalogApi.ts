import { api } from '../../store/api';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type AttributeDataType =
  | 'TEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'RANGE'
  | 'DATE';

export interface ProductType {
  id: string;
  categoryId: string;
  category?: Category;
  nameEn: string;
  nameBn: string;
  slug: string;
  descriptionEn?: string | null;
  descriptionBn?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  attributeMappings?: ProductTypeAttributeMapping[];
}

export interface AttributeOption {
  id: string;
  attributeId: string;
  value: string;
  valueBn?: string | null;
  hexColor?: string | null;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CatalogAttribute {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  dataType: AttributeDataType;
  unit?: string | null;
  isFilterable: boolean;
  isVariantAxis: boolean;
  sortOrder: number;
  isActive: boolean;
  options?: AttributeOption[];
}

export interface AttributeOptionInput {
  id?: string;
  value: string;
  valueBn?: string | null;
  hexColor?: string | null;
  slug?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AttributeUpsertInput {
  nameEn: string;
  nameBn: string;
  slug: string;
  dataType: AttributeDataType;
  unit?: string | null;
  isFilterable?: boolean;
  isVariantAxis?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  options?: AttributeOptionInput[];
}

export interface ProductTypeAttributeMapping {
  id?: string;
  productTypeId?: string;
  attributeId: string;
  isRequired: boolean;
  isFilterable: boolean;
  specGroup?: string | null;
  sortOrder: number;
  attribute?: CatalogAttribute;
}

export interface FacetOption {
  id: string;
  slug: string;
  value: string;
  valueBn: string | null;
  hexColor?: string | null;
  count: number;
}

export interface FacetGroup {
  attributeId: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  dataType: AttributeDataType;
  unit: string | null;
  options: FacetOption[];
  min?: number;
  max?: number;
}

export interface CatalogFacets {
  productTypeId: string | null;
  productTypeIds: string[];
  groups: FacetGroup[];
  priceRange: { min: number; max: number } | null;
  brands: Array<{ id: string; slug: string; nameEn: string; nameBn: string; count: number }>;
  inStockCount: number;
  totalCount: number;
}

export interface ProductSpec {
  attributeId: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  dataType: AttributeDataType;
  unit: string | null;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  optionId: string | null;
  optionSlug: string | null;
  displayValueEn: string;
  displayValueBn: string;
}

export interface ProductSpecGroup {
  specGroup: string;
  specs: ProductSpec[];
}

export interface CategoryBreadcrumb {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  path: string | null;
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
  level?: number;
  path?: string | null;
  isRegulated: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  children?: Category[];
  productTypes?: ProductType[];
  breadcrumb?: CategoryBreadcrumb[];
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

export interface Manufacturer {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  country?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManufacturerUpsertInput {
  nameEn: string;
  nameBn: string;
  country?: string | null;
  logo?: string | null;
  website?: string | null;
  isActive?: boolean;
}

export interface Ingredient {
  id: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  isPrescriptionOnly: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineBatch {
  id: string;
  productVariantId: string;
  batchNumber: string;
  manufacturingDate?: string | null;
  expiryDate: string;
  quantity: number;
  reservedQuantity: number;
  supplier?: string | null;
  purchaseCost?: number | null;
  status: 'ACTIVE' | 'EXPIRED' | 'BLOCKED' | 'DEPLETED';
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
  manufacturerId?: string | null;
  manufacturer?: Manufacturer | null;
  requiresPrescription?: boolean;
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
  productTypeId?: string | null;
  productType?: ProductType | null;
  images: ProductImage[];
  variants?: ProductVariant[];
  specGroups?: ProductSpecGroup[];
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
  manufacturerId?: string | null;
  requiresPrescription?: boolean;
  productTypeId?: string | null;
  attributeValues?: Array<{
    attributeId?: string;
    attributeSlug?: string;
    optionId?: string;
    optionSlug?: string;
    valueText?: string;
    valueNumber?: number;
    valueBoolean?: boolean;
  }>;
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
      manufacturer?: Manufacturer | null;
      requiresPrescription?: boolean;
      productType?: ProductType | null;
      specGroups?: ProductSpecGroup[];
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
  categoryPath?: string;
  subCategoryId?: string;
  subCategorySlug?: string;
  brandId?: string;
  productTypeId?: string;
  /** JSON string map of attribute slug -> selected values. */
  attributes?: string;
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface FacetQueryParams {
  categoryId?: string;
  categoryPath?: string;
  productTypeId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  attributes?: string;
}

export interface CategorySection {
  category: Category & {
    subCategories: Array<Category & { productCount: number }>;
  };
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

export interface HomepageData {
  categories: Category[];
  featuredProducts: SellerProduct[];
  popularProducts: SellerProduct[];
  featuredShops: Array<{
    id: string;
    sellerId: string;
    nameEn: string;
    nameBn: string;
    slug: string;
    shortDescription?: string | null;
    description?: string | null;
    logo?: string | null;
    banner?: string | null;
    isVerified: boolean;
    isActive: boolean;
    phone?: string | null;
    district?: string | null;
    upazila?: string | null;
    area?: string | null;
    productCount: number;
    averageRating: number;
    totalReviews: number;
  }>;
  offers: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    bannerImage?: string | null;
    isActive: boolean;
  }>;
  categorySections: CategorySection[];
  recentlyAdded: SellerProduct[];
}

export const catalogApi = api
  .enhanceEndpoints({ addTagTypes: ['Catalog', 'Category', 'Attribute', 'ProductType'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getHomepageData: builder.query<HomepageData, void>({
        query: () => '/public/catalog/homepage',
        providesTags: ['Catalog', 'Category'],
      }),
      getRecentlyAddedProducts: builder.query<SearchResponse, number | void>({
        query: (limit = 8) => `/public/catalog/recently-added?limit=${limit}`,
        providesTags: ['Catalog'],
      }),
      getPublicCategories: builder.query<Category[], void>({
        query: () => '/public/categories',
        providesTags: ['Category'],
      }),
      getPublicCategoryTree: builder.query<Category[], void>({
        query: () => '/public/categories/tree',
        providesTags: ['Category'],
      }),
      getCategorySections: builder.query<CategorySection[], void>({
        query: () => '/public/catalog/category-sections',
        providesTags: ['Catalog', 'Category'],
      }),
      getPublicCategoryBySlug: builder.query<Category, string>({
        query: (slug) => `/public/categories/${slug}`,
        providesTags: ['Category'],
      }),
      getPublicProductTypes: builder.query<
        ProductType[],
        { categoryId?: string; categoryPath?: string; includeMappings?: boolean } | void
      >({
        query: (params) => ({
          url: '/product-types',
          params: params ?? undefined,
        }),
        providesTags: ['Category'],
      }),
      getCatalogFacets: builder.query<CatalogFacets, FacetQueryParams>({
        query: (params) => {
          const clean = Object.fromEntries(
            Object.entries(params).filter(
              ([, value]) => value !== undefined && value !== null && value !== ''
            )
          );
          return { url: '/public/catalog/facets', params: clean };
        },
        providesTags: ['Catalog'],
      }),
      // ------------------------------------------------ admin taxonomy engine
      getAdminAttributes: builder.query<
        CatalogAttribute[],
        { search?: string; isActive?: boolean } | void
      >({
        query: (params) => ({ url: '/attributes', params: params ?? undefined }),
        providesTags: ['Attribute'],
      }),
      createAdminAttribute: builder.mutation<CatalogAttribute, AttributeUpsertInput>({
        query: (body) => ({ url: '/attributes', method: 'POST', body }),
        invalidatesTags: ['Attribute'],
      }),
      updateAdminAttribute: builder.mutation<
        CatalogAttribute,
        { id: string; data: Partial<AttributeUpsertInput> }
      >({
        query: ({ id, data }) => ({ url: `/attributes/${id}`, method: 'PATCH', body: data }),
        invalidatesTags: ['Attribute'],
      }),
      deleteAdminAttribute: builder.mutation<void, string>({
        query: (id) => ({ url: `/attributes/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Attribute'],
      }),
      getAdminProductTypes: builder.query<
        ProductType[],
        { categoryId?: string; categoryPath?: string; includeMappings?: boolean } | void
      >({
        query: (params) => ({ url: '/product-types', params: params ?? undefined }),
        providesTags: ['ProductType'],
      }),
      createAdminProductType: builder.mutation<ProductType, Partial<ProductType> & { categoryId: string }>({
        query: (body) => ({ url: '/product-types', method: 'POST', body }),
        invalidatesTags: ['ProductType', 'Category'],
      }),
      updateAdminProductType: builder.mutation<
        ProductType,
        { id: string; data: Partial<ProductType> }
      >({
        query: ({ id, data }) => ({ url: `/product-types/${id}`, method: 'PATCH', body: data }),
        invalidatesTags: ['ProductType', 'Category'],
      }),
      deleteAdminProductType: builder.mutation<void, string>({
        query: (id) => ({ url: `/product-types/${id}`, method: 'DELETE' }),
        invalidatesTags: ['ProductType', 'Category'],
      }),
      setProductTypeAttributes: builder.mutation<
        ProductTypeAttributeMapping[],
        { id: string; mappings: Array<Omit<ProductTypeAttributeMapping, 'attribute' | 'id' | 'productTypeId'>> }
      >({
        query: ({ id, mappings }) => ({
          url: `/product-types/${id}/attributes`,
          method: 'PUT',
          body: { mappings },
        }),
        invalidatesTags: ['ProductType', 'Category'],
      }),
      getSearchSuggestions: builder.query<SearchSuggestions, string>({
        query: (q) => `/public/catalog/suggestions?q=${encodeURIComponent(q)}`,
      }),
      getPopularProducts: builder.query<SearchResponse, number | void>({
        query: (limit = 8) => `/public/catalog/popular?limit=${limit}`,
        providesTags: ['Catalog'],
      }),
      getPublicBrands: builder.query<Brand[], { categoryId?: string; search?: string } | void>({
        query: (params) => {
          if (!params) return '/public/catalog/brands';
          const searchParams = new URLSearchParams();
          if (params.categoryId) searchParams.append('categoryId', params.categoryId);
          if (params.search) searchParams.append('search', params.search);
          const queryString = searchParams.toString();
          return queryString ? `/public/catalog/brands?${queryString}` : '/public/catalog/brands';
        },
        providesTags: ['Catalog'],
      }),
      getBrandsByCategory: builder.query<Brand[], string>({
        query: (categoryId) => `/brands/by-category/${categoryId}`,
        providesTags: ['Catalog'],
      }),
      getAdminCategories: builder.query<
        { data: Category[]; meta: PaginationMeta },
        { page?: number; limit?: number; search?: string }
      >({
        query: (params) => ({
          url: '/categories',
          params,
        }),
        providesTags: ['Category'],
      }),
      getAdminBrands: builder.query<
        { data: Brand[]; meta: PaginationMeta },
        { page?: number; limit?: number; search?: string }
      >({
        query: (params) => ({
          url: '/brands',
          params,
        }),
        providesTags: ['Catalog'],
      }),
      getAdminProducts: builder.query<
        { data: Product[]; meta: PaginationMeta },
        { page?: number; limit?: number; search?: string }
      >({
        query: (params) => ({
          url: '/products',
          params,
        }),
        providesTags: ['Catalog'],
      }),
      createAdminCategory: builder.mutation<Category, Partial<Category>>({
        query: (body) => ({
          url: '/categories',
          method: 'POST',
          body,
        }),
        invalidatesTags: ['Category'],
      }),
      updateAdminCategory: builder.mutation<Category, { id: string; data: Partial<Category> }>({
        query: ({ id, data }) => ({
          url: `/categories/${id}`,
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: ['Category'],
      }),
      createAdminBrand: builder.mutation<Brand, Partial<Brand>>({
        query: (body) => ({
          url: '/brands',
          method: 'POST',
          body,
        }),
        invalidatesTags: ['Catalog'],
      }),
      updateAdminBrand: builder.mutation<Brand, { id: string; data: Partial<Brand> }>({
        query: ({ id, data }) => ({
          url: `/brands/${id}`,
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: ['Catalog'],
      }),
      getManufacturers: builder.query<
        Manufacturer[],
        { search?: string; isActive?: boolean } | void
      >({
        query: (params) => ({ url: '/manufacturers', params: params ?? undefined }),
        providesTags: ['Catalog'],
      }),
      createAdminManufacturer: builder.mutation<Manufacturer, ManufacturerUpsertInput>({
        query: (body) => ({ url: '/manufacturers', method: 'POST', body }),
        invalidatesTags: ['Catalog'],
      }),
      updateAdminManufacturer: builder.mutation<
        Manufacturer,
        { id: string; data: Partial<ManufacturerUpsertInput> }
      >({
        query: ({ id, data }) => ({
          url: `/manufacturers/${id}`,
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: ['Catalog'],
      }),
      deleteAdminManufacturer: builder.mutation<void, string>({
        query: (id) => ({ url: `/manufacturers/${id}`, method: 'DELETE' }),
        invalidatesTags: ['Catalog'],
      }),
      getIngredients: builder.query<
        Ingredient[],
        { search?: string; isActive?: boolean } | void
      >({
        query: (params) => ({ url: '/ingredients', params: params ?? undefined }),
        providesTags: ['Catalog'],
      }),
      getMedicineBatches: builder.query<
        MedicineBatch[],
        { productVariantId?: string; status?: string; search?: string } | void
      >({
        query: (params) => ({ url: '/medicine/batches', params: params ?? undefined }),
        providesTags: ['Catalog'],
      }),
      searchProducts: builder.query<SearchResponse, SearchParams>({
        query: (params) => {
          // Strip out undefined, null, or empty string values
          const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
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
      getCategoriesTree: builder.query<Category[], void>({
        query: () => '/categories/tree',
        providesTags: ['Category'],
      }),
      deleteAdminCategory: builder.mutation<void, string>({
        query: (id) => ({
          url: `/categories/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Category'],
      }),
      createAdminProduct: builder.mutation<Product, CreateProductDto>({
        query: (body) => ({
          url: '/products',
          method: 'POST',
          body,
        }),
        invalidatesTags: ['Catalog'],
      }),
      updateAdminProduct: builder.mutation<
        Product,
        { id: string; data: Partial<CreateProductDto> }
      >({
        query: ({ id, data }) => ({
          url: `/products/${id}`,
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: ['Catalog'],
      }),
      deleteAdminProduct: builder.mutation<void, string>({
        query: (id) => ({
          url: `/products/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Catalog'],
      }),
      uploadProductImages: builder.mutation<
        ProductImage[],
        { productId: string; formData: FormData }
      >({
        query: ({ productId, formData }) => ({
          url: `/products/${productId}/images`,
          method: 'POST',
          body: formData,
        }),
        invalidatesTags: ['Catalog'],
      }),
      setPrimaryProductImage: builder.mutation<
        ProductImage,
        { productId: string; imageId: string }
      >({
        query: ({ productId, imageId }) => ({
          url: `/products/${productId}/images/${imageId}/primary`,
          method: 'PATCH',
        }),
        invalidatesTags: ['Catalog'],
      }),
      deleteProductImage: builder.mutation<void, { productId: string; imageId: string }>({
        query: ({ productId, imageId }) => ({
          url: `/products/${productId}/images/${imageId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Catalog'],
      }),
      reorderProductImages: builder.mutation<void, { productId: string; imageIds: string[] }>({
        query: ({ productId, imageIds }) => ({
          url: `/products/${productId}/images/reorder`,
          method: 'PATCH',
          body: { imageIds },
        }),
        invalidatesTags: ['Catalog'],
      }),
      runProductImport: builder.mutation<{ success: boolean; log: ImportLog }, RunImportDto>({
        query: (body) => ({
          url: '/admin/importer/run',
          method: 'POST',
          body,
        }),
        invalidatesTags: ['Catalog', 'Category'],
      }),
      getImportLogs: builder.query<
        { items: ImportLog[]; meta: PaginationMeta },
        { page?: number; limit?: number }
      >({
        query: (params) => ({
          url: '/admin/importer/logs',
          params,
        }),
      }),
      validateCart: builder.mutation<
        { valid: boolean },
        { items: { sellerProductId: string; quantity: number }[] }
      >({
        query: (body) => ({
          url: '/public/cart/validate',
          method: 'POST',
          body,
        }),
      }),
    }),
  });

export const {
  useGetHomepageDataQuery,
  useGetRecentlyAddedProductsQuery,
  useGetPublicCategoriesQuery,
  useGetPublicCategoryTreeQuery,
  useGetCategorySectionsQuery,
  useGetPublicCategoryBySlugQuery,
  useGetPublicProductTypesQuery,
  useGetCatalogFacetsQuery,
  useGetAdminAttributesQuery,
  useCreateAdminAttributeMutation,
  useUpdateAdminAttributeMutation,
  useDeleteAdminAttributeMutation,
  useGetAdminProductTypesQuery,
  useCreateAdminProductTypeMutation,
  useUpdateAdminProductTypeMutation,
  useDeleteAdminProductTypeMutation,
  useSetProductTypeAttributesMutation,
  useGetSearchSuggestionsQuery,
  useGetPopularProductsQuery,
  useGetPublicBrandsQuery,
  useGetBrandsByCategoryQuery,
  useGetCategoriesTreeQuery,
  useGetAdminCategoriesQuery,
  useGetAdminBrandsQuery,
  useGetManufacturersQuery,
  useCreateAdminManufacturerMutation,
  useUpdateAdminManufacturerMutation,
  useDeleteAdminManufacturerMutation,
  useGetIngredientsQuery,
  useGetMedicineBatchesQuery,
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
