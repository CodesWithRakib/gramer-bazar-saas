'use client';

import React, { useState, Suspense, use } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  useSearchProductsQuery,
  useGetPublicCategoriesQuery,
  useGetPublicBrandsQuery,
} from '@/features/catalog/catalogApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductFilterSidebar } from '@/components/catalog/ProductFilterSidebar';
import { ProductSortSelect } from '@/components/catalog/ProductSortSelect';
import { Search, X, Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/format';

function SearchPageContent({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBn = lang === 'bn';

  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const categorySlug = searchParams.get('categorySlug') || '';
  const brandId = searchParams.get('brandId') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true' ? true : undefined;
  const minRating = searchParams.get('minRating')
    ? Number(searchParams.get('minRating'))
    : undefined;
  const limit = 20;

  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Reset cursor whenever filters change
  React.useEffect(() => {
    setCursor(undefined);
  }, [q, categoryId, categorySlug, brandId, sort, minPrice, maxPrice, inStock, minRating, limit]);

  const { data: categories } = useGetPublicCategoriesQuery();
  const { data: brands } = useGetPublicBrandsQuery();

  const [localSearch, setLocalSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setLocalSearch(q);
  }

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isFetching,
    isError,
    refetch,
  } = useSearchProductsQuery({
    q,
    categoryId: categoryId || undefined,
    categorySlug: categorySlug || undefined,
    brandId,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    inStock,
    minRating,
    cursor,
    limit,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl('q', localSearch);
  };

  const updateUrl = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const isEmpty = searchResults?.data?.length === 0;
  const meta = searchResults?.meta;

  const observerRef = React.useRef<IntersectionObserver | null>(null);
  const lastItemRef = React.useCallback((node: HTMLDivElement | null) => {
    if (isSearchLoading || isFetching) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && meta?.hasNextPage && meta.nextCursor) {
        setCursor(meta.nextCursor);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [isSearchLoading, isFetching, meta?.hasNextPage, meta?.nextCursor]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters - Hidden on mobile, visible on md */}
        <div className="hidden md:block">
          <ProductFilterSidebar lang={lang} />
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {q
                  ? isBn
                    ? `"${q}" এর জন্য ফলাফল`
                    : `Results for "${q}"`
                  : isBn
                    ? 'সব পণ্য'
                    : 'All Products'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isSearchLoading && !cursor
                  ? isBn
                    ? 'খোঁজা হচ্ছে...'
                    : 'Searching...'
                  : isBn
                    ? `${formatNumber(searchResults?.data?.length || 0, lang)} টি পণ্য পাওয়া গেছে`
                    : `${searchResults?.data?.length || 0} products found`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="md:hidden">
                <ProductFilterSidebar lang={lang} isMobile />
              </div>
              <ProductSortSelect lang={lang} />
            </div>
          </div>

          {/* Active Filter Badges */}
          {(categoryId || brandId || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categoryId && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <span className="font-medium text-primary">
                    {isBn ? 'ক্যাটাগরি' : 'Category'}:
                  </span>
                  <span>
                    {isBn
                      ? categories?.find((c) => c.id === categoryId)?.nameBn || 'জানা নেই'
                      : categories?.find((c) => c.id === categoryId)?.nameEn || 'Unknown'}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateUrl('categoryId', '')}
                    aria-label={isBn ? 'ক্যাটাগরি ফিল্টার সরান' : 'Remove category filter'}
                    className="ms-1 rounded-full p-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {brandId && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <span className="font-medium text-primary">{isBn ? 'ব্র্যান্ড' : 'Brand'}:</span>
                  <span>
                    {isBn
                      ? brands?.find((b) => b.id === brandId)?.nameBn || 'জানা নেই'
                      : brands?.find((b) => b.id === brandId)?.nameEn || 'Unknown'}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateUrl('brandId', '')}
                    aria-label={isBn ? 'ব্র্যান্ড ফিল্টার সরান' : 'Remove brand filter'}
                    className="ms-1 rounded-full p-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {(minPrice || maxPrice) && (
                <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <span className="font-medium text-primary">{isBn ? 'দাম' : 'Price'}:</span>
                  <span>
                    ৳{minPrice || '0'} - {maxPrice ? `৳${maxPrice}` : isBn ? 'যেকোন' : 'Any'}
                  </span>
                  <button
                    type="button"
                    aria-label={isBn ? 'মূল্য ফিল্টার সরান' : 'Remove price filter'}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('minPrice');
                      params.delete('maxPrice');
                      params.delete('page');
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="ms-1 rounded-full p-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mb-6 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Input
                type="search"
                placeholder={isBn ? 'পণ্য খুঁজুন...' : 'Search products...'}
                aria-label={isBn ? 'পণ্য খুঁজুন' : 'Search products'}
                className="w-full pe-10"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label={isBn ? 'অনুসন্ধান করুন' : 'Search'}
                className="absolute end-0 top-0 h-full focus-visible:rounded-lg"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {isError ? (
            <div className="text-center py-12 text-destructive">
              <p>
                {isBn
                  ? 'দুঃখিত, কোনো ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
                  : 'Sorry, an error occurred. Please try again.'}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                {isBn ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
              </Button>
            </div>
          ) : isEmpty && !isSearchLoading ? (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-xl border border-dashed">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isBn ? 'দুঃখিত, কোনো পণ্য পাওয়া যায়নি' : 'Sorry, no products found'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                {isBn
                  ? 'আপনার খোঁজা পণ্যটি আমাদের স্টকে নেই অথবা ফিল্টারের সাথে মিল নেই। তবে আপনি অনুরোধ করলে আমরা এটি সরবরাহ করার চেষ্টা করব।'
                  : "The product you're looking for isn't in stock right now or doesn't match the filters. But you can request it and we'll try to source it."}
              </p>
              <ProductRequestModal
                lang={lang}
                trigger={
                  <Button variant="secondary" className="rounded-full font-medium">
                    {isBn ? 'পণ্য অনুরোধ করুন' : 'Request Product'}
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <ProductGrid products={searchResults?.data} isLoading={isSearchLoading && !cursor} lang={lang} />

              {/* Infinite Loading Trigger */}
              {meta?.hasNextPage && (
                <div ref={lastItemRef} className="w-full flex items-center justify-center py-8 mt-4">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isBn ? 'আরও পণ্য লোড হচ্ছে...' : 'Loading more products...'}</span>
                  </div>
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
        </div>
      </div>
    </div>
  );
}

export default function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);

  return (
    <Suspense
      fallback={
        <div className="container p-8">
          <p>Loading...</p>
        </div>
      }
    >
      <SearchPageContent lang={lang} />
    </Suspense>
  );
}
