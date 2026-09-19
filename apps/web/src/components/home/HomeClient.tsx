"use client";

import React from 'react';
import { useGetFeaturedProductsQuery, useGetPublicCategoriesQuery } from '@/features/catalog/catalogApi';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductCardSkeleton, CategoryCardSkeleton } from '@/components/ui/Skeletons';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function HomeClient({ lang, dict }: { lang: string, dict: any }) {
  const { data: featuredResponse, isLoading: isLoadingFeatured } = useGetFeaturedProductsQuery();
  const { data: categories, isLoading: isLoadingCategories } = useGetPublicCategoriesQuery();

  const featuredProducts = featuredResponse?.data || [];

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{dict.home?.featuredProducts || 'Featured Products'}</h2>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoadingFeatured
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="min-w-[75vw] sm:min-w-[45vw] md:min-w-0 snap-center shrink-0">
                  <ProductCardSkeleton />
                </div>
              ))
            : featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="min-w-[75vw] sm:min-w-[45vw] md:min-w-0 snap-center shrink-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard product={product} lang={lang} />
                </motion.div>
              ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{dict.home?.categories || 'Categories'}</h2>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 gap-4 md:grid md:grid-cols-4 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoadingCategories
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[40vw] sm:min-w-[30vw] md:min-w-0 snap-start shrink-0">
                  <CategoryCardSkeleton />
                </div>
              ))
            : categories?.slice(0, 6).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative bg-white border border-border rounded-xl overflow-hidden p-6 text-center hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 min-w-[40vw] sm:min-w-[30vw] md:min-w-0 snap-start shrink-0"
                >
                  <Link href={`/${lang}/catalog?category=${category.slug}`} className="absolute inset-0 z-10" />
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {/* Placeholder for icon if any */}
                    <span className="text-xl font-bold">{category.nameEn.charAt(0)}</span>
                  </div>
                  <h3 className="font-medium text-sm">
                    {lang === 'bn' ? category.nameBn : category.nameEn}
                  </h3>
                </motion.div>
              ))}
        </div>
      </section>
    </div>
  );
}
