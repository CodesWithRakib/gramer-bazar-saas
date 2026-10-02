'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useGetPublicCouponsQuery } from '@/features/coupons/couponsApi';
import { useGetFeaturedProductsQuery } from '@/features/catalog/catalogApi';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tag,
  Scissors,
  Zap,
  Truck,
  Flame,
  ArrowRight,
  Gift,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/components/ui/custom-toast';
import { CustomImage } from '@/components/ui/CustomImage';

export default function OffersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: coupons, isLoading: isCouponsLoading } = useGetPublicCouponsQuery();
  const { data: featuredData, isLoading: isProductsLoading } = useGetFeaturedProductsQuery();

  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(isBn ? `কুপন কোড ${code} কপি করা হয়েছে!` : `Coupon code ${code} copied!`);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2500);
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl space-y-10">
      {/* 1. Offers Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white p-6 sm:p-10 md:p-12 shadow-xl border border-emerald-500/20">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <CustomImage
            src="/banners/banner-village-market.jpg"
            alt="Offers Banner"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-yellow-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'মেগা অফার ও সেভিংস জোন' : 'Mega Offers & Savings Zone'}</span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {isBn ? 'সেরা ডিল ও স্পেশাল ডিসকাউন্ট' : 'Super Deals & Special Discounts'}
          </h1>

          <p className="text-white/85 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            {isBn
              ? 'গ্রামের বাজারের বিশেষ ছাড়, ভাউচার কোড এবং সিজনাল প্রোমোশন উপভোগ করুন এখনই! খাঁটি পণ্য কিনুন সাশ্রয়ী মূল্যে।'
              : 'Save big with verified coupon vouchers, flash sale events, and direct-from-farm category discounts on Gramer Bazar.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-extrabold rounded-2xl shadow-lg px-6 h-11 text-xs sm:text-sm transition-transform active:scale-95"
            >
              <Link href={`/${lang}/flash-sale`}>
                <Flame className="w-4 h-4 me-2 text-red-600 fill-current" />
                {isBn ? 'ফ্ল্যাশ সেল দেখুন' : 'Explore Flash Sale'}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/25 rounded-2xl h-11 px-6 text-xs sm:text-sm backdrop-blur-sm"
            >
              <Link href={`/${lang}/categories`}>
                <ShoppingBag className="w-4 h-4 me-2" />
                {isBn ? 'ক্যাটাগরি ব্রাউজ করুন' : 'Browse Categories'}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Highlight Promo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1: Flash Sale */}
        <Card className="border border-orange-500/25 bg-gradient-to-br from-card to-orange-500/5 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3.5 shadow-xs">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-1">
                {isBn ? 'ফ্ল্যাশ ডিলস' : 'Flash Sale Deals'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {isBn
                  ? '৫০% পর্যন্ত বিশেষ মূল্যছাড় সীমিত সময়ের জন্য সেরা পণ্যে'
                  : 'Up to 50% discount on selected hot items with countdown timers'}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/10 rounded-xl font-semibold"
            >
              <Link href={`/${lang}/flash-sale`} className="flex items-center justify-between">
                <span>{isBn ? 'এখনই কিনুন' : 'Shop Flash Sale'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Fresh Produce Deal */}
        <Card className="border border-emerald-500/25 bg-gradient-to-br from-card to-emerald-500/5 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3.5 shadow-xs">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-1">
                {isBn ? 'খামার তাজা শাকসবজি' : 'Fresh Farm Produce'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {isBn
                  ? 'কৃষকদের সরাসরি উৎপাদিত খাঁটি পণ্যে বিশেষ অফার ও বান্ডল ডিল'
                  : 'Direct-from-farm fresh vegetables & daily grocery bulk savings'}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl font-semibold"
            >
              <Link href={`/${lang}/categories`} className="flex items-center justify-between">
                <span>{isBn ? 'সবজি ও মুদি দেখুন' : 'Explore Grocery'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Fast Local Delivery */}
        <Card className="border border-blue-500/25 bg-gradient-to-br from-card to-blue-500/5 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 sm:col-span-2 md:col-span-1">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3.5 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-1">
                {isBn ? 'দ্রুত স্থানীয় ডেলিভারি' : 'Fast Local Delivery'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {isBn
                  ? 'নির্দিষ্ট পরিমাণের অর্ডারে ফ্রি ডেলিভারি ও গ্রামীণ রাইডার সার্ভিস'
                  : 'Super fast home delivery by our registered village riders directly'}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10 rounded-xl font-semibold"
            >
              <Link href={`/${lang}/shops`} className="flex items-center justify-between">
                <span>{isBn ? 'কাছের দোকান খুঁজুন' : 'Browse Local Shops'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3. Active Platform Coupons Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <span>{isBn ? 'উপলব্ধ কুপন ও ভাউচার' : 'Available Coupons & Vouchers'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {isBn
              ? 'চেকআউটে কুপন কোড ব্যবহার করে অতিরিক্ত ডিসকাউন্ট উপভোগ করুন'
              : 'Apply coupon code at checkout to claim instant discounts'}
          </p>
        </div>

        {isCouponsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : coupons && coupons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => {
              const isCopied = copiedCode === coupon.code;
              return (
                <div
                  key={coupon.id}
                  className="relative bg-card border-2 border-dashed border-primary/40 hover:border-primary rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs transition-all duration-200"
                >
                  <div className="space-y-1">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary text-xs font-extrabold px-2.5 py-0.5"
                    >
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% ${isBn ? 'ছাড়' : 'OFF'}`
                        : `৳${coupon.discountValue} ${isBn ? 'ছাড়' : 'OFF'}`}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-medium">
                      {isBn ? 'সর্বনিম্ন অর্ডার:' : 'Min. Order:'} <span className="font-semibold text-foreground">৳{coupon.minOrderAmount}</span>
                    </p>
                    {coupon.maxDiscountAmount && (
                      <p className="text-[11px] text-muted-foreground">
                        {isBn ? 'সর্বোচ্চ ছাড়:' : 'Max Discount:'} ৳{coupon.maxDiscountAmount}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-mono text-xs sm:text-sm font-black bg-muted/80 px-3 py-1 rounded-lg border text-primary tracking-wider">
                      {coupon.code}
                    </span>
                    <Button
                      variant={isCopied ? 'default' : 'outline'}
                      size="sm"
                      className={`h-7 text-xs px-3 rounded-lg font-semibold transition-all ${
                        isCopied ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-primary hover:bg-primary/10'
                      }`}
                      onClick={() => copyCouponCode(coupon.code)}
                    >
                      <Scissors className="w-3 h-3 me-1" />
                      {isCopied ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'কপি' : 'Copy')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed text-muted-foreground text-sm">
            {isBn
              ? 'বর্তমানে কোনো সার্বজনীন কুপন সক্রিয় নেই।'
              : 'No public coupons available at the moment.'}
          </div>
        )}
      </div>

      {/* 4. Featured Discounted Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-current" />
              {isBn ? 'সেরা অফারের পণ্যসমূহ' : 'Top Deals & Featured Items'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBn
                ? 'সেরা মূল্যে বাছাইকৃত জনপ্রিয় পণ্য'
                : 'Handpicked popular items at the best prices'}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${lang}/products`} className="text-xs font-semibold">
              {isBn ? 'সব দেখুন' : 'View All'}{' '}
              <ArrowRight className="w-3.5 h-3.5 ms-1 rtl:rotate-180" />
            </Link>
          </Button>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredData?.data && featuredData.data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {featuredData.data.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
