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
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background pt-8 pb-16 md:py-24 px-4 overflow-hidden border-b">
        {/* Modern abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {isBn ? 'আপনার বিশ্বস্ত অনলাইন মার্কেট' : 'Your Trusted Online Market'}
          </motion.div>
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 text-foreground tracking-tight leading-tight"
          >
            {isBn ? 'আপনার প্রয়োজনীয় সবকিছু' : 'Everything You Need,'}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              {isBn ? ' এখন এক ক্লিকে' : ' Just a Click Away'}
            </span>
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            {isBn 
              ? 'গ্রামের বাজার থেকে খাঁটি এবং ফ্রেশ পণ্য কিনুন সরাসরি স্থানীয় বিক্রেতাদের কাছ থেকে। আজই অর্ডার করুন!' 
              : 'Buy authentic and fresh products directly from local sellers at Gramer Bazar. Shop locally, support locally!'}
          </motion.p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full shadow-lg shadow-primary/25 transition-transform hover:-translate-y-1 text-base" asChild>
              <Link href={`/${lang}/categories`}>{isBn ? 'শপিং শুরু করুন' : 'Start Shopping'}</Link>
            </Button>
            <ProductRequestModal lang={lang} trigger={
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full shadow-sm hover:shadow-md transition-all bg-background/50 backdrop-blur text-base hover:-translate-y-1">
                {isBn ? 'পণ্য অনুরোধ' : 'Product Request'}
              </Button>
            } />
          </motion.div>
        </div>
      </section>

      {/* Trust Banners (Location + USPs) */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
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
