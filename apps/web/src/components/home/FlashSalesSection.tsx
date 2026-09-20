import React from 'react';
import Link from 'next/link';
import { useGetActiveFlashSalesQuery } from '@/features/flash-sales/flashSalesApi';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Timer, ArrowRight, Zap } from 'lucide-react';

export function FlashSalesSection({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const { data: flashSales, isLoading } = useGetActiveFlashSalesQuery();

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 mt-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!flashSales || flashSales.length === 0) return null;

  const currentSale = flashSales[0]; // Display the first active flash sale

  return (
    <section className="container mx-auto px-4 mt-8 md:mt-12">
      <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-destructive/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-destructive text-destructive-foreground p-2 rounded-xl animate-pulse">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-destructive flex items-center gap-2">
                {isBn ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}
                <span className="text-foreground text-sm font-medium ml-2 opacity-80">- {currentSale.name}</span>
              </h2>
              <div className="flex items-center gap-1.5 text-sm font-medium text-destructive mt-1">
                <Timer className="h-4 w-4" />
                <span>{isBn ? 'সীমিত সময়ের অফার' : 'Limited Time Offer'}</span>
              </div>
            </div>
          </div>
          <Link href={`/${lang}/flash-sale`} className="text-destructive hover:text-destructive/80 font-medium text-sm flex items-center gap-1 transition-colors">
            {isBn ? 'সবগুলো দেখুন' : 'See All'} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {currentSale.items && currentSale.items.length > 0 ? (
          <div className="flex md:grid overflow-x-auto snap-x snap-mandatory md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {currentSale.items.slice(0, 5).map((item) => (
              <div key={item.id} className="min-w-[160px] md:min-w-0 snap-start">
                {item.sellerProduct ? (
                  <ProductCard 
                    product={item.sellerProduct} 
                    lang={lang} 
                    flashSaleDiscountPrice={item.discountPrice}
                  />
                ) : (
                  <div className="h-full bg-muted rounded-xl flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
                    Product Unavailable
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            {isBn ? 'এই মুহূর্তে কোনো পণ্য নেই' : 'No products available right now'}
          </p>
        )}
      </div>
    </section>
  );
}
