'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetProductDetailsQuery } from '@/features/catalog/catalogApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Store, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';

import { use } from 'react';

export default function ProductDetailsPage({ params }: { params: Promise<{ lang: string, slug: string }> }) {
  const { lang, slug } = use(params);
  const isBn = lang === 'bn';

  const { data: products, isLoading, isError } = useGetProductDetailsQuery(slug);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{isBn ? 'পণ্য পাওয়া যায়নি' : 'Product not found'}</h1>
        <p className="text-muted-foreground mb-6">
          {isBn ? 'আপনি যে পণ্যটি খুঁজছেন তা বর্তমানে স্টকে নেই বা সরিয়ে নেওয়া হয়েছে।' : 'The product you are looking for is currently out of stock or has been removed.'}
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/${lang}/search`}>{isBn ? 'অন্য পণ্য খুঁজুন' : 'Search other products'}</Link>
          </Button>
          <ProductRequestModal lang={lang} />
        </div>
      </div>
    );
  }

  // We are fetching seller products by the global slug, so we might get multiple offers.
  // For simplicity, we just show the first one, or allow the user to choose.
  const product = products[0];
  const name = isBn ? product.productVariant.nameBn || product.productVariant.product.nameBn : product.productVariant.nameEn || product.productVariant.product.nameEn;
  const image = product.productVariant.images?.[0] || 'https://placehold.co/800x800?text=No+Image';
  const price = Number(product.price);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const isOutOfStock = product.inventory.quantity <= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3 text-muted-foreground">
        <Link href={`/${lang}/search`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isBn ? 'ফিরে যান' : 'Back to Search'}
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
        {/* Image Gallery */}
        <div className="bg-muted rounded-xl overflow-hidden aspect-square flex items-center justify-center p-4">
          <img src={image} alt={name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm text-primary font-medium">
            <Link href={`/${lang}/categories/${product.productVariant.product.category.slug}`} className="hover:underline">
              {isBn ? product.productVariant.product.category.nameBn : product.productVariant.product.category.nameEn}
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{name}</h1>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            {discountPrice ? (
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">৳{discountPrice}</span>
                <span className="text-xl text-muted-foreground line-through mb-1">৳{price}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">৳{price}</span>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-full">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground">{isBn ? 'বিক্রেতা' : 'Seller'}</p>
                <p className="font-medium">{isBn ? product.shop.nameBn : product.shop.nameEn}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-full">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{isBn ? 'খাঁটি পণ্যের নিশ্চয়তা' : 'Authentic Product Guarantee'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-full">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{isBn ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</p>
                <p className="text-muted-foreground">{isBn ? 'খানসামা উপজেলা জুড়ে' : 'Across Khansama Upazila'}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <Button size="lg" className="w-full text-lg h-14 rounded-xl" disabled={isOutOfStock}>
              {isOutOfStock 
                ? (isBn ? 'স্টক শেষ' : 'Out of Stock') 
                : (isBn ? 'কার্টে যোগ করুন' : 'Add to Cart')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
