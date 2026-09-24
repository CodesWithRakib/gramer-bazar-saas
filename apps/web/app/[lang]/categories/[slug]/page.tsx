'use client';

import React from 'react';
import {
  useGetCategoriesTreeQuery,
  useSearchProductsQuery,
  Category,
} from '@/features/catalog/catalogApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { ProductFilterSidebar } from '@/components/catalog/ProductFilterSidebar';
import { ProductSortSelect } from '@/components/catalog/ProductSortSelect';
import { useRouter, useSearchParams } from 'next/navigation';

import { use } from 'react';

export default function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = use(params);
  const isBn = lang === 'bn';

  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: tree, isLoading: isTreeLoading } = useGetCategoriesTreeQuery();

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
  const subCategoryId = searchParams.get('subCategoryId') || undefined;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // We search products using the category ID
  const { data: productsData, isLoading: isProductsLoading } = useSearchProductsQuery(
    {
      categoryId: category?.parentId ? undefined : category?.id,
      subCategoryId: category?.parentId ? category.id : subCategoryId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
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
    return <div className="container py-12 text-center text-muted-foreground">Loading category...</div>;
  }

  if (!category) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isBn ? 'ক্যাটাগরি পাওয়া যায়নি' : 'Category not found'}
        </h1>
        <Button asChild>
          <Link href={`/${lang}/categories`}>
            {isBn ? 'ক্যাটাগরি সমূহ' : 'All Categories'}
          </Link>
        </Button>
      </div>
    );
  }

  const categoryName = isBn ? category.nameBn : category.nameEn;
  const categoryDesc = isBn ? category.descriptionBn : category.descriptionEn;

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center p-2 text-3xl shrink-0 shadow-xs border border-primary/20">
                {category.icon || '🥬'}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {categoryName}
                </h1>
                {categoryDesc && (
                  <p className="text-xs md:text-sm text-muted-foreground max-w-xl mt-0.5">
                    {categoryDesc}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {isProductsLoading
                    ? (isBn ? 'লোড হচ্ছে...' : 'Loading products...')
                    : (isBn
                        ? `${meta?.total || 0} টি পণ্য পাওয়া গেছে`
                        : `${meta?.total || 0} products available`)}
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

          {/* Subcategory Pills Navigation */}
          {subcategories.length > 0 && !category.parentId && (
            <div className="mb-6 pt-2 pb-1 border-y flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <button
                onClick={() => updateUrl('subCategoryId', null)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  !subCategoryId
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {isBn ? 'সব' : 'All'} {categoryName}
              </button>

              {subcategories.map((sub) => {
                const isSelected = subCategoryId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => updateUrl('subCategoryId', isSelected ? null : sub.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {isBn ? sub.nameBn : sub.nameEn}
                  </button>
                );
              })}
            </div>
          )}

          {/* Product Grid / Empty State */}
          {isEmpty && !isProductsLoading ? (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed">
              <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isBn ? 'কোনো পণ্য নেই' : 'No products available'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {isBn
                  ? 'এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য পাওয়া যায়নি বা ফিল্টারের সাথে মেলেনি।'
                  : 'There are currently no products matching this category or filter.'}
              </p>
            </div>
          ) : (
            <>
              <ProductGrid products={productsData?.data} isLoading={isProductsLoading} lang={lang} />

              {meta && meta.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateUrl('page', page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {isBn ? 'পূর্ববর্তী' : 'Prev'}
                  </Button>
                  <span className="text-sm font-medium">
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
