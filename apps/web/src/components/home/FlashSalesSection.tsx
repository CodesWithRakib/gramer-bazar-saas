'use client';

import React from 'react';
import Link from 'next/link';
import { useGetActiveFlashSalesQuery } from '@/features/flash-sales/flashSalesApi';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { ArrowRight, Zap, Flame } from 'lucide-react';

export function FlashSalesSection({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const { data: flashSales, isLoading } = useGetActiveFlashSalesQuery();

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 mt-8 md:mt-12 max-w-7xl">
        <Skeleton className="h-10 w-48 mb-6 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!flashSales || flashSales.length === 0) return null;

  const currentSale = flashSales[0];
  const items = currentSale.items || [];
  if (items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 mt-8 md:mt-12 max-w-7xl">
      <div className="bg-card border border-rose-500/25 dark:border-rose-500/30 rounded-2xl p-4 md:p-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl border border-rose-500/20">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-rose-500 fill-current" />
                  {isBn ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}
                </h2>
                <span className="text-muted-foreground text-sm font-medium">
                  • {currentSale.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBn
                  ? 'সীমিত সময়ের জন্য বিশেষ মূল্যছাড়!'
                  : 'Massive limited-time deals on selected products!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Live Countdown */}
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-xs border border-rose-500/30 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="text-xs font-semibold text-rose-600">
                {isBn ? 'বাকি আছে:' : 'Ends in:'}
              </span>
              <CountdownTimer targetDate={currentSale.endDate} lang={lang} />
            </div>

            <Link
              href={`/${lang}/flash-sale`}
              className="text-rose-600 hover:text-rose-700 font-semibold text-xs md:text-sm flex items-center gap-1 transition-colors shrink-0"
            >
              {isBn ? 'সবগুলো দেখুন' : 'View All'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Product Cards Grid / Horizontal Scroll on mobile */}
        <div className="flex md:grid overflow-x-auto snap-x snap-mandatory md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-2 md:pb-0 scrollbar-none -mx-2 px-2 md:mx-0 md:px-0">
          {items.slice(0, 5).map((item) => {
            if (!item.sellerProduct) return null;
            const originalPrice = Number(item.sellerProduct.price);
            const discountPercent =
              originalPrice > item.discountPrice
                ? Math.round(((originalPrice - item.discountPrice) / originalPrice) * 100)
                : 0;

            const total = item.quantitySold + item.quantityAvailable;
            const soldPercent = total > 0 ? Math.min(100, Math.round((item.quantitySold / total) * 100)) : 0;

            return (
              <div key={item.id} className="min-w-[190px] sm:min-w-[210px] md:min-w-0 snap-start flex flex-col">
                <ProductCard
                  product={item.sellerProduct}
                  lang={lang}
                  flashSaleDiscountPrice={item.discountPrice}
                />
                {/* Stock Progress Bar */}
                <div className="mt-2 px-1">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-rose-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground font-medium">
                    <span>{isBn ? 'বিক্রি' : 'Sold'}: {item.quantitySold}</span>
                    <span>{isBn ? 'স্টক বাকি' : 'Left'}: {item.quantityAvailable}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
