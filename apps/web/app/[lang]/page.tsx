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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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
    <div className="flex flex-col gap-8 md:gap-12 pb-24 md:pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background pt-8 pb-12 md:py-20 px-4 overflow-hidden">
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight"
          >
            {isBn ? 'আপনার প্রয়োজনীয় সবকিছু এখন এক ক্লিকে' : 'Everything You Need, Just a Click Away'}
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground mb-8"
          >
            {isBn 
              ? 'গ্রামের বাজার থেকে খাঁটি এবং ফ্রেশ পণ্য কিনুন সরাসরি স্থানীয় বিক্রেতাদের কাছ থেকে।' 
              : 'Buy authentic and fresh products directly from local sellers at Gramer Bazar.'}
          </motion.p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button size="lg" className="rounded-full shadow-lg transition-transform hover:scale-105" asChild>
              <Link href={`/${lang}/categories`}>{isBn ? 'শপিং শুরু করুন' : 'Start Shopping'}</Link>
            </Button>
            <ProductRequestModal lang={lang} trigger={
              <Button size="lg" variant="outline" className="rounded-full shadow-sm hover:shadow-md transition-all bg-background">{isBn ? 'পণ্য অনুরোধ' : 'Product Request'}</Button>
            } />
          </motion.div>
        </div>
      </section>

      {/* Trust Banners (Location + USPs) */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-card rounded-2xl shadow-lg border p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center divide-x divide-border/50">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xs md:text-sm font-semibold">{isBn ? 'আপনার এলাকায়' : 'In Your Area'}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground">{isBn ? 'খানসামা, দিনাজপুর' : 'Khansama, Dinajpur'}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xs md:text-sm font-semibold">{isBn ? 'ভেরিফাইড সেলার' : 'Verified Sellers'}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground">{isBn ? '১০০% নিরাপদ' : '100% Secure'}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xs md:text-sm font-semibold">{isBn ? 'তাজা পণ্য' : 'Fresh Daily'}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground">{isBn ? 'সরাসরি গ্রাম থেকে' : 'Direct from farms'}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs md:text-sm font-semibold">{isBn ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground">{isBn ? 'সময়ের আগে' : 'Right on time'}</span>
          </div>
        </div>
      </section>

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
