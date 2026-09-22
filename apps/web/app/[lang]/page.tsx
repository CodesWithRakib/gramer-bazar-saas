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
import { ArrowRight, ShieldCheck, Leaf, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroBanners } from '@/components/home/HeroBanners';
import { FlashSalesSection } from '@/components/home/FlashSalesSection';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: categories, isLoading: isLoadingCats } = useGetPublicCategoriesQuery();
  const { data: featuredData, isLoading: isLoadingFeatured } = useGetFeaturedProductsQuery();

  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-24 md:pb-12">
      {/* Hero Banners Section */}
      <section className="container mx-auto px-4 mt-6">
        <HeroBanners lang={lang} />
      </section>

      {/* Trust Banners (Location + USPs) */}
      <section className="container mx-auto px-4 mt-2">
        <div className="bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 border p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-border">
          <div className="flex flex-col items-center justify-center gap-3 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1 shadow-inner">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm md:text-base font-bold">{isBn ? 'আপনার এলাকায়' : 'In Your Area'}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{isBn ? 'খানসামা, দিনাজপুর' : 'Khansama, Dinajpur'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm md:text-base font-bold">{isBn ? 'ভেরিফাইড সেলার' : 'Verified Sellers'}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{isBn ? '১০০% নিরাপদ' : '100% Secure'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1 shadow-inner">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm md:text-base font-bold">{isBn ? 'তাজা পণ্য' : 'Fresh Daily'}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{isBn ? 'সরাসরি গ্রাম থেকে' : 'Direct from farms'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 transition-transform hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1 shadow-inner">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm md:text-base font-bold">{isBn ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">{isBn ? 'সময়ের আগে' : 'Right on time'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sales Section */}
      <FlashSalesSection lang={lang} />

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{isBn ? 'ক্যাটাগরি সমূহ' : 'Categories'}</h2>
          <Link href={`/${lang}/categories`} className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
            {isBn ? 'সব দেখুন' : 'View All'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoadingCats ? (
          <div className="flex md:grid overflow-x-auto snap-x snap-mandatory md:grid-cols-4 lg:grid-cols-6 gap-4 pb-4 md:pb-0 hide-scrollbar">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[120px] md:min-w-0 snap-start">
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex md:grid overflow-x-auto snap-x snap-mandatory md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 pb-4 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {categories?.slice(0, 8).map((category) => (
              <div key={category.id} className="min-w-[100px] w-[100px] md:min-w-0 md:w-auto snap-start flex-shrink-0">
                <CategoryCard category={category} lang={lang} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{isBn ? 'জনপ্রিয় পণ্য' : 'Featured Products'}</h2>
          <Link href={`/${lang}/search`} className="text-primary hover:underline flex items-center gap-1 text-sm font-medium">
            {isBn ? 'সব দেখুন' : 'View All'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={featuredData?.data} isLoading={isLoadingFeatured} lang={lang} />
      </motion.section>

      {/* Product Request Banner */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {isBn ? 'আপনার পছন্দের পণ্যটি খুঁজে পাচ্ছেন না?' : 'Cannot find your desired product?'}
            </h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              {isBn 
                ? 'আমাদের জানান আপনার কী প্রয়োজন, আমরা তা সরবরাহ করার সর্বোচ্চ চেষ্টা করব।' 
                : 'Let us know what you need, and we will try our best to source it for you.'}
            </p>
            <ProductRequestModal lang={lang} trigger={
              <Button size="lg" variant="secondary" className="font-semibold px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                {isBn ? 'আমাদের জানান' : 'Let Us Know'}
              </Button>
            } />
          </div>
        </div>
      </motion.section>
    </div>
  );
}
