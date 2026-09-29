'use client';

import React from 'react';
import Link from 'next/link';
import { CustomImage } from '@/components/ui/CustomImage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, CheckCircle, ChevronRight, Star, Package } from 'lucide-react';

/**
 * Minimal shape ShopCard needs. Both the full `Shop` entity and the lighter
 * homepage endpoint payload are assignable to it, so callers never need casts.
 */
export interface ShopCardData {
  id: string;
  nameEn: string;
  nameBn: string;
  shortDescription?: string | null;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  isVerified?: boolean;
  productCount?: number;
  averageRating?: number;
}

export interface ShopCardProps {
  shop: ShopCardData;
  lang: string;
}

export function ShopCard({ shop, lang }: ShopCardProps) {
  const isBn = lang === 'bn';
  const name = (isBn ? shop.nameBn : shop.nameEn) || shop.nameEn || shop.nameBn;
  const description =
    shop.description ||
    shop.shortDescription ||
    (isBn ? 'বিবরণ এখনো যোগ করা হয়নি' : 'No description available');

  return (
    <Card className="group overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-300 bg-card border-border/70 flex flex-col h-full">
      {/* Banner / Storefront Header */}
      <div className="h-32 relative bg-primary/10 overflow-hidden shrink-0">
        {shop.banner ? (
          <CustomImage
            src={shop.banner}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <Store className="h-10 w-10 text-primary/40" />
          </div>
        )}

        {/* Verification Pill */}
        {shop.isVerified && (
          <div className="absolute top-2.5 right-2.5 z-10 rtl:right-auto rtl:left-2.5">
            <Badge variant="success" className="gap-1 text-[10px] px-2 py-0.5 shadow-xs">
              <CheckCircle className="h-3 w-3" />
              <span>{isBn ? 'ভেরিফাইড' : 'Verified'}</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="p-4 pt-10 relative flex-1 flex flex-col justify-between">
        {/* Logo Avatar */}
        <div className="absolute -top-10 left-4 rtl:left-auto rtl:right-4 w-16 h-16 bg-background rounded-full border-4 border-background overflow-hidden flex items-center justify-center shadow-md">
          {shop.logo ? (
            <CustomImage src={shop.logo} alt={`${name} logo`} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
              {(shop.nameEn || shop.nameBn || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div>
          {/* Shop Name */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <h3 className="font-bold text-base md:text-lg leading-snug line-clamp-1 text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
          </div>

          {/* Quick Metrics (Rating & Products) */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {shop.averageRating !== undefined && shop.averageRating > 0 && (
              <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{shop.averageRating.toFixed(1)}</span>
              </span>
            )}
            {shop.productCount !== undefined && (
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {shop.productCount} {isBn ? 'টি পণ্য' : 'products'}
                </span>
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <Button
          asChild
          variant="outline"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 mt-auto"
        >
          <Link href={`/${lang}/shops/${shop.id}`}>
            <span>{isBn ? 'দোকান দেখুন' : 'Visit Shop'}</span>
            <ChevronRight className="h-4 w-4 ms-1.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
