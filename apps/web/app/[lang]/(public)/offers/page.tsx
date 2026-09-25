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
import { toast } from 'sonner';

export default function OffersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: coupons, isLoading: isCouponsLoading } = useGetPublicCouponsQuery();
  const { data: featuredData, isLoading: isProductsLoading } = useGetFeaturedProductsQuery();

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(isBn ? `কুপন কোড ${code} কপি করা হয়েছে!` : `Coupon code ${code} copied!`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-12">
      {/* 1. Offers Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-green-700 text-white p-6 sm:p-10 shadow-md">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-12 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-yellow-300 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            {isBn ? 'মেগা অফার জোন' : 'Mega Offers Zone'}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            {isBn ? 'সেরা ডিল ও স্পেশাল ডিসকাউন্ট' : 'Super Deals & Special Discounts'}
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl">
            {isBn
              ? 'গ্রামের বাজারের বিশেষ ছাড়, ভাউচার কোড এবং সিজনাল প্রোমোশন উপভোগ করুন এখনই!'
              : 'Save big with exclusive coupons, flash sale events, and category discounts on Gramer Bazar.'}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl shadow-md">
              <Link href={`/${lang}/flash-sale`}>
                <Flame className="w-4 h-4 mr-2 text-red-600 fill-current" />
                {isBn ? 'ফ্ল্যাশ সেল দেখুন' : 'Explore Flash Sale'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl">
              <Link href={`/${lang}/categories`}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isBn ? 'ক্যাটাগরি ব্রাউজ করুন' : 'Browse Categories'}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Highlight Promo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Flash Sale */}
        <Card className="border border-orange-500/20 bg-linear-to-br from-orange-500/10 via-background to-background rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-600 flex items-center justify-center mb-3">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-extrabold text-lg mb-1">
                {isBn ? 'ফ্ল্যাশ ডিলস' : 'Flash Sale Deals'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {isBn ? '৫০% পর্যন্ত বিশেষ মূল্যছাড় সীমিত সময়ের জন্য' : 'Up to 50% discount on selected hot items'}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full text-orange-600 border-orange-500/30 hover:bg-orange-500/10 rounded-xl">
              <Link href={`/${lang}/flash-sale`} className="flex items-center justify-between">
                <span>{isBn ? 'এখনই কিনুন' : 'Shop Flash Sale'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Fresh Produce Deal */}
        <Card className="border border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-background to-background rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mb-3">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg mb-1">
                {isBn ? 'খামার তাজা শাকসবজি' : 'Fresh Farm Produce'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {isBn ? 'কৃষকদের সরাসরি উৎপাদিত খাঁটি পণ্যে বিশেষ অফার' : 'Direct from farm fresh vegetables & daily grocery savings'}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl">
              <Link href={`/${lang}/categories`} className="flex items-center justify-between">
                <span>{isBn ? 'সবজি ও মুদি দেখুন' : 'Explore Grocery'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Free Delivery */}
        <Card className="border border-blue-500/20 bg-linear-to-br from-blue-500/10 via-background to-background rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg mb-1">
                {isBn ? 'ফ্রি ডেলিভারি সুবিধা' : 'Fast Local Delivery'}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {isBn ? 'নির্দিষ্ট পরিমাণের অর্ডারে ফ্রি ডেলিভারি সেবা' : 'Super fast home delivery by our registered village riders'}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full text-blue-600 border-blue-500/30 hover:bg-blue-500/10 rounded-xl">
              <Link href={`/${lang}/shops`} className="flex items-center justify-between">
                <span>{isBn ? 'কাছের দোকান খুঁজুন' : 'Browse Local Shops'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 3. Active Platform Coupons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              {isBn ? 'উপলব্ধ কুপন ও ভাউচার' : 'Available Coupons & Vouchers'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBn ? 'চেকআউটে কুপন কোড ব্যবহার করে অতিরিক্ত ডিসকাউন্ট পান' : 'Apply coupon code at checkout to get instant discounts'}
            </p>
          </div>
        </div>

        {isCouponsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : coupons && coupons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-card border-2 border-dashed border-primary/30 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-primary transition-colors"
              >
                <div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-bold mb-1">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}% ${isBn ? 'ছাড়' : 'OFF'}`
                      : `৳${coupon.discountValue} ${isBn ? 'ছাড়' : 'OFF'}`}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {isBn ? 'সর্বনিম্ন অর্ডার:' : 'Min. Order:'} ৳{coupon.minOrderAmount}
                  </p>
                  {coupon.maxDiscountAmount && (
                    <p className="text-[10px] text-muted-foreground">
                      {isBn ? 'সর্বোচ্চ ছাড়:' : 'Max Discount:'} ৳{coupon.maxDiscountAmount}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-mono text-xs font-extrabold bg-muted px-2.5 py-1 rounded-md border text-primary">
                    {coupon.code}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2.5 hover:bg-primary/10 text-primary"
                    onClick={() => copyCouponCode(coupon.code)}
                  >
                    <Scissors className="w-3 h-3 mr-1" />
                    {isBn ? 'কপি' : 'Copy'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed text-muted-foreground text-sm">
            {isBn ? 'বর্তমানে কোনো সার্বজনীন কুপন সক্রিয় নেই।' : 'No public coupons available at the moment.'}
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
              {isBn ? 'সেরা মূল্যে বাছাইকৃত জনপ্রিয় পণ্য' : 'Handpicked popular items at the best prices'}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${lang}/products`} className="text-xs font-semibold">
              {isBn ? 'সব দেখুন' : 'View All'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
