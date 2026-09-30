import React from 'react';
import { ProductCard } from './ProductCard';
import type { SellerProduct } from '@/features/catalog/catalogApi';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridProps {
  products?: SellerProduct[];
  isLoading: boolean;
  lang: string;
}

export function ProductGrid({ products, isLoading, lang }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3 w-full min-w-0 max-w-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col h-full bg-card border border-border/50 rounded-xl overflow-hidden min-w-0 w-full"
          >
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-2 sm:p-2.5 flex flex-col flex-grow gap-1.5 min-w-0">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3.5 w-full" />
              <div className="mt-auto pt-2 space-y-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-7 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null; // Empty state will be handled by the parent
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3 w-full min-w-0 max-w-full">
      {products.map((product) => (
        <div key={product.id} className="min-w-0 w-full flex flex-col">
          <ProductCard product={product} lang={lang} />
        </div>
      ))}
    </div>
  );
}
