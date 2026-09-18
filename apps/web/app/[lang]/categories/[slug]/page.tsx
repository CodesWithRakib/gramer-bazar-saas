'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetPublicCategoriesQuery, useSearchProductsQuery } from '@/features/catalog/catalogApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { use } from 'react';

export default function CategoryDetailsPage({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = use(params);
  const isBn = lang === 'bn';

  const { data: categories } = useGetPublicCategoriesQuery();
  const category = categories?.find(c => c.slug === slug);

  // We only fetch products if we found the category to get its ID
  const { data: productsData, isLoading } = useSearchProductsQuery(
    { categoryId: category?.id },
    { skip: !category?.id }
  );

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
            {isBn ? 'ফিরে যান' : 'Back to Categories'}
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          {category.icon && (
            <img src={category.icon} alt="icon" className="w-12 h-12 object-contain" />
          )}
          <h1 className="text-3xl font-bold">{isBn ? category.nameBn : category.nameEn}</h1>
        </div>
      </div>

      <ProductGrid products={productsData?.data} isLoading={isLoading} lang={lang} />
    </div>
  );
}
