'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  useGetUserWishlistQuery,
  useRemoveProductFromWishlistMutation,
  WishlistItem,
} from '@/features/wishlists/wishlistsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomImage } from '@/components/ui/CustomImage';
import { Loader2, Heart, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

export interface CustomerWishlistViewProps {
  lang?: string;
}

export function CustomerWishlistView({ lang = 'en' }: CustomerWishlistViewProps) {
  const isBn = lang === 'bn';
  const { data: wishlist, isLoading } = useGetUserWishlistQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary fill-primary/20" />
          {isBn ? 'আমার উইশলিস্ট' : 'My Wishlist'}
        </CardTitle>
        <CardDescription>
          {isBn ? 'আপনার সংরক্ষিত পছন্দের পণ্যসমূহ' : 'Your saved favorite products'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!wishlist || wishlist.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {isBn ? 'আপনার উইশলিস্ট খালি' : 'Your wishlist is empty'}
            </h3>
            <p className="text-muted-foreground">
              {isBn ? 'পছন্দের পণ্য সংরক্ষণ করতে হার্ট আইকনে ক্লিক করুন' : 'Click the heart icon to save products you like'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlist.map((item) => (
              <WishlistCard key={item.id} item={item} lang={lang} isBn={isBn} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WishlistCard({ item, lang, isBn }: { item: WishlistItem; lang: string; isBn: boolean }) {
  const [removeFromWishlist, { isLoading }] = useRemoveProductFromWishlistMutation();

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    try {
      await removeFromWishlist(item.productId).unwrap();
      toast.success(isBn ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
    } catch {
      toast.error(isBn ? 'একটি ত্রুটি হয়েছে' : 'An error occurred');
    }
  };

  const name = isBn ? item.product.nameBn : item.product.nameEn;
  const rawImage = item.product.images?.[0];
  const image = typeof rawImage === 'string' ? rawImage : rawImage?.url || '/placeholder.jpg';
  const price = Number(item.product.price || 0);
  const compareAtPrice = item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null;
  const isAvailable = item.product.isAvailable ?? true;
  
  return (
    <Link href={`/${lang}/products/${item.product.slug}`} className="group bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full relative">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <CustomImage 
          src={image} 
          alt={name} 
          fill 
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!isAvailable ? (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 shadow-xs">
              {isBn ? 'স্টক নেই' : 'Out of Stock'}
            </Badge>
          ) : compareAtPrice && compareAtPrice > price ? (
            <Badge className="bg-emerald-600 text-[10px] px-1.5 py-0.5 shadow-xs">
              {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% {isBn ? 'ছাড়' : 'OFF'}
            </Badge>
          ) : null}
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleRemove}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        {item.product.category && (
          <span className="text-[11px] text-muted-foreground line-clamp-1 mb-0.5">
            {isBn ? item.product.category.nameBn : item.product.category.nameEn}
          </span>
        )}
        <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price & Unit */}
        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          {price > 0 ? (
            <span className="font-bold text-base text-primary">
              ৳{price}
            </span>
          ) : null}
          {compareAtPrice && compareAtPrice > price ? (
            <span className="text-xs text-muted-foreground line-through">
              ৳{compareAtPrice}
            </span>
          ) : null}
          {item.product.unit ? (
            <span className="text-[11px] text-muted-foreground">
              / {item.product.unit}
            </span>
          ) : null}
        </div>

        {/* Rating */}
        {item.product.averageRating && item.product.averageRating > 0 ? (
          <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium">{item.product.averageRating.toFixed(1)}</span>
            {item.product.totalReviews ? (
              <span className="text-[10px] text-muted-foreground">({item.product.totalReviews})</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto pt-3">
          <Button variant="outline" size="sm" className="w-full text-xs" asChild>
            <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
