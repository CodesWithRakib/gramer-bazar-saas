'use client';

import React, { use, useState } from 'react';
import { useGetShopsQuery } from '@/features/shops/shopsApi';
import { Card, CardContent,  } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Store, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ShopsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: shops, isLoading } = useGetShopsQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShops = shops?.filter(shop => {
    if (!shop.isActive) return false;
    const searchLower = searchTerm.toLowerCase();
    const nameEnMatch = shop.nameEn.toLowerCase().includes(searchLower);
    const nameBnMatch = shop.nameBn.toLowerCase().includes(searchLower);
    return nameEnMatch || nameBnMatch;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isBn ? 'ভেরিফাইড দোকান সমূহ' : 'Verified Shops'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isBn 
              ? 'গ্রামের বাজারের সব বিশ্বস্ত বিক্রেতাদের খুঁজুন' 
              : 'Discover all trusted sellers on Gramer Bazar'}
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Input 
            type="search"
            placeholder={isBn ? 'দোকান খুঁজুন...' : 'Search shops...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-t-xl" />
              <CardContent className="p-4 pt-12 relative">
                <div className="absolute -top-10 left-4 w-16 h-16 bg-background rounded-full border-4 border-background overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full bg-muted" />
                </div>
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="h-9 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredShops?.length === 0 ? (
        <div className="text-center py-16 px-4 bg-muted/20 rounded-xl border border-dashed">
          <Store className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isBn ? 'কোন দোকান পাওয়া যায়নি' : 'No shops found'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {isBn 
              ? 'আপনার খোঁজা নামের সাথে মিলিয়ে কোন দোকান পাওয়া যায়নি। অনুগ্রহ করে অন্য নাম দিয়ে চেষ্টা করুন।' 
              : 'No shops match your search criteria. Please try a different name.'}
          </p>
          {searchTerm && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>
              {isBn ? 'সব দোকান দেখুন' : 'View all shops'}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredShops?.map((shop) => (
            <Card key={shop.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="h-32 relative bg-primary/10 overflow-hidden">
                {shop.banner ? (
                  <Image 
                    src={shop.banner} 
                    alt={isBn ? shop.nameBn : shop.nameEn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                    <Store className="h-12 w-12 text-primary/40" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4 pt-10 relative">
                <div className="absolute -top-10 left-4 w-16 h-16 bg-background rounded-full border-4 border-background overflow-hidden flex items-center justify-center shadow-sm">
                  {shop.logo ? (
                    <Image 
                      src={shop.logo} 
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      {shop.nameEn.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1 flex items-center gap-1">
                    {isBn ? shop.nameBn : shop.nameEn}
                    {shop.isVerified && (
                      <CheckCircle className="h-4 w-4 text-blue-500 shrink-0" />
                    )}
                  </h3>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                  {shop.description || (isBn ? 'কোন বিবরণ নেই' : 'No description available')}
                </p>
                
                <Button asChild className="w-full group-hover:bg-primary" variant="outline">
                  <Link href={`/${lang}/shops/${shop.id}`}>
                    {isBn ? 'দোকান দেখুন' : 'Visit Shop'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
