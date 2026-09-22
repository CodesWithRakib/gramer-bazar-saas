"use client";

import React, { useState, useEffect } from 'react';
import { useGetFeaturedProductsQuery, useGetPublicCategoriesQuery } from '@/features/catalog/catalogApi';
import { useGetPublicBannersQuery } from '@/features/banners/bannersApi';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductCardSkeleton, CategoryCardSkeleton } from '@/components/ui/Skeletons';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomImage } from '@/components/ui/CustomImage';
import Link from 'next/link';

export function HomeClient({
  lang,
  dict,
}: {
  lang: string;
  dict: { home?: { featuredProducts?: string; categories?: string } };
}) {
  const { data: featuredResponse, isLoading: isLoadingFeatured } = useGetFeaturedProductsQuery();
  const { data: categories, isLoading: isLoadingCategories } = useGetPublicCategoriesQuery();
  const { data: banners, isLoading: isLoadingBanners } = useGetPublicBannersQuery();

  const featuredProducts = featuredResponse?.data || [];
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto slide banners
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners]);

  const nextBanner = () => {
    if (!banners) return;
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (!banners) return;
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="space-y-12">
      {/* Banner Carousel Section */}
      <section className="relative w-full overflow-hidden rounded-2xl bg-muted h-[250px] md:h-[400px]">
        {isLoadingBanners ? (
          <div className="w-full h-full animate-pulse bg-primary/10 flex items-center justify-center">
            <span className="text-muted-foreground">Loading Campaigns...</span>
          </div>
        ) : !banners || banners.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-primary/20 to-emerald-500/20 text-center p-6">
            <h2 className="text-2xl md:text-4xl font-bold text-primary mb-2">
              {lang === 'bn' ? 'গ্রামের বাজারে স্বাগতম' : 'Welcome to Gramer Bazar'}
            </h2>
            <p className="text-muted-foreground">
              {lang === 'bn' 
                ? 'আপনার প্রয়োজনীয় সব কিছু এক জায়গায়' 
                : 'Everything you need in one place'}
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                {banners[currentBanner].linkUrl ? (
                  <Link href={banners[currentBanner].linkUrl!} className="absolute inset-0 z-10 block">
                    <span className="sr-only">{banners[currentBanner].title}</span>
                  </Link>
                ) : null}
                <CustomImage
                  src={banners[currentBanner].imageUrl}
                  alt={banners[currentBanner].title}
                  fill
                  sizes="100vw"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            
            {banners.length > 1 && (
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background/50 hover:bg-background/90 border-0"
                  onClick={prevBanner}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background/50 hover:bg-background/90 border-0"
                  onClick={nextBanner}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      className={`h-2.5 rounded-full transition-all ${
                        currentBanner === idx ? 'w-8 bg-primary' : 'w-2.5 bg-primary/40 hover:bg-primary/60'
                      }`}
                      onClick={() => setCurrentBanner(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

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
