'use client';

import React, { use, useState } from 'react';
import { useGetShopsQuery } from '@/features/shops/shopsApi';
import { Card, CardContent,  } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Store, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ShopCard } from '@/components/catalog/ShopCard';

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
            <ShopCard key={shop.id} shop={shop} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
