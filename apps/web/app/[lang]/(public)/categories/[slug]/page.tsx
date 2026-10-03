'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useGetPublicCategoryBySlugQuery,
  useSearchProductsQuery,
} from '@/features/catalog/catalogApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, PackageSearch, ChevronLeft } from 'lucide-react';
import { ProductFilterSidebar } from '@/components/catalog/ProductFilterSidebar';
import { ProductSortSelect } from '@/components/catalog/ProductSortSelect';
import { MarketplacePagination } from '@/components/catalog/MarketplacePagination';
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

  const {
    data: category,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useGetPublicCategoryBySlugQuery(slug);

  const productTypeId = searchParams.get('productTypeId') || undefined;
  const brandId = searchParams.get('brandId') || undefined;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock') === 'true' ? true : undefined;
  const minRating = searchParams.get('minRating')
    ? Number(searchParams.get('minRating'))
    : undefined;
  const attributes = searchParams.get('attributes') || undefined;
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data: productsData, isLoading: isProductsLoading } = useSearchProductsQuery(
    {
      categoryPath: category?.path || undefined,
      categoryId: category?.id,
      productTypeId,
      brandId,
      attributes,
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

  const meta = productsData?.meta;
  const isEmpty = productsData?.data?.length === 0;
  const children = category?.children ?? [];
  const productTypes = category?.productTypes ?? [];
  const breadcrumb = category?.breadcrumb ?? [];

  if (isCategoryLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
        {isBn ? 'ক্যাটাগরি লোড হচ্ছে...' : 'Loading category...'}
      </div>
    );
  }

  if (isCategoryError || !category) {
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
  const categoryDesc = isBn
    ? category.descriptionBn || category.descriptionEn
    : category.descriptionEn;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Breadcrumb reflects the full materialized path at any depth */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-6"
      >
        <Link
          href={`/${lang}`}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <Home className="h-3.5 w-3.5" />
          <span>{isBn ? 'হোম' : 'Home'}</span>
        </Link>
        {breadcrumb.map((crumb) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 rtl:rotate-180" />
            <Link
              href={`/${lang}/categories/${crumb.slug}`}
              className={cn(
                'hover:text-primary transition-colors truncate',
                crumb.slug === category.slug && 'text-foreground font-semibold'
              )}
            >
              {isBn ? crumb.nameBn : crumb.nameEn}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
        <div className="hidden md:block w-64 flex-shrink-0">
          <ProductFilterSidebar
            lang={lang}
            categoryId={category.id}
            categoryPath={category.path ?? undefined}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-5 rounded-2xl border border-border/60">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center p-2 text-3xl shrink-0 shadow-xs border border-primary/20">
                {category.icon || '📦'}
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
                    ? isBn
                      ? 'লোড হচ্ছে...'
                      : 'Loading products...'
                    : isBn
                      ? `${meta?.total || 0} টি পণ্য পাওয়া গেছে`
                      : `${meta?.total || 0} products available`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="md:hidden">
                <ProductFilterSidebar
                  lang={lang}
                  categoryId={category.id}
                  categoryPath={category.path ?? undefined}
                  isMobile
                />
              </div>
              <ProductSortSelect lang={lang} />
            </div>
          </div>

          {/* Product types attached to this category — the attribute-driven layer */}
          {productTypes.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {isBn ? 'পণ্যের ধরন' : 'Product Types'}
              </p>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <Link
                  href={`/${lang}/categories/${category.slug}`}
                  className={cn(
                    'px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all border',
                    !productTypeId
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border-border/80'
                  )}
                >
                  {isBn ? 'সব ধরন' : 'All types'}
                </Link>
                {productTypes.map((pt) => {
                  const isSelected = productTypeId === pt.id;
                  const href = isSelected
                    ? `/${lang}/categories/${category.slug}`
                    : `/${lang}/categories/${category.slug}?productTypeId=${pt.id}`;
                  return (
                    <Link
                      key={pt.id}
                      href={href}
                      className={cn(
                        'px-4 py-2 rounded-2xl text-xs md:text-sm font-medium whitespace-nowrap transition-all border',
                        isSelected
                          ? 'bg-primary text-primary-foreground font-semibold border-primary shadow-sm'
                          : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border-border/80'
                      )}
                    >
                      {isBn ? pt.nameBn : pt.nameEn}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Child categories at any depth */}
          {children.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <Link
                href={`/${lang}/categories/${category.slug}`}
                className={cn(
                  'px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border',
                  'bg-primary text-primary-foreground border-primary shadow-sm'
                )}
              >
                <span>{isBn ? `সব ${categoryName}` : `All ${categoryName}`}</span>
              </Link>
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/${lang}/categories/${child.slug}`}
                  className="px-4 py-2 rounded-2xl text-xs md:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/80"
                >
                  {child.icon && <span className="text-sm">{child.icon}</span>}
                  <span>{isBn ? child.nameBn : child.nameEn}</span>
                  {child.productCount !== undefined && child.productCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-muted text-muted-foreground">
                      {child.productCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {isEmpty && !isProductsLoading ? (
            <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border/80">
              <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {isBn
                  ? 'এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই'
                  : 'No products available in this category yet'}
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
              <ProductGrid
                products={productsData?.data}
                isLoading={isProductsLoading}
                lang={lang}
              />

              {meta && meta.totalPages > 1 && (
                <div className="mt-10">
                  <MarketplacePagination
                    currentPage={page}
                    totalPages={meta.totalPages}
                    totalItems={meta.total}
                    itemsPerPage={meta.limit}
                    lang={lang}
                    buildHref={(targetPage) => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (targetPage > 1) params.set('page', String(targetPage));
                      else params.delete('page');
                      const qs = params.toString();
                      return `/${lang}/categories/${slug}${qs ? `?${qs}` : ''}`;
                    }}
                    onPageChange={(nextPage) => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (nextPage > 1) params.set('page', String(nextPage));
                      else params.delete('page');
                      const qs = params.toString();
                      router.push(`/${lang}/categories/${slug}${qs ? `?${qs}` : ''}`);
                    }}
                  />
                </div>
              )}

              {meta && meta.totalPages <= 1 && meta.total > 0 && (
                <div className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="w-4 h-4 me-1 rtl:rotate-180" />
                    {isBn ? 'পূর্ববর্তী' : 'Prev'}
                  </Button>
                  <span className="font-semibold">
                    1 / 1
                  </span>
                  <Button variant="outline" size="sm" disabled>
                    {isBn ? 'পরবর্তী' : 'Next'}
                    <ChevronRight className="w-4 h-4 ms-1 rtl:rotate-180" />
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
