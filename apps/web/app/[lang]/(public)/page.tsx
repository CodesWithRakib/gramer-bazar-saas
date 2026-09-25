'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { 
  useGetPublicCategoriesQuery, 
  useGetPopularProductsQuery 
} from '@/features/catalog/catalogApi';
import { Skeleton } from '@/components/ui/skeleton';
import { use } from 'react';
import { ArrowRight, ShieldCheck, Leaf, Clock, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketplaceHero } from '@/components/home/MarketplaceHero';
import { FlashSalesSection } from '@/components/home/FlashSalesSection';
import { CategorySections } from '@/components/home/CategorySections';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: categories, isLoading: isLoadingCats } = useGetPublicCategoriesQuery();
  const { data: popularData, isLoading: isLoadingPopular } = useGetPopularProductsQuery(8);

  // Filter root categories for popular categories section
  const rootCategories = (categories || []).filter(c => !c.parentId);

  return (
    <div className="flex flex-col gap-10 md:gap-14 pb-24 md:pb-16">
      {/* 1. Hero / Search / Banners (Phase 3 & 4) */}
      <section className="container mx-auto px-4 mt-4">
        <MarketplaceHero lang={lang} />
      </section>

      {/* 2. Trust USPs */}
      <section className="container mx-auto px-4">
        <div className="bg-background/90 backdrop-blur-md rounded-2xl shadow-sm border border-border/70 p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border/60">
          <div className="flex flex-col items-center justify-center gap-2 p-2 transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <MapPin className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs md:text-sm font-bold text-foreground">{isBn ? 'আপনার এলাকায়' : 'Local Delivery'}</h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">{isBn ? 'খানসামা ও সংলগ্ন অঞ্চল' : 'Khansama & nearby'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-2 transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs md:text-sm font-bold text-foreground">{isBn ? 'ভেরিফাইড দোকান' : 'Verified Sellers'}</h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">{isBn ? '১০০% আসল ও নিরাপদ' : '100% Genuine'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-2 transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-xs">
              <Leaf className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs md:text-sm font-bold text-foreground">{isBn ? 'তাজা ও খাঁটি পণ্য' : 'Fresh & Pure'}</h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">{isBn ? 'সরাসরি খামার থেকে' : 'Farm fresh daily'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-2 transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-xs">
              <Clock className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs md:text-sm font-bold text-foreground">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">{isBn ? 'পণ্য হাতে পেয়ে মূল্য দিন' : 'Pay when received'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Categories (Phase 5, 25 & 41) */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {isBn ? 'জনপ্রিয় ক্যাটাগরি' : 'Popular Categories'}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {isBn ? 'আপনার পছন্দের প্রয়োজনীয় পণ্য নির্বাচন করুন' : 'Explore products by categories'}
            </p>
          </div>
          <Link
            href={`/${lang}/categories`}
            className="text-primary hover:underline flex items-center gap-1 text-xs md:text-sm font-medium"
          >
            <span>{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoadingCats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {rootCategories.map((category) => (
              <CategoryCard key={category.id} category={category} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Flash Sales Section */}
      <FlashSalesSection lang={lang} />

      {/* 5. Category-wise Product Sections (Phase 3 & 42: Fresh & Veg, Grocery, Food, Cosmetics, etc.) */}
      <CategorySections lang={lang} />

      {/* 6. Popular / Recommended Products (Phase 41) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 border-t border-border/40 pt-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {isBn ? 'জনপ্রিয় ও সুপারিশকৃত পণ্য' : 'Popular & Recommended Products'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBn ? 'গ্রাহকদের পছন্দের সেরা মানের পণ্য' : 'Top picks loved by our customers'}
              </p>
            </div>
          </div>
          <Link href={`/${lang}/search`} className="text-primary hover:underline flex items-center gap-1 text-xs md:text-sm font-medium">
            <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={popularData?.data} isLoading={isLoadingPopular} lang={lang} />
      </motion.section>

      {/* 7. Product Request Banner CTA (Phase 3) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4"
      >
        <div className="bg-gradient-to-r from-emerald-800 via-primary to-teal-900 text-primary-foreground rounded-3xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isBn ? 'আপনার প্রয়োজনীয় পণ্যটি খুঁজে পাচ্ছেন না?' : 'Cannot find what you are looking for?'}
            </h2>
            <p className="text-sm md:text-base text-primary-foreground/90 leading-relaxed">
              {isBn 
                ? 'আমাদের জানান আপনার কী প্রয়োজন। আমাদের টিম স্থানীয় বাজার ও খামার থেকে সংগ্রহ করে আপনার দোরগোড়ায় পৌঁছে দেবে।' 
                : 'Tell us what you need. Our local sourcing team will find it from farmers or trusted merchants and deliver it to your door.'}
            </p>
            <div className="pt-2">
              <ProductRequestModal
                lang={lang}
                trigger={
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-bold px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105 bg-background text-foreground hover:bg-background/90"
                  >
                    {isBn ? 'পণ্যের রিকোয়েস্ট পাঠান' : 'Request a Product'}
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
