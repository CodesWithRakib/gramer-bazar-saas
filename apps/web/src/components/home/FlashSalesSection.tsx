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
      <section className="container mx-auto px-4 mt-8 md:mt-12 w-full min-w-0">
        <Skeleton className="h-10 w-48 mb-6 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
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
    <section className="container mx-auto px-4 mt-8 md:mt-12 w-full min-w-0">
      <div className="bg-card border border-rose-500/25 dark:border-rose-500/30 rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs w-full min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 md:mb-6 gap-3 sm:gap-4 border-b border-border/60 pb-4">
          {/* Title Area */}
          <div className="flex items-start justify-between sm:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 sm:p-2.5 rounded-xl border border-rose-500/20 shrink-0">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-1.5 shrink-0">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-current" />
                    {isBn ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}
                  </h2>
                  {currentSale.name && (
                    <span className="text-muted-foreground text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-[220px]">
                      • {currentSale.name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {isBn
                    ? 'সীমিত সময়ের জন্য বিশেষ মূল্যছাড়!'
                    : 'Massive limited-time deals on selected products!'}
                </p>
              </div>
            </div>

            {/* Mobile View All Link at top right */}
            <Link
              href={`/${lang}/flash-sale`}
              className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1 transition-colors shrink-0 sm:hidden pt-1"
            >
              <span>{isBn ? 'সব দেখুন' : 'View All'}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>

          {/* Right Action: Live Countdown + Desktop View All Link */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Live Countdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-background/80 backdrop-blur-xs border border-rose-500/30 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-xs">
              <span className="text-[11px] sm:text-xs font-semibold text-rose-600 shrink-0">
                {isBn ? 'বাকি আছে:' : 'Ends in:'}
              </span>
              <CountdownTimer targetDate={currentSale.endDate} lang={lang} />
            </div>

            {/* Desktop View All Link */}
            <Link
              href={`/${lang}/flash-sale`}
              className="hidden sm:flex text-rose-600 hover:text-rose-700 font-semibold text-xs md:text-sm items-center gap-1 transition-colors shrink-0"
            >
              <span>{isBn ? 'সবগুলো দেখুন' : 'View All'}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Product Cards Grid / Horizontal Scroll on mobile */}
        <div className="flex md:grid overflow-x-auto snap-x snap-mandatory sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3 pb-2 md:pb-0 scrollbar-none md:mx-0 md:px-0 w-full min-w-0 max-w-full overscroll-x-contain">
          {items.slice(0, 6).map((item) => {
            if (!item.sellerProduct) return null;
            const originalPrice = Number(item.sellerProduct.price);
            const discountPercent =
              originalPrice > item.discountPrice
                ? Math.round(((originalPrice - item.discountPrice) / originalPrice) * 100)
                : 0;

            const total = item.quantitySold + item.quantityAvailable;
            const soldPercent =
              total > 0 ? Math.min(100, Math.round((item.quantitySold / total) * 100)) : 0;

            return (
              <div
                key={item.id}
                className="w-[145px] min-w-[145px] sm:w-[170px] sm:min-w-[170px] md:w-auto md:min-w-0 snap-start flex flex-col shrink-0"
              >
                <ProductCard
                  product={item.sellerProduct}
                  lang={lang}
                  flashSaleDiscountPrice={item.discountPrice}
                />
                {/* Stock Progress Bar */}
                <div className="mt-2 px-1">
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground font-medium">
                    <span>
                      {isBn ? 'বিক্রি' : 'Sold'}: {item.quantitySold}
                    </span>
                    <span>
                      {isBn ? 'স্টক বাকি' : 'Left'}: {item.quantityAvailable}
                    </span>
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
