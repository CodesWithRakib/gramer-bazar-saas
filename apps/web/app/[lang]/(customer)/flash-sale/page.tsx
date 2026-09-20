'use client';
import { use } from 'react';
import React, { useState } from 'react';
import { useGetActiveFlashSalesQuery } from '@/features/flash-sales/flashSalesApi';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CustomImage } from '@/components/ui/CustomImage';
import { Flame, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { enUS, bn } from 'date-fns/locale';

export default function FlashSalePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: flashSales, isLoading } = useGetActiveFlashSalesQuery();

  if (isLoading) {
    return (
      <div className="container max-w-7xl py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!flashSales || flashSales.length === 0) {
    return (
      <div className="container max-w-7xl py-12 text-center space-y-4">
        <Flame className="w-16 h-16 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-muted-foreground">
          {isBn ? 'এই মুহূর্তে কোনো ফ্ল্যাশ সেল নেই' : 'No Active Flash Sales'}
        </h1>
        <p className="text-muted-foreground">
          {isBn ? 'নতুন অফারের জন্য পরে আবার চেক করুন।' : 'Check back later for exciting new offers.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 space-y-12">
      {flashSales.map((sale) => {
        const timeRemaining = formatDistanceToNowStrict(new Date(sale.endDate), {
          locale: isBn ? bn : enUS,
          addSuffix: false
        });

        return (
          <div key={sale.id} className="space-y-6">
            {/* Flash Sale Header/Banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {sale.bannerImage && (
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <CustomImage src={sale.bannerImage} alt={sale.name} fill className="object-cover" />
                </div>
              )}
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <Flame className="w-8 h-8 text-white fill-current" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{sale.name}</h2>
                  <p className="text-white/80 mt-1">
                    {isBn ? 'দারুণ ডিসকাউন্টে কিনে নিন আপনার পছন্দের পণ্য' : 'Grab your favorite products at amazing discounts'}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white/90">
                  <Clock className="w-4 h-4" />
                  <span>{isBn ? 'অফার শেষ হতে বাকি' : 'Ends in'}</span>
                </div>
                <div className="text-2xl font-bold tabular-nums tracking-wider text-yellow-300">
                  {timeRemaining}
                </div>
              </div>
            </div>

            {/* Flash Sale Items */}
            {sale.items && sale.items.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {sale.items.map((item) => {
                  if (!item.sellerProduct) return null;
                  const originalPrice = Number(item.sellerProduct.price);
                  const discountPercentage = Math.round(((originalPrice - item.discountPrice) / originalPrice) * 100);

                  return (
                    <div key={item.id} className="relative">
                      <Badge className="absolute top-2 left-2 z-10 bg-red-600 hover:bg-red-700 text-white shadow-md">
                        -{discountPercentage}%
                      </Badge>
                      <ProductCard product={item.sellerProduct} lang={lang} flashSaleDiscountPrice={item.discountPrice} />
                      <div className="mt-2 text-xs text-muted-foreground px-1">
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                          <div 
                            className="bg-red-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, (item.quantitySold / Math.max(1, item.quantityAvailable + item.quantitySold)) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[10px]">
                          <span>{isBn ? 'বিক্রি হয়েছে' : 'Sold'}: {item.quantitySold}</span>
                          <span>{isBn ? 'বাকি আছে' : 'Available'}: {item.quantityAvailable}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isBn ? 'এই সেলে কোনো পণ্য নেই' : 'No products in this sale yet'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
