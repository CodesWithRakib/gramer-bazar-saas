import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SellerProduct } from '@/features/catalog/catalogApi';

interface ProductCardProps {
  product: SellerProduct;
  lang: string;
}

export function ProductCard({ product, lang }: ProductCardProps) {
  const name = lang === 'bn' ? product.productVariant.nameBn || product.productVariant.product.nameBn : product.productVariant.nameEn || product.productVariant.product.nameEn;
  const image = product.productVariant.images?.[0] || 'https://placehold.co/400x400?text=No+Image';
  const price = Number(product.price);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const slug = product.productVariant.product.slug;

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/${lang}/products/${slug}`} className="block relative pt-[100%] overflow-hidden bg-muted">
        {/* Using standard img instead of Next Image for simplicity with dynamic urls for now */}
        <img 
          src={image} 
          alt={name} 
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform hover:scale-105"
          loading="lazy"
        />
      </Link>
      <CardContent className="p-4 flex-grow flex flex-col">
        <Link href={`/${lang}/products/${slug}`} className="line-clamp-2 text-sm font-medium hover:underline mb-2">
          {name}
        </Link>
        <div className="mt-auto">
          {discountPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">৳{discountPrice}</span>
              <span className="text-sm text-muted-foreground line-through">৳{price}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-primary">৳{price}</span>
          )}
          <p className="text-xs text-muted-foreground mt-1">Shop: {lang === 'bn' ? product.shop.nameBn : product.shop.nameEn}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" disabled={product.inventory.quantity <= 0}>
          {product.inventory.quantity > 0 ? (lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart') : (lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock')}
        </Button>
      </CardFooter>
    </Card>
  );
}
