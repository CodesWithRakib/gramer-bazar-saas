'use client';

import React from 'react';
import {
  useGetPublicCategoryTreeQuery,
  useSearchProductsQuery,
  Category,
} from '@/features/catalog/catalogApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Home, PackageSearch, ChevronLeft } from 'lucide-react';
import { ProductFilterSidebar } from '@/components/catalog/ProductFilterSidebar';
import { ProductSortSelect } from '@/components/catalog/ProductSortSelect';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { cn } from '@/lib/utils';

export default function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = use(params);
  const isBn = lang === 'bn';

  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: tree, isLoading: isTreeLoading } = useGetPublicCategoryTreeQuery();

  // Find matching category in root or children
  let category: Category | null = null;
  let rootCategory: Category | null = null;
  if (tree) {
    for (const root of tree) {
      if (root.slug === slug) {
        category = root;
        rootCategory = root;
        break;
      }
      const child = root.children?.find((c) => c.slug === slug);
      if (child) {
        category = child;
        rootCategory = root;
        break;
      }
    }
  }

  // Filters from URL
  const subCategorySlugParam = searchParams.get('subCategory') || searchParams.get('subCategorySlug') || undefined;
  const subCategoryId = searchParams.get('subCategoryId') || undefined;
  const brandId = searchParams.get('brandId') || undefined;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock') === 'true' ? true : undefined;
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Search products using the category ID / slug
  const { data: productsData, isLoading: isProductsLoading } = useSearchProductsQuery(
    {
      categorySlug: category?.parentId ? undefined : slug,
      categoryId: category?.parentId ? undefined : category?.id,
      subCategoryId: category?.parentId ? category.id : subCategoryId,
      subCategorySlug: subCategorySlugParam,
      brandId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock,
      minRating,
      sort,
      page,
      limit: 20,
    },
    { skip: !category?.id }
  );

  const updateUrl = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/${lang}/categories/${slug}?${params.toString()}`);
  };

  const meta = productsData?.meta;
  const isEmpty = productsData?.data?.length === 0;
  const subcategories = rootCategory?.children || [];

  if (isTreeLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
        {isBn ? 'ক্যাটাগরি লোড হচ্ছে...' : 'Loading category...'}
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isBn ? 'ক্যাটাগরি পাওয়া যায়নি' : 'Category not found'}
        </h1>
        <Button asChild>
          <Link href={`/${lang}/categories`}>
            {isBn ? 'সকল ক্যাটাগরি দেখুন' : 'View All Categories'}
          </Link>
        </Button>
      </div>
    );
  }

  const categoryName = isBn ? category.nameBn : category.nameEn;
  const categoryDesc = isBn ? category.descriptionBn || category.descriptionEn : category.descriptionEn;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Breadcrumb Navigation (Phase 15) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href={`/${lang}`} className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>{isBn ? 'হোম' : 'Home'}</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link href={`/${lang}/categories`} className="hover:text-primary transition-colors">
          {isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-semibold truncate">{categoryName}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Filters Sidebar (Phase 8 & 9) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <ProductFilterSidebar
            lang={lang}
            categorySlug={slug}
            subCategorySlug={subCategorySlugParam}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-6">
          {/* Category Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-5 rounded-2xl border border-border/60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center p-2 text-3xl shrink-0 shadow-xs border border-primary/20">
                {category.icon || '🥬'}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  {categoryName}
                </h1>
                {categoryDesc && (
                  <p className="text-xs md:text-sm text-muted-foreground max-w-xl mt-0.5 line-clamp-2">
                    {categoryDesc}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {isProductsLoading
                    ? (isBn ? 'লোড হচ্ছে...' : 'Loading products...')
                    : (isBn
                        ? `${meta?.total || 0} টি পণ্য পাওয়া গেছে`
                        : `${meta?.total || 0} products available`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="md:hidden">
                <ProductFilterSidebar
                  lang={lang}
                  categorySlug={slug}
                  subCategorySlug={subCategorySlugParam}
                  isMobile
                />
              </div>
              <ProductSortSelect lang={lang} />
            </div>
          </div>

          {/* Subcategory Navigation Pills */}
          {subcategories.length > 0 && !category.parentId && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <Link
                href={`/${lang}/categories/${category.slug}`}
                className={cn(
                  "px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                  !subCategorySlugParam
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/80"
                )}
              >
                <span>{isBn ? `সব ${categoryName}` : `All ${categoryName}`}</span>
                {category.productCount !== undefined && category.productCount > 0 && (
                  <span
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full font-bold",
                      !subCategorySlugParam
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {category.productCount}
                  </span>
                )}
              </Link>

              {subcategories.map((sub) => {
                const isSelected = subCategorySlugParam === sub.slug;
                return (
                  <Link
                    key={sub.id}
                    href={`/${lang}/categories/${category.slug}/${sub.slug}`}
                    className={cn(
                      "px-4 py-2 rounded-2xl text-xs md:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2",
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/80"
                    )}
                  >
                    {sub.icon && <span className="text-sm">{sub.icon}</span>}
                    <span>{isBn ? sub.nameBn : sub.nameEn}</span>
                    {sub.productCount !== undefined && sub.productCount > 0 && (
                      <span
                        className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full font-bold",
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {sub.productCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Product Grid / Empty State (Phase 8, 21, 22) */}
          {isEmpty && !isProductsLoading ? (
            <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {isBn ? 'এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই' : 'No products available in this category yet'}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm max-w-md mx-auto mb-6">
                {isBn
                  ? 'শীঘ্রই এই ক্যাটাগরিতে নতুন পণ্য যুক্ত করা হবে। অন্যান্য ক্যাটাগরি ঘুরে দেখুন।'
                  : 'New products will be added soon. Feel free to browse other categories.'}
              </p>
              <Button asChild variant="outline">
                <Link href={`/${lang}/categories`}>
                  {isBn ? 'অন্যান্য ক্যাটাগরি দেখুন' : 'Explore Other Categories'}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <ProductGrid products={productsData?.data} isLoading={isProductsLoading} lang={lang} />

              {/* Server-side Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateUrl('page', page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {isBn ? 'পূর্ববর্তী' : 'Prev'}
                  </Button>
                  <span className="text-xs md:text-sm font-semibold text-muted-foreground">
                    {page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => updateUrl('page', page + 1)}
                  >
                    {isBn ? 'পরবর্তী' : 'Next'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
