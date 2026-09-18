'use client';

import React from 'react';
import { useGetPublicCategoriesQuery } from '@/features/catalog/catalogApi';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { Skeleton } from '@/components/ui/skeleton';

import { use } from 'react';

export default function CategoriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: categories, isLoading } = useGetPublicCategoriesQuery();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {isBn ? 'সব ক্যাটাগরি' : 'All Categories'}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isBn 
            ? 'আপনার প্রয়োজনীয় সবকিছু আমাদের ক্যাটাগরি থেকে সহজে খুঁজে নিন।' 
            : 'Find everything you need easily from our wide range of categories.'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories?.map((category) => (
            <CategoryCard key={category.id} category={category} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
