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
import { ChevronRight, Home, PackageSearch, ChevronLeft, ArrowLeft } from 'lucide-react';
import { ProductFilterSidebar } from '@/components/catalog/ProductFilterSidebar';
import { ProductSortSelect } from '@/components/catalog/ProductSortSelect';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { cn } from '@/lib/utils';

export default function SubCategoryDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string; subCategorySlug: string }>;
}) {
  const { lang, slug, subCategorySlug } = use(params);
  const isBn = lang === 'bn';

  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: tree, isLoading: isTreeLoading } = useGetPublicCategoryTreeQuery();

  // Find parent category and subcategory from the tree
  let parentCategory: Category | null = null;
  let subCategory: Category | null = null;

  if (tree) {
    parentCategory = tree.find((c) => c.slug === slug) || null;
    if (parentCategory?.children) {
      subCategory = parentCategory.children.find((s) => s.slug === subCategorySlug) || null;
    }
  }

  // URL Query State
  const brandId = searchParams.get('brandId') || undefined;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock') === 'true' ? true : undefined;
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Search products filtered by categorySlug AND subCategorySlug
  const { data: productsData, isLoading: isProductsLoading } = useSearchProductsQuery(
    {
      categorySlug: slug,
      subCategorySlug,
      brandId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock,
      minRating,
      sort,
      page,
      limit: 20,
    }
  );

  const updateUrl = (key: string, value: string | number | null) => {
    const queryParams = new URLSearchParams(searchParams.toString());
    if (value) {
      queryParams.set(key, value.toString());
    } else {
      queryParams.delete(key);
    }
    queryParams.delete('page');
    router.push(`/${lang}/categories/${slug}/${subCategorySlug}?${queryParams.toString()}`);
  };

  const meta = productsData?.meta;
  const isEmpty = productsData?.data?.length === 0;
  const siblingSubcategories = parentCategory?.children || [];

  if (isTreeLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
        {isBn ? 'ক্যাটাগরি লোড হচ্ছে...' : 'Loading subcategory...'}
      </div>
    );
  }

  if (!parentCategory) {
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

  const parentName = isBn ? parentCategory.nameBn : parentCategory.nameEn;
  const subCategoryName = subCategory
    ? (isBn ? subCategory.nameBn : subCategory.nameEn)
    : subCategorySlug.replace(/-/g, ' ');

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Breadcrumb Navigation (Phase 15) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href={`/${lang}`} className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>{isBn ? 'হোম' : 'Home'}</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link href={`/${lang}/categories`} className="hover:text-primary transition-colors">
          {isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <Link href={`/${lang}/categories/${parentCategory.slug}`} className="hover:text-primary transition-colors">
          {parentName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-semibold capitalize truncate">{subCategoryName}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Filters Sidebar (Phase 8 & 9) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <ProductFilterSidebar
            lang={lang}
            categorySlug={slug}
            subCategorySlug={subCategorySlug}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-6">
          {/* Subcategory Header */}
          <div className="bg-muted/20 p-5 rounded-2xl border border-border/60">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                  <Link href={`/${lang}/categories/${parentCategory.slug}`} className="hover:underline flex items-center gap-1">
                    <span>{parentCategory.icon || '📦'}</span>
                    <span>{parentName}</span>
                  </Link>
                  <span>/</span>
                  <span className="text-muted-foreground">{subCategoryName}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight capitalize">
                  {subCategoryName}
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {isProductsLoading
                    ? (isBn ? 'লোড হচ্ছে...' : 'Loading products...')
                    : (isBn
                        ? `${meta?.total || 0} টি পণ্য পাওয়া গেছে`
                        : `${meta?.total || 0} products available`)}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="md:hidden">
                  <ProductFilterSidebar
                    lang={lang}
                    categorySlug={slug}
                    subCategorySlug={subCategorySlug}
                    isMobile
                  />
                </div>
                <ProductSortSelect lang={lang} />
              </div>
            </div>
          </div>

          {/* Sibling Subcategories Navigation Pills Bar */}
          {siblingSubcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <Link
                href={`/${lang}/categories/${parentCategory.slug}`}
                className="px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/80 whitespace-nowrap transition-all flex items-center gap-2"
              >
                <span>{isBn ? `সব ${parentName}` : `All ${parentName}`}</span>
                {parentCategory.productCount !== undefined && parentCategory.productCount > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground">
                    {parentCategory.productCount}
                  </span>
                )}
              </Link>

              {siblingSubcategories.map((sibling) => {
                const isCurrent = sibling.slug === subCategorySlug;
                return (
                  <Link
                    key={sibling.id}
                    href={`/${lang}/categories/${parentCategory.slug}/${sibling.slug}`}
                    className={cn(
                      "px-4 py-2 rounded-2xl text-xs md:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2",
                      isCurrent
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/80"
                    )}
                  >
                    {sibling.icon && <span className="text-sm">{sibling.icon}</span>}
                    <span>{isBn ? sibling.nameBn : sibling.nameEn}</span>
                    {sibling.productCount !== undefined && sibling.productCount > 0 && (
                      <span
                        className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full font-bold",
                          isCurrent
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {sibling.productCount}
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
                {isBn ? 'এই উপ-ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই' : 'No products in this subcategory yet'}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm max-w-md mx-auto mb-6">
                {isBn
                  ? 'অন্যান্য উপ-ক্যাটাগরি বা প্রধান ক্যাটাগরির পণ্যসমূহ দেখতে পারেন।'
                  : 'You can check other subcategories or browse the main category.'}
              </p>
              <div className="flex justify-center gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/${lang}/categories/${parentCategory.slug}`}>
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    {isBn ? `${parentName}-এ ফিরে যান` : `Back to ${parentName}`}
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/${lang}/categories`}>
                    {isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}
                  </Link>
                </Button>
              </div>
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
