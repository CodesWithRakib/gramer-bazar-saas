'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { SellerProduct } from '@/features/catalog/catalogApi';

interface ProductCardProps {
  product: SellerProduct;
  lang: string;
}

export function ProductCard({ product, lang }: ProductCardProps) {
  const dispatch = useDispatch();
  const name = lang === 'bn' ? product.productVariant.nameBn || product.productVariant.product.nameBn : product.productVariant.nameEn || product.productVariant.product.nameEn;
  const image = product.productVariant.images?.[0] || 'https://placehold.co/400x400?text=No+Image';
  const price = Number(product.price);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const slug = product.productVariant.product.slug;
  const currentPrice = discountPrice ?? price;

  const handleAddToCart = () => {
    dispatch(addToCart({
      sellerProductId: product.id,
      nameEn: product.productVariant.nameEn || product.productVariant.product.nameEn,
      nameBn: product.productVariant.nameBn || product.productVariant.product.nameBn,
      price: currentPrice,
      quantity: 1,
      image,
      maxQuantity: product.inventory.quantity,
    }));
    toast.success(lang === 'bn' ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border-border bg-card">
      <Link href={`/${lang}/products/${slug}`} className="block relative pt-[100%] overflow-hidden bg-muted/20">
        <Image 
          src={image} 
          alt={name} 
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {discountPrice && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-sm z-10 shadow-sm uppercase tracking-wider">
            {lang === 'bn' ? 'ছাড়' : 'Sale'}
          </div>
        )}
      </Link>
      <CardContent className="p-4 flex-grow flex flex-col">
        <Link href={`/${lang}/products/${slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary transition-colors mb-2">
          {name}
        </Link>
        <div className="mt-auto">
          {discountPrice ? (
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-base md:text-lg font-bold text-primary">৳{discountPrice}</span>
              <span className="text-xs text-muted-foreground line-through">৳{price}</span>
            </div>
          ) : (
            <span className="text-base md:text-lg font-bold text-foreground">৳{price}</span>
          )}
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">
            {lang === 'bn' ? 'দোকান: ' : 'Shop: '}
            <span className="font-medium text-foreground/80">{lang === 'bn' ? product.shop.nameBn : product.shop.nameEn}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full group-hover:bg-primary/90 transition-colors" 
          disabled={product.inventory.quantity <= 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.inventory.quantity > 0 ? (lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart') : (lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock')}
        </Button>
      </CardFooter>
    </Card>
  );
}
