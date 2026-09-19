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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex flex-col h-full bg-card border border-border/50 rounded-xl overflow-hidden">
          <Skeleton className="h-[150px] md:h-[200px] w-full rounded-none" />
          <div className="p-4 flex flex-col flex-grow gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-auto pt-4">
              <Skeleton className="h-9 w-full rounded-md" />
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} lang={lang} />
      ))}
    </div>
  );
}
