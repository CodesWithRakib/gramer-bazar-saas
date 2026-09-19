'use client';

import React, { use } from 'react';
import { useGetShopByIdQuery } from '@/features/shops/shopsApi';
import { useSearchProductsQuery } from '@/features/catalog/catalogApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, CheckCircle, MapPin, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ShopProfilePage({ 
  params 
}: { 
  params: Promise<{ lang: string; id: string }> 
}) {
  const { lang, id } = use(params);
  const isBn = lang === 'bn';
  
  const { data: shop, isLoading: isShopLoading } = useGetShopByIdQuery(id);
  
  // We use search products query with sellerId to get shop's products
  const { data: shopProducts, isLoading: isProductsLoading } = useSearchProductsQuery({
    sellerId: shop?.sellerId,
    limit: 20
  }, { skip: !shop?.sellerId });

  if (isShopLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-muted rounded-2xl mb-8" />
        <div className="h-8 bg-muted w-1/3 rounded mb-4" />
        <div className="h-4 bg-muted w-2/3 rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Store className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold mb-2">
          {isBn ? 'দোকানটি পাওয়া যায়নি' : 'Shop not found'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isBn 
            ? 'আপনি যে দোকানটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা বর্তমানে বন্ধ আছে।' 
            : 'The shop you are looking for has been removed or is currently inactive.'}
        </p>
        <Button asChild>
          <Link href={`/${lang}/shops`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isBn ? 'সব দোকানে ফিরে যান' : 'Back to all shops'}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <div className="relative h-48 md:h-72 bg-primary/10">
        {shop.banner ? (
          <Image 
            src={shop.banner} 
            alt="Shop Banner"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-400 opacity-20" />
        )}
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="relative -mt-16 md:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 pb-6 border-b">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-background rounded-2xl border-4 border-background overflow-hidden flex items-center justify-center shadow-md shrink-0 relative z-10">
            {shop.logo ? (
              <Image 
                src={shop.logo} 
                alt="Shop Logo"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-5xl font-bold">
                {shop.nameEn.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
            <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start gap-2">
              {isBn ? shop.nameBn : shop.nameEn}
              {shop.isVerified && (
                <CheckCircle className="h-6 w-6 text-blue-500 shrink-0" />
              )}
            </h1>
            
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto md:mx-0">
              {shop.description || (isBn ? 'এই দোকানের কোন বিবরণ দেওয়া নেই।' : 'No description provided for this shop.')}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
              <Badge variant="secondary" className="flex items-center gap-1 py-1">
                <Store className="h-3 w-3" />
                {isBn ? 'ভেরিফাইড সেলার' : 'Verified Seller'}
              </Badge>
              {shop.seller?.phone && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {shop.seller.phone}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Button className="flex-1 md:flex-none">
              <MessageSquare className="h-4 w-4 mr-2" />
              {isBn ? 'মেসেজ দিন' : 'Message'}
            </Button>
          </div>
        </div>

        {/* Shop Products Section */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isBn ? 'দোকানের সকল পণ্য' : 'All Shop Products'}
            </h2>
            <Badge variant="outline" className="text-base">
              {shopProducts?.meta?.total || 0} {isBn ? 'পণ্য' : 'Items'}
            </Badge>
          </div>
          
          {isProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : shopProducts?.data?.length === 0 ? (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-xl border border-dashed">
              <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isBn ? 'কোন পণ্য নেই' : 'No products found'}
              </h3>
              <p className="text-muted-foreground">
                {isBn 
                  ? 'এই দোকানটি এখনও কোন পণ্য যোগ করেনি।' 
                  : 'This shop has not added any products yet.'}
              </p>
            </div>
          ) : (
            <ProductGrid 
              products={shopProducts?.data || []} 
              isLoading={false} 
              lang={lang} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PackageIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
