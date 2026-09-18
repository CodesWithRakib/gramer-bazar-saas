'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { 
  useGetPublicCategoriesQuery, 
  useGetFeaturedProductsQuery 
} from '@/features/catalog/catalogApi';
import { Skeleton } from '@/components/ui/skeleton';
import { use } from 'react';
import { ArrowRight } from 'lucide-react';

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: categories, isLoading: isLoadingCats } = useGetPublicCategoriesQuery();
  const { data: featuredData, isLoading: isLoadingFeatured } = useGetFeaturedProductsQuery();

  const renderCategorySkeletons = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="bg-primary/5 py-12 md:py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            {isBn ? 'আপনার প্রয়োজনীয় সবকিছু এখন এক ক্লিকে' : 'Everything You Need, Just a Click Away'}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {isBn 
              ? 'গ্রামের বাজার থেকে খাঁটি এবং ফ্রেশ পণ্য কিনুন সরাসরি স্থানীয় বিক্রেতাদের কাছ থেকে।' 
              : 'Buy authentic and fresh products directly from local sellers at Gramer Bazar.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href={`/${lang}/categories`}>{isBn ? 'শপিং শুরু করুন' : 'Start Shopping'}</Link>
            </Button>
            <ProductRequestModal lang={lang} trigger={
              <Button size="lg" variant="outline">{isBn ? 'পণ্য অনুরোধ' : 'Product Request'}</Button>
            } />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{isBn ? 'ক্যাটাগরি সমূহ' : 'Categories'}</h2>
          <Link href={`/${lang}/categories`} className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
            {isBn ? 'সব দেখুন' : 'View All'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoadingCats ? renderCategorySkeletons() : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories?.slice(0, 6).map((category) => (
              <CategoryCard key={category.id} category={category} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{isBn ? 'জনপ্রিয় পণ্য' : 'Featured Products'}</h2>
          <Link href={`/${lang}/search`} className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
            {isBn ? 'সব দেখুন' : 'View All'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={featuredData?.data} isLoading={isLoadingFeatured} lang={lang} />
      </section>

      {/* Product Request Banner */}
      <section className="container mx-auto px-4">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {isBn ? 'আপনার পছন্দের পণ্যটি খুঁজে পাচ্ছেন না?' : 'Cannot find your desired product?'}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {isBn 
              ? 'আমাদের জানান আপনার কী প্রয়োজন, আমরা তা সরবরাহ করার সর্বোচ্চ চেষ্টা করব।' 
              : 'Let us know what you need, and we will try our best to source it for you.'}
          </p>
          <ProductRequestModal lang={lang} trigger={
            <Button size="lg" variant="secondary" className="font-semibold px-8">
              {isBn ? 'আমাদের জানান' : 'Let Us Know'}
            </Button>
          } />
        </div>
      </section>
    </div>
  );
}
