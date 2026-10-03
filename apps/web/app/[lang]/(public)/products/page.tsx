'use client';

import React, { Suspense, use, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  useSearchProductsQuery,
  useGetPublicCategoriesQuery,
  useGetPublicBrandsQuery,
} from '@/features/catalog/catalogApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { Button } from '@/components/ui/button';
import { ProductFilterSidebar } from '@/components/catalog/ProductFilterSidebar';
import { ProductSortSelect } from '@/components/catalog/ProductSortSelect';
import { formatNumber } from '@/lib/format';
import { Home, SlidersHorizontal, X, Package, Loader2 } from 'lucide-react';

function ProductsPageContent({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBn = lang === 'bn';

  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const categorySlug = searchParams.get('categorySlug') || '';
  const subCategoryId = searchParams.get('subCategoryId') || '';
  const subCategorySlug = searchParams.get('subCategorySlug') || '';
  const brandId = searchParams.get('brandId') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true' ? true : undefined;
  const minRating = searchParams.get('minRating')
    ? Number(searchParams.get('minRating'))
    : undefined;
  const limit = parseInt(searchParams.get('limit') || '24', 10);

  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Reset cursor whenever filters change
  useEffect(() => {
    setCursor(undefined);
  }, [
    q,
    categoryId,
    categorySlug,
    subCategoryId,
    subCategorySlug,
    brandId,
    sort,
    minPrice,
    maxPrice,
    inStock,
    minRating,
    limit,
  ]);

  const { data: categories } = useGetPublicCategoriesQuery();
  const { data: brands } = useGetPublicBrandsQuery();

  const {
    data: searchResults,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useSearchProductsQuery({
    q: q || undefined,
    categoryId: categoryId || undefined,
    categorySlug: categorySlug || undefined,
    subCategoryId: subCategoryId || undefined,
    subCategorySlug: subCategorySlug || undefined,
    brandId: brandId || undefined,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock,
    minRating,
    cursor,
    limit,
  });

  const updateUrl = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value !== null && value !== undefined && value !== '') {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    if (key !== 'page') {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  const isEmpty = searchResults?.data?.length === 0;
  const meta = searchResults?.meta; // Properly typed now

  // Setup Intersection Observer for infinite scrolling
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetching) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && meta?.hasNextPage && meta.nextCursor) {
          setCursor(meta.nextCursor);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetching, meta?.hasNextPage, meta?.nextCursor]
  );

  // Selected category & brand labels for badge display
  const selectedCategory = categories?.find((c) => c.id === categoryId || c.slug === categorySlug);
  const selectedBrand = brands?.find((b) => b.id === brandId);

  const hasActiveFilters = Boolean(
    q ||
    categoryId ||
    categorySlug ||
    subCategoryId ||
    subCategorySlug ||
    brandId ||
    minPrice ||
    maxPrice ||
    inStock ||
    minRating
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground"
      >
        <Link
          href={`/${lang}`}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <Home className="h-3.5 w-3.5" />
          <span>{isBn ? 'হোম' : 'Home'}</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">{isBn ? 'সকল পণ্য' : 'All Products'}</span>
      </nav>

      {/* Main Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/70 border border-border/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Package className="w-3.5 h-3.5" />
              {isBn ? 'গ্রামীণ হাট ও বাজার' : 'Local Produce Market'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
            {isBn ? 'পণ্য ব্রাউজ ও ফিল্টার করুন' : 'Explore Marketplace Products'}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {isBn
              ? 'সরাসরি স্থানীয় বিশ্বস্ত বিক্রেতা ও খামারিদের খাঁটি পণ্য মূল্য, ক্যাটাগরি এবং রেটিং অনুযায়ী সহজে খুঁজে নিন।'
              : 'Browse farm-fresh groceries, vegetables, and everyday products from trusted local shops.'}
          </p>
        </div>

        {/* Products Loaded Pill */}
        {searchResults?.data && (
          <div className="shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-muted/70 border border-border/80 text-xs sm:text-sm font-bold text-foreground shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {isLoading && !cursor
                  ? isBn
                    ? 'লোড হচ্ছে...'
                    : 'Loading...'
                  : isBn
                    ? `${formatNumber(searchResults.data.length, lang)} টি পণ্য দেখাচ্ছে`
                    : `Showing ${searchResults.data.length} products`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* Desktop Filter Sidebar - Sticky with independent scroll for tall content */}
        <div className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin">
          <ProductFilterSidebar lang={lang} />
        </div>

        {/* Products Listing Area */}
        <main className="flex-1 min-w-0">
          {/* Controls Bar: Mobile filter button + Showing info + Sort dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-card border border-border/80 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="md:hidden">
                <ProductFilterSidebar lang={lang} isMobile />
              </div>
              {searchResults?.data && searchResults.data.length > 0 && (
                <div className="text-xs text-muted-foreground hidden sm:block font-medium">
                  {isBn ? (
                    <>
                      <strong className="text-foreground">
                        {formatNumber(searchResults.data.length, lang)}
                      </strong>{' '}
                      টি পণ্য দেখাচ্ছে
                    </>
                  ) : (
                    <>
                      Showing{' '}
                      <strong className="text-foreground">{searchResults.data.length}</strong>{' '}
                      products
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ms-auto">
              <span className="hidden sm:inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isBn ? 'সর্ট করুন:' : 'Sort By:'}
              </span>
              <ProductSortSelect lang={lang} />
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs">
              <span className="me-1 flex items-center gap-1 font-semibold text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {isBn ? 'ফিল্টারসমূহ:' : 'Active Filters:'}
              </span>

              {q && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  <span>{isBn ? `অনুসন্ধান: "${q}"` : `Keyword: "${q}"`}</span>
                  <button
                    type="button"
                    onClick={() => updateUrl('q', null)}
                    className="ms-1 rounded-full p-0.5 hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isBn ? 'সার্চ ফিল্টার সরান' : 'Remove search filter'}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  <span>{isBn ? selectedCategory.nameBn : selectedCategory.nameEn}</span>
                  <button
                    onClick={() => {
                      updateUrl('categoryId', null);
                      updateUrl('categorySlug', null);
                    }}
                    className="ms-1 rounded-full p-0.5 hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isBn ? 'ক্যাটাগরি ফিল্টার সরান' : 'Remove category filter'}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  <span>{isBn ? selectedBrand.nameBn : selectedBrand.nameEn}</span>
                  <button
                    onClick={() => updateUrl('brandId', null)}
                    className="ms-1 rounded-full p-0.5 hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isBn ? 'ব্র্যান্ড ফিল্টার সরান' : 'Remove brand filter'}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  <span>
                    ৳{minPrice || '0'} - {maxPrice ? `৳${maxPrice}` : isBn ? 'যেকোন' : 'Any'}
                  </span>
                  <button
                    onClick={() => {
                      updateUrl('minPrice', null);
                      updateUrl('maxPrice', null);
                    }}
                    className="ms-1 rounded-full p-0.5 hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isBn ? 'মূল্য ফিল্টার সরান' : 'Remove price filter'}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {inStock && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  <span>{isBn ? 'ইন-স্টক পণ্য' : 'In Stock Only'}</span>
                  <button
                    onClick={() => updateUrl('inStock', null)}
                    className="ms-1 rounded-full p-0.5 hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isBn ? 'স্টক ফিল্টার সরান' : 'Remove in-stock filter'}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {minRating && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  <span>★ {minRating}+</span>
                  <button
                    onClick={() => updateUrl('minRating', null)}
                    className="ms-1 rounded-full p-0.5 hover:text-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={isBn ? 'রেটিং ফিল্টার সরান' : 'Remove rating filter'}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ms-auto h-7 px-2 text-xs text-muted-foreground underline hover:text-foreground"
              >
                {isBn ? 'সব মুছুন' : 'Reset all'}
              </Button>
            </div>
          )}

          {/* Product Listing or States */}
          {isError ? (
            <div className="text-center py-16 px-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive space-y-3">
              <p className="font-semibold text-base">
                {isBn
                  ? 'দুঃখিত, পণ্য লোড করতে সমস্যা হয়েছে।'
                  : 'Unable to load products at this moment.'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                {isBn ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </Button>
            </div>
          ) : isEmpty && !isLoading ? (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed border-border/80 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Package className="h-7 w-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-foreground">
                  {isBn ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {isBn
                    ? 'আপনার বর্তমান ফিল্টারের সাথে মিলে এমন কোনো পণ্য এই মুহূর্তে নেই। ফিল্টার শিথিল করুন অথবা নতুন পণ্যের অনুরোধ করুন।'
                    : 'No products matched your selected filters. Try broadening your criteria or submit a product request.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    {isBn ? 'ফিল্টার মুছুন' : 'Clear filters'}
                  </Button>
                )}
                <ProductRequestModal
                  lang={lang}
                  trigger={
                    <Button size="sm" className="font-medium">
                      {isBn ? 'পণ্য অনুরোধ করুন' : 'Request Product'}
                    </Button>
                  }
                />
              </div>
            </div>
          ) : (
            <>
              <ProductGrid
                products={searchResults?.data}
                isLoading={isLoading && !cursor}
                lang={lang}
              />

              {/* Infinite Loading Trigger */}
              {meta?.hasNextPage && (
                <div
                  ref={lastItemRef}
                  className="w-full flex items-center justify-center py-8 mt-4"
                >
                  {isFetching ? (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{isBn ? 'আরও পণ্য লোড হচ্ছে...' : 'Loading more products...'}</span>
                    </div>
                  ) : (
                    <div className="h-10"></div>
                  )}
                </div>
              )}

              {/* End of results indicator */}
              {!meta?.hasNextPage && searchResults?.data && searchResults.data.length > 0 && (
                <div className="w-full flex justify-center py-8 text-sm text-muted-foreground">
                  {isBn ? 'সবগুলো পণ্য দেখানো হয়েছে।' : 'End of products.'}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">
          {lang === 'bn' ? 'পণ্য লোড হচ্ছে...' : 'Loading products...'}
        </div>
      }
    >
      <ProductsPageContent lang={lang} />
    </Suspense>
  );
}
