'use client';

import React, { use } from 'react';
import { useGetActiveFlashSalesQuery } from '@/features/flash-sales/flashSalesApi';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CustomImage } from '@/components/ui/CustomImage';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { Flame, Clock, Zap, ArrowLeft, PackageX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function FlashSalePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: flashSales, isLoading } = useGetActiveFlashSalesQuery();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-44 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="h-80 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!flashSales || flashSales.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
          <Flame className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">
          {isBn ? 'এই মুহূর্তে কোনো ফ্ল্যাশ সেল সক্রিয় নেই' : 'No Active Flash Sales Right Now'}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {isBn
            ? 'আমাদের পরবর্তী ফ্ল্যাশ সেল শুরু হলে দেখতে পাবেন। অন্যান্য ডিসকাউন্ট ও অফার দেখতে শপ ব্রাউজ করুন।'
            : 'Check back soon for upcoming flash sales and limited-time discount campaigns.'}
        </p>
        <Button asChild className="mt-4">
          <Link href={`/${lang}/products`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isBn ? 'সকল পণ্য দেখুন' : 'Explore All Products'}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-12">
      {flashSales.map((sale) => (
        <div key={sale.id} className="space-y-6">
          {/* Flash Sale Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {sale.bannerImage && (
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <CustomImage src={sale.bannerImage} alt={sale.name} fill className="object-cover" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4 text-center md:text-left">
              <div className="bg-primary-foreground/15 p-3.5 rounded-2xl backdrop-blur-md shrink-0 shadow-xs">
                <Zap className="w-8 h-8 text-primary-foreground fill-current" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold">{sale.name}</h1>
                  <Badge variant="secondary" className="bg-primary-foreground text-primary font-bold text-xs">
                    {isBn ? 'লাইভ অফার' : 'LIVE DEAL'}
                  </Badge>
                </div>
                <p className="text-primary-foreground/90 text-sm mt-1 max-w-xl">
                  {isBn
                    ? 'দারুণ ডিসকাউন্টে সংগ্রহ করুন আপনার প্রয়োজনীয় সেরা পণ্যগুলো!'
                    : 'Exclusive heavy discounts on top products. Available while stocks last!'}
                </p>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="relative z-10 flex flex-col items-center bg-black/35 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[220px] shadow-sm">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-yellow-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{isBn ? 'অফার শেষ হতে বাকি' : 'Sale Ends In'}</span>
              </div>
              <CountdownTimer targetDate={sale.endDate} lang={lang} />
            </div>
          </div>

          {/* Flash Sale Items Grid */}
          {sale.items && sale.items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {sale.items.map((item) => {
                if (!item.sellerProduct) return null;
                const total = item.quantitySold + item.quantityAvailable;
                const soldPercent =
                  total > 0 ? Math.min(100, Math.round((item.quantitySold / total) * 100)) : 0;

                return (
                  <div key={item.id} className="flex flex-col">
                    <ProductCard
                      product={item.sellerProduct}
                      lang={lang}
                      flashSaleDiscountPrice={item.discountPrice}
                    />

                    {/* Stock Remaining Indicator */}
                    <div className="mt-2 px-1">
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-600 h-1.5 rounded-full"
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground font-medium">
                        <span>{isBn ? 'বিক্রি' : 'Sold'}: {item.quantitySold}</span>
                        <span>{isBn ? 'অবশিষ্ট' : 'Left'}: {item.quantityAvailable}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed text-muted-foreground flex flex-col items-center gap-2">
              <PackageX className="w-8 h-8 text-muted-foreground/40" />
              <span>{isBn ? 'এই সেলে বর্তমানে কোনো পণ্য অন্তর্ভুক্ত নেই' : 'No items listed in this sale'}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
