'use client';

import React from 'react';
import { useGetPublicCategoriesQuery, useSearchProductsQuery } from '@/features/catalog/catalogApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { ProductFilterSidebar } from '@/components/catalog/ProductFilterSidebar';
import { CustomImage } from '@/components/ui/CustomImage';
import { ProductSortSelect } from '@/components/catalog/ProductSortSelect';
import { useRouter, useSearchParams } from 'next/navigation';

import { use } from 'react';

export default function CategoryDetailsPage({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = use(params);
  const isBn = lang === 'bn';

  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: categories } = useGetPublicCategoriesQuery();
  const category = categories?.find(c => c.slug === slug);

  // Filters from URL
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // We only fetch products if we found the category to get its ID
  const { data: productsData, isLoading } = useSearchProductsQuery(
    { 
      categoryId: category?.id,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      page,
      limit: 20,
    },
    { skip: !category?.id }
  );

  const updateUrl = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    router.push(`/${lang}/categories/${slug}?${params.toString()}`);
  };

  const meta = productsData?.meta;
  const isEmpty = productsData?.data?.length === 0;

  if (!categories) {
    return <div className="container py-12 text-center">Loading...</div>;
  }

  if (!category) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{isBn ? 'ক্যাটাগরি পাওয়া যায়নি' : 'Category not found'}</h1>
        <Button asChild>
          <Link href={`/${lang}/categories`}>{isBn ? 'ক্যাটাগরি সমূহ' : 'All Categories'}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-3 text-muted-foreground">
          <Link href={`/${lang}/categories`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isBn ? 'সব ক্যাটাগরি' : 'All Categories'}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="hidden md:block">
          <ProductFilterSidebar lang={lang} />
        </div>

        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              {category.icon && (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center p-2 shrink-0">
                  <CustomImage src={category.icon} alt="icon" width={32} height={32} className="w-8 h-8 object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{isBn ? category.nameBn : category.nameEn}</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading 
                    ? (isBn ? 'লোড হচ্ছে...' : 'Loading...')
                    : (isBn ? `${meta?.total || 0} টি পণ্য পাওয়া গেছে` : `${meta?.total || 0} products found`)
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="md:hidden">
                <ProductFilterSidebar lang={lang} isMobile />
              </div>
              <ProductSortSelect lang={lang} />
            </div>
          </div>

          {isEmpty && !isLoading ? (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-xl border border-dashed">
              <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isBn ? "কোনো পণ্য নেই" : "No products available"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {isBn
                  ? "এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই অথবা ফিল্টারের সাথে মিল নেই।"
                  : "There are currently no products in this category or matching the filters."}
              </p>
            </div>
          ) : (
            <>
              <ProductGrid products={productsData?.data} isLoading={isLoading} lang={lang} />
              
              {meta && meta.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateUrl("page", page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {isBn ? "পূর্ববর্তী" : "Prev"}
                  </Button>
                  <span className="text-sm font-medium">
                    {page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => updateUrl("page", page + 1)}
                  >
                    {isBn ? "পরবর্তী" : "Next"}
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
