'use client';

import React from 'react';
import Link from 'next/link';
import { CustomImage } from '@/components/ui/CustomImage';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star, Store } from 'lucide-react';
import type { SellerProduct } from '@/features/catalog/catalogApi';
import { RootState } from '@/store/store';
import {
  useGetUserWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} from '@/features/wishlists/wishlistsApi';

interface ProductCardProps {
  product: SellerProduct;
  lang: string;
  flashSaleDiscountPrice?: number;
}

export function ProductCard({ product, lang, flashSaleDiscountPrice }: ProductCardProps) {
  const dispatch = useDispatch();
  const isBn = lang === 'bn';

  // Always prioritize the product's actual title over generic variant names like "Standard" / "স্ট্যান্ডার্ড"
  const productName = isBn
    ? product.productVariant.product.nameBn
    : product.productVariant.product.nameEn;
  const variantName = isBn
    ? product.productVariant.nameBn
    : product.productVariant.nameEn;
  const hasDistinctVariant =
    variantName &&
    variantName.toLowerCase() !== 'standard' &&
    variantName.toLowerCase() !== 'default' &&
    variantName !== 'স্ট্যান্ডার্ড' &&
    variantName !== 'ডিফল্ট' &&
    variantName !== productName;
  const displayName = hasDistinctVariant ? `${productName} (${variantName})` : productName;

  const image = product.productVariant.images?.[0] || '/placeholder.jpg';
  const slug = product.productVariant.product.slug;
  const productId = product.productVariant.product.id;
  const unit = product.productVariant.product.unit;
  const stock = product.inventory?.quantity ?? 0;
  const isOutOfStock = stock <= 0;

  // Resolve prices safely: regular price vs discounted selling price
  const rawPrice = Number(product.price);
  const rawDiscount = product.discountPrice ? Number(product.discountPrice) : null;
  const compareAt = product.productVariant?.product?.compareAtPrice
    ? Number(product.productVariant.product.compareAtPrice)
    : null;

  let currentPrice = rawPrice;
  let originalPrice: number | null = null;

  if (flashSaleDiscountPrice) {
    currentPrice = Number(flashSaleDiscountPrice);
    originalPrice = rawPrice;
  } else if (rawDiscount && rawDiscount < rawPrice) {
    currentPrice = rawDiscount;
    originalPrice = rawPrice;
  } else if (compareAt && compareAt > rawPrice) {
    currentPrice = rawPrice;
    originalPrice = compareAt;
  } else if (rawDiscount && rawDiscount > rawPrice) {
    currentPrice = rawPrice;
    originalPrice = rawDiscount;
  }

  const discountPercent =
    originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : null;

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: wishlist } = useGetUserWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addToWishlist, { isLoading: isAddingWishlist }] = useAddProductToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] =
    useRemoveProductFromWishlistMutation();

  const isWishlisted = wishlist?.some((item) => item.productId === productId);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(isBn ? 'দয়া করে লগইন করুন' : 'Please login first');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId).unwrap();
        toast.success(isBn ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(productId).unwrap();
        toast.success(isBn ? 'উইশলিস্টে যোগ করা হয়েছে' : 'Added to wishlist');
      }
    } catch {
      toast.error(isBn ? 'একটি ত্রুটি হয়েছে' : 'An error occurred');
    }
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        sellerProductId: product.id,
        nameEn: product.productVariant.nameEn || product.productVariant.product.nameEn,
        nameBn: product.productVariant.nameBn || product.productVariant.product.nameBn,
        price: currentPrice,
        quantity: 1,
        image,
        maxQuantity: stock,
      })
    );
    toast.success(isBn ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
  };

  const avgRating = product.productVariant.product.averageRating || 0;
  const totalReviews = product.productVariant.product.totalReviews || 0;
  const brandName = isBn
    ? product.productVariant.product.brand?.nameBn
    : product.productVariant.product.brand?.nameEn;
  const shopName = isBn ? product.shop.nameBn : product.shop.nameEn;

  return (
    <Card className="h-full flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
      {/* Product Image Container */}
      <Link
        href={`/${lang}/products/${slug}`}
        className="block relative aspect-square overflow-hidden bg-muted/20"
      >
        <CustomImage
          src={image}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {discountPercent !== null && discountPercent > 0 && !isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 bg-destructive text-destructive-foreground text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-sm z-10">
            -{discountPercent}%
          </div>
        )}

        {/* Out of Stock Overlay Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-zinc-900/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {isBn ? 'স্টক শেষ' : 'Out of Stock'}
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleWishlist}
          disabled={isAddingWishlist || isRemovingWishlist}
          className="absolute top-2.5 right-2.5 h-8 w-8 bg-background/90 hover:bg-background shadow-xs z-10 rounded-full transition-all opacity-80 group-hover:opacity-100"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-foreground/70'}`}
          />
        </Button>
      </Link>

      {/* Product Details Content */}
      <CardContent className="p-3.5 flex-grow flex flex-col">
        {/* Brand */}
        {brandName && (
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1 truncate">
            {brandName}
          </span>
        )}

        {/* Product Title */}
        <Link
          href={`/${lang}/products/${slug}`}
          className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug mb-1.5"
          title={displayName}
        >
          {displayName}
        </Link>

        {/* Ratings & Reviews */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center text-amber-500">
            <Star className={`h-3 w-3 ${avgRating > 0 ? 'fill-current' : 'text-muted-foreground/30'}`} />
          </div>
          <span className="text-xs font-semibold text-foreground">
            {avgRating > 0 ? avgRating.toFixed(1) : (isBn ? 'নতুন' : 'New')}
          </span>
          {totalReviews > 0 && (
            <span className="text-[10px] text-muted-foreground">({totalReviews})</span>
          )}
        </div>

        {/* Price & Shop Section */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="text-base md:text-lg font-bold text-primary">৳{currentPrice}</span>
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-xs text-muted-foreground line-through">৳{originalPrice}</span>
            )}
            {unit && <span className="text-xs text-muted-foreground">/ {unit}</span>}
          </div>

          {/* Shop */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 truncate">
            <Store className="h-3 w-3 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{shopName}</span>
          </div>
        </div>
      </CardContent>

      {/* Footer Add to Cart Button */}
      <CardFooter className="p-3.5 pt-0">
        <Button
          className="w-full h-9 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          {isOutOfStock ? (isBn ? 'স্টক শেষ' : 'Out of Stock') : isBn ? 'কার্টে যোগ করুন' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
