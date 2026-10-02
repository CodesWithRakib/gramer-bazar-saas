'use client';

import React, { use } from 'react';
import { useGetActiveFlashSalesQuery } from '@/features/flash-sales/flashSalesApi';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CustomImage } from '@/components/ui/CustomImage';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { Flame, Clock, Zap, PackageX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { ProductCardSkeleton } from '@/components/ui/Skeletons';
import { EmptyState } from '@/components/common/EmptyState';

export default function FlashSalePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: flashSales, isLoading } = useGetActiveFlashSalesQuery();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-44 bg-muted/40 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!flashSales || flashSales.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Flame className="w-8 h-8 text-primary" />}
          title={
            isBn ? 'এই মুহূর্তে কোনো ফ্ল্যাশ সেল সক্রিয় নেই' : 'No Active Flash Sales Right Now'
          }
          description={
            isBn
              ? 'আমাদের পরবর্তী ফ্ল্যাশ সেল শুরু হলে দেখতে পাবেন। অন্যান্য ডিসকাউন্ট ও অফার দেখতে শপ ব্রাউজ করুন।'
              : 'Check back soon for upcoming flash sales and limited-time discount campaigns.'
          }
          action={{
            label: isBn ? 'সকল পণ্য দেখুন' : 'Explore All Products',
            href: `/${lang}/search`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-10">
      {flashSales.map((sale) => (
        <div key={sale.id} className="space-y-6">
          {/* Flash Sale Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 dark:from-amber-950 dark:via-orange-950 dark:to-rose-950 text-white p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
            {sale.bannerImage ? (
              <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay">
                <CustomImage
                  src={sale.bannerImage}
                  alt={sale.name}
                  fill
                  fallbackSrc="/banners/banner-honey-ghee.jpg"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent" />
            )}

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-start gap-4 max-w-xl">
              <div className="bg-white/15 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shrink-0 shadow-lg border border-white/20 text-yellow-300">
                <Flame className="w-8 h-8 sm:w-10 sm:h-10 fill-current animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                    {sale.name}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-400 text-stone-900 hover:bg-yellow-300 font-extrabold text-[11px] px-2.5 py-0.5 shadow-sm uppercase tracking-wider"
                  >
                    {isBn ? 'লাইভ অফার' : 'LIVE DEAL'}
                  </Badge>
                </div>
                <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed">
                  {isBn
                    ? 'দারুণ ডিসকাউন্টে সংগ্রহ করুন আপনার প্রয়োজনীয় খাঁটি পণ্যগুলো! স্টক সীমিত, এখনই অর্ডার করুন।'
                    : 'Exclusive limited-time price drops on top village essentials. Available while stocks last!'}
                </p>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="relative z-10 w-full sm:w-auto flex flex-col items-center bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-xl">
              <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-yellow-300 uppercase tracking-wider">
                <Clock className="w-4 h-4 animate-spin text-yellow-300" style={{ animationDuration: '6s' }} />
                <span>{isBn ? 'অফার শেষ হতে বাকি' : 'Sale Ends In'}</span>
              </div>
              <CountdownTimer targetDate={sale.endDate} lang={lang} variant="hero" />
            </div>
          </div>

          {/* Flash Sale Items Grid */}
          {sale.items && sale.items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {sale.items.map((item) => {
                if (!item.sellerProduct) return null;
                const total = item.quantitySold + item.quantityAvailable;
                const soldPercent =
                  total > 0 ? Math.min(100, Math.round((item.quantitySold / total) * 100)) : 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-2xl border bg-card p-2 sm:p-2.5 transition-all duration-200 hover:shadow-md hover:border-orange-500/30"
                  >
                    <ProductCard
                      product={item.sellerProduct}
                      lang={lang}
                      flashSaleDiscountPrice={item.discountPrice}
                    />

                    {/* Stock Remaining Indicator */}
                    <div className="mt-3 px-1 space-y-1">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, soldPercent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground font-medium">
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">
                          {isBn ? 'বিক্রি' : 'Sold'}: {item.quantitySold}
                        </span>
                        <span>
                          {isBn ? 'মজুত' : 'Left'}: {item.quantityAvailable}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed text-muted-foreground flex flex-col items-center gap-3">
              <PackageX className="w-10 h-10 text-muted-foreground/40" />
              <p className="font-semibold text-sm sm:text-base">
                {isBn
                  ? 'এই সেলে বর্তমানে কোনো পণ্য অন্তর্ভুক্ত নেই'
                  : 'No items listed in this sale'}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
