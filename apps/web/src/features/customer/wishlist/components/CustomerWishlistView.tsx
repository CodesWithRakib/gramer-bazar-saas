'use client';

import React from 'react';
import Link from 'next/link';
import {
  useGetUserWishlistQuery,
  useRemoveProductFromWishlistMutation,
  WishlistItem,
} from '@/features/wishlists/wishlistsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomImage } from '@/components/ui/CustomImage';
import { Heart, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency } from '@/lib/format';

export interface CustomerWishlistViewProps {
  lang?: string;
}

export function CustomerWishlistView({ lang = 'en' }: CustomerWishlistViewProps) {
  const isBn = lang === 'bn';
  const { data: wishlist, isLoading, isError, refetch } = useGetUserWishlistQuery();

  const header = (
    <PageHeader
      title={isBn ? 'পছন্দের তালিকা' : 'My Wishlist'}
      description={
        isBn
          ? 'পরে কেনার জন্য সংরক্ষণ করা পণ্যসমূহ এখানে পাবেন।'
          : 'Products you saved for later, ready to add to your cart.'
      }
      badge={
        wishlist && wishlist.length > 0 ? (
          <StatusBadge tone="neutral" label={`${wishlist.length} ${isBn ? 'টি পণ্য' : 'saved'}`} />
        ) : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {header}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full space-y-6">
        {header}
        <ErrorState
          isBn={isBn}
          title={isBn ? 'পছন্দের তালিকা লোড করা যায়নি' : 'Failed to load your wishlist'}
          message={
            isBn
              ? 'সার্ভার থেকে তালিকা সংগ্রহ করা যায়নি। একটু পরে আবার চেষ্টা করুন।'
              : 'We could not retrieve your saved items from the server. Please try again.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="w-full space-y-6">
        {header}
        <EmptyState
          icon={<Heart className="w-8 h-8 text-primary" />}
          title={isBn ? 'পছন্দের তালিকা খালি' : 'Your wishlist is empty'}
          description={
            isBn
              ? 'পছন্দের পণ্যে হার্ট আইকনে ক্লিক করে পরে কেনার জন্য সংরক্ষণ করুন।'
              : 'Tap the heart icon on any product to save it here for later.'
          }
          action={{
            label: isBn ? 'পণ্য ব্রাউজ করুন' : 'Browse products',
            href: `/${lang}/categories`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {header}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {wishlist.map((item) => (
          <WishlistCard key={item.id} item={item} lang={lang} isBn={isBn} />
        ))}
      </div>
    </div>
  );
}

function WishlistCard({ item, lang, isBn }: { item: WishlistItem; lang: string; isBn: boolean }) {
  const [removeFromWishlist, { isLoading }] = useRemoveProductFromWishlistMutation();

  const handleRemove = async () => {
    try {
      await removeFromWishlist(item.productId).unwrap();
      toast.success(isBn ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'Removed from wishlist');
    } catch {
      toast.error(
        isBn ? 'সরানো যায়নি। আবার চেষ্টা করুন।' : 'Could not remove the item. Please try again.'
      );
    }
  };

  const name = (isBn ? item.product.nameBn : item.product.nameEn) || item.product.nameEn;
  const rawImage = item.product.images?.[0];
  const image = typeof rawImage === 'string' ? rawImage : rawImage?.url || '/placeholder.jpg';
  const price = Number(item.product.price || 0);
  const compareAtPrice = item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null;
  const isAvailable = item.product.isAvailable ?? true;
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-primary/40">
      <button
        type="button"
        onClick={handleRemove}
        disabled={isLoading}
        aria-label={isBn ? `${name} সরিয়ে ফেলুন` : `Remove ${name} from wishlist`}
        className="absolute end-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-xs backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Link
        href={`/${lang}/products/${item.product.slug}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <CustomImage
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute start-2 top-2 flex flex-col items-start gap-1">
            {!isAvailable ? (
              <StatusBadge tone="danger" label={isBn ? 'স্টক নেই' : 'Out of stock'} />
            ) : discountPercent ? (
              <StatusBadge tone="success" label={`-${discountPercent}%`} />
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3">
          {item.product.category && (
            <span className="mb-0.5 line-clamp-1 text-[11px] text-muted-foreground">
              {isBn ? item.product.category.nameBn : item.product.category.nameEn}
            </span>
          )}
          <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary">
            {name}
          </h3>

          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-base font-bold text-primary">{formatCurrency(price)}</span>
            {compareAtPrice && compareAtPrice > price ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            ) : null}
            {item.product.unit ? (
              <span className="text-[11px] text-muted-foreground">/ {item.product.unit}</span>
            ) : null}
          </div>

          {item.product.averageRating && item.product.averageRating > 0 ? (
            <div className="mt-1 flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{item.product.averageRating.toFixed(1)}</span>
              {item.product.totalReviews ? (
                <span className="text-[10px] text-muted-foreground">
                  ({item.product.totalReviews})
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto pt-3">
            <span className="flex h-9 w-full items-center justify-center rounded-lg border border-input bg-background px-3 text-xs font-medium transition-colors group-hover:border-primary group-hover:text-primary">
              {isBn ? 'বিস্তারিত দেখুন' : 'View details'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
