"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ShopCard } from "@/components/catalog/ShopCard";
import { ProductRequestModal } from "@/components/catalog/ProductRequestModal";
import { useGetHomepageDataQuery } from "@/features/catalog/catalogApi";
import { Skeleton } from "@/components/ui/skeleton";
import { use } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Leaf,
  Clock,
  MapPin,
  Sparkles,
  Store,
  Flame,
  PackagePlus,
} from "lucide-react";
import { motion } from "framer-motion";
import { MarketplaceHero } from "@/components/home/MarketplaceHero";
import { FlashSalesSection } from "@/components/home/FlashSalesSection";
import { PromotionalModal } from "@/components/promotions/PromotionalModal";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === "bn";

  // Single performant cached endpoint returning curated homepage data
  const { data: homeData, isLoading } = useGetHomepageDataQuery();

  const categories = homeData?.categories || [];
  const featuredProducts = homeData?.featuredProducts || [];
  const popularProducts = homeData?.popularProducts || [];
  const featuredShops = homeData?.featuredShops || [];
  const categorySections = homeData?.categorySections || [];
  const recentlyAdded = homeData?.recentlyAdded || [];

  return (
    <div className="flex flex-col gap-10 md:gap-14 pb-24 md:pb-16">
      {/* Promotional Campaign Modal (frequency controlled) */}
      <PromotionalModal lang={lang} />

      {/* 1. Header / Hero / Search / Banners (Strictly NO Gradients) */}
      <section className="container mx-auto px-4 mt-4">
        <MarketplaceHero lang={lang} />
      </section>

      {/* 2. Trust USPs */}
      <section className="container mx-auto px-4">
        <div className="bg-card rounded-2xl shadow-xs border border-border/80 p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border/60">
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <MapPin className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs md:text-sm font-bold text-foreground">
                {isBn ? "আপনার এলাকায়" : "Local Delivery"}
              </h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">
                {isBn ? "খানসামা ও সংলগ্ন অঞ্চল" : "Khansama & nearby"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs md:text-sm font-bold text-foreground">
                {isBn ? "ভেরিফাইড দোকান" : "Verified Sellers"}
              </h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">
                {isBn ? "১০০% আসল ও নিরাপদ" : "100% Genuine"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-xs">
              <Leaf className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs md:text-sm font-bold text-foreground">
                {isBn ? "তাজা ও খাঁটি পণ্য" : "Fresh & Pure"}
              </h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">
                {isBn ? "সরাসরি খামার থেকে" : "Farm fresh daily"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 p-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-xs">
              <Clock className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs md:text-sm font-bold text-foreground">
                {isBn ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}
              </h3>
              <p className="text-[11px] md:text-xs text-muted-foreground">
                {isBn ? "পণ্য হাতে পেয়ে মূল্য দিন" : "Pay when received"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Discovery (Shop by Category) */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {isBn ? "ক্যাটাগরি ব্রাউজ করুন" : "Shop by Category"}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              {isBn
                ? "আপনার প্রয়োজনীয় খাদ্য, মুদি ও নিত্যপণ্য নির্বাচন করুন"
                : "Explore products by category"}
            </p>
          </div>
          <Link
            href={`/${lang}/categories`}
            className="text-primary hover:underline flex items-center gap-1 text-xs md:text-sm font-medium"
          >
            <span>{isBn ? "সকল ক্যাটাগরি" : "All Categories"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.slice(0, 7).map((category) => (
              <CategoryCard key={category.id} category={category} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Featured Products (Curated small set 4-8) */}
      {isLoading ? (
        <section className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-4 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        </section>
      ) : featuredProducts.length > 0 ? (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.35 }}
          className="container mx-auto px-4"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {isBn ? "নির্বাচিত পণ্যসমূহ" : "Featured Products"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBn
                    ? "স্থানীয় বাজারের সেরা মানের কিউরেটেড পণ্য"
                    : "Handpicked quality products from local sellers"}
                </p>
              </div>
            </div>
            <Link
              href={`/${lang}/products?featured=true`}
              className="text-primary hover:underline flex items-center gap-1 text-xs md:text-sm font-medium"
            >
              <span>{isBn ? "সব দেখুন" : "View All"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid
            products={featuredProducts}
            isLoading={false}
            lang={lang}
          />
        </motion.section>
      ) : null}

      {/* 5. Popular Products */}
      {isLoading ? null : popularProducts.length > 0 ? (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.35 }}
          className="container mx-auto px-4 border-t border-border/40 pt-10"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {isBn ? "জনপ্রিয় পণ্য" : "Popular Products"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBn
                    ? "গ্রাহকদের পছন্দের সর্বাধিক বিক্রিত পণ্য"
                    : "Most loved items by village shoppers"}
                </p>
              </div>
            </div>
            <Link
              href={`/${lang}/products?sort=popular`}
              className="text-primary hover:underline flex items-center gap-1 text-xs md:text-sm font-medium"
            >
              <span>{isBn ? "সব দেখুন" : "View All"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid
            products={popularProducts}
            isLoading={false}
            lang={lang}
          />
        </motion.section>
      ) : null}

      {/* 6. Featured Local Shops */}
      {isLoading ? null : featuredShops.length > 0 ? (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.35 }}
          className="container mx-auto px-4 border-t border-border/40 pt-10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {isBn ? "স্থানীয় বিশ্বস্ত দোকান" : "Featured Local Shops"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBn
                    ? "সরাসরি আপনার আশেপাশের বিশ্বস্ত ব্যবসায়ীদের দোকান থেকে কিনুন"
                    : "Support local merchants and neighborhood stores"}
                </p>
              </div>
            </div>
            <Link
              href={`/${lang}/shops`}
              className="text-primary hover:underline flex items-center gap-1 text-xs md:text-sm font-medium"
            >
              <span>{isBn ? "সব দোকান" : "All Shops"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop as any} lang={lang} />
            ))}
          </div>
        </motion.section>
      ) : null}

      {/* 7. Active Flash Sales / Offers */}
      <FlashSalesSection lang={lang} />

      {/* 8. Independent Category Shelves (e.g. Fresh & Vegetables, Grocery - 4-8 items with View All) */}
      {categorySections.length > 0 && (
        <div className="container mx-auto px-4 space-y-12 border-t border-border/40 pt-10">
          {categorySections.map((sec) => {
            const { category, products } = sec;
            const categoryName = isBn ? category.nameBn : category.nameEn;
            const categoryDesc = isBn
              ? category.descriptionBn || category.descriptionEn
              : category.descriptionEn;

            return (
              <section key={category.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon || "📦"}</span>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                        {categoryName}
                      </h2>
                    </div>
                    {categoryDesc && (
                      <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
                        {categoryDesc}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/${lang}/categories/${category.slug}`}
                    className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-primary hover:underline"
                  >
                    <span>
                      {isBn
                        ? `সব ${categoryName} দেখুন`
                        : `View all ${categoryName}`}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <ProductGrid
                  products={products}
                  isLoading={false}
                  lang={lang}
                />
              </section>
            );
          })}
        </div>
      )}

      {/* 9. Recently Added Products */}
      {isLoading ? null : recentlyAdded.length > 0 ? (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.35 }}
          className="container mx-auto px-4 border-t border-border/40 pt-10"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {isBn ? "নতুন যুক্ত পণ্য" : "Recently Added"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBn
                    ? "বাজারে সম্প্রতি অন্তর্ভুক্ত খাঁটি পণ্যসমূহ"
                    : "Fresh arrivals just listed on Gramer Bazar"}
                </p>
              </div>
            </div>
            <Link
              href={`/${lang}/products?sort=newest`}
              className="text-primary hover:underline flex items-center gap-1 text-xs md:text-sm font-medium"
            >
              <span>{isBn ? "সব দেখুন" : "View All"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={recentlyAdded} isLoading={false} lang={lang} />
        </motion.section>
      ) : null}

      {/* 10. Product Request Banner CTA (Solid Primary Surface - Strictly NO Gradients) */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeUp}
        transition={{ duration: 0.35 }}
        className="container mx-auto px-4"
      >
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 text-center shadow-md relative overflow-hidden border border-primary/20">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isBn
                ? "আপনার প্রয়োজনীয় পণ্যটি খুঁজে পাচ্ছেন না?"
                : "Cannot find what you are looking for?"}
            </h2>
            <p className="text-sm md:text-base text-primary-foreground/90 leading-relaxed">
              {isBn
                ? "আমাদের জানান আপনার কী প্রয়োজন। আমাদের টিম স্থানীয় বাজার ও খামার থেকে সংগ্রহ করে আপনার দোরগোড়ায় পৌঁছে দেবে।"
                : "Tell us what you need. Our local sourcing team will find it from farmers or trusted merchants and deliver it to your door."}
            </p>
            <div className="pt-2">
              <ProductRequestModal
                lang={lang}
                trigger={
                  <Button
                    size="lg"
                    variant="secondary"
                    className="font-bold px-8 py-3 rounded-full shadow-md bg-background text-foreground hover:bg-background/90"
                  >
                    {isBn ? "পণ্যের রিকোয়েস্ট পাঠান" : "Request a Product"}
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
