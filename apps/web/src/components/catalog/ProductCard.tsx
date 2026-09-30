'use client';

import React from 'react';
import Link from 'next/link';
import { CustomImage } from '@/components/ui/CustomImage';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { customToast as toast } from '@/components/ui/custom-toast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Heart,
  Star,
  Store,
  Sparkles,
  ShieldCheck,
  Zap,
  Tag,
  Leaf,
  Fish,
  Flame,
  Droplets,
  Wheat,
  Shirt,
  Utensils,
} from 'lucide-react';
import type { SellerProduct } from '@/features/catalog/catalogApi';
import { RootState } from '@/store/store';
import { setLoginModalOpen } from '@/store/slices/authSlice';
import { getUserRoles } from '@/lib/roles';
import {
  useGetUserWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} from '@/features/wishlists/wishlistsApi';
import { formatCurrency } from '@/lib/format';

interface ProductCardProps {
  product: SellerProduct;
  lang: string;
  flashSaleDiscountPrice?: number;
}

function getCategoryTheme(
  categorySlug: string,
  subCategorySlug: string,
  productName: string,
  isBn: boolean
) {
  const combined = `${categorySlug} ${subCategorySlug} ${productName}`.toLowerCase();

  // Fish & Seafood
  if (
    combined.includes('fish') ||
    combined.includes('মাছ') ||
    combined.includes('রুই') ||
    combined.includes('কাতল') ||
    combined.includes('ইলিশ')
  ) {
    return {
      type: 'fish',
      label: isBn ? 'তাজা মাছ' : 'Fresh Fish',
      badgeClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'fish',
    };
  }

  // Meat & Poultry
  if (
    combined.includes('meat') ||
    combined.includes('chicken') ||
    combined.includes('beef') ||
    combined.includes('মাংস') ||
    combined.includes('মুরগি') ||
    combined.includes('গরু')
  ) {
    return {
      type: 'meat',
      label: isBn ? 'দেশি মাংস' : 'Fresh Meat',
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'flame',
    };
  }

  // Fruits
  if (
    combined.includes('fruit') ||
    combined.includes('ফল') ||
    combined.includes('আম') ||
    combined.includes('কলা') ||
    combined.includes('আপেল')
  ) {
    return {
      type: 'fruits',
      label: isBn ? 'তাজা ফল' : 'Fresh Fruits',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'sparkles',
    };
  }

  // Spices & Condiments
  if (
    combined.includes('spice') ||
    combined.includes('মসলা') ||
    combined.includes('জিরা') ||
    combined.includes('হলুদ')
  ) {
    return {
      type: 'spices',
      label: isBn ? 'খাঁটি মসলা' : 'Pure Spices',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'sparkles',
    };
  }

  // Fresh Vegetables & Greens
  if (
    combined.includes('vegetable') ||
    combined.includes('সবজি') ||
    combined.includes('শাক') ||
    combined.includes('আলু') ||
    combined.includes('টমেটো')
  ) {
    return {
      type: 'vegetables',
      label: isBn ? 'টাটকা সবজি' : 'Fresh Vegetables',
      badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'leaf',
    };
  }

  // Pure Oils, Ghee & Honey
  if (
    combined.includes('oil') ||
    combined.includes('ghee') ||
    combined.includes('তেল') ||
    combined.includes('ঘি') ||
    combined.includes('honey') ||
    combined.includes('মধু')
  ) {
    return {
      type: 'oil',
      label: isBn ? 'খাঁটি প্রাকৃতিক' : 'Pure Organic',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'droplets',
    };
  }

  // Grains, Rice, Pulses
  if (
    combined.includes('rice') ||
    combined.includes('dal') ||
    combined.includes('grain') ||
    combined.includes('চাল') ||
    combined.includes('ডাল')
  ) {
    return {
      type: 'grains',
      label: isBn ? 'খাদ্যশস্য' : 'Grains & Rice',
      badgeClass: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'wheat',
    };
  }

  // Electronics & Gadgets
  if (
    combined.includes('electron') ||
    combined.includes('mobile') ||
    combined.includes('gadget') ||
    combined.includes('ফোন')
  ) {
    return {
      type: 'electronics',
      label: isBn ? 'অফিশিয়াল' : 'Official',
      badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'shieldCheck',
    };
  }

  // Fashion & Apparel
  if (
    combined.includes('cloth') ||
    combined.includes('fashion') ||
    combined.includes('wear') ||
    combined.includes('পোশাক')
  ) {
    return {
      type: 'fashion',
      label: isBn ? 'ফ্যাশন' : 'Fashion',
      badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
      accentBorder: 'hover:border-primary/50',
      icon: 'shirt',
    };
  }

  return {
    type: 'general',
    label: '',
    badgeClass: 'bg-muted text-muted-foreground border-border/60',
    accentBorder: 'hover:border-primary/50',
    icon: 'sparkles',
  };
}

function formatUnit(unit: string | undefined, isBn: boolean): string {
  if (!unit) return '';
  if (!isBn) return unit;
  const lower = unit.toLowerCase().trim();
  const unitMap: Record<string, string> = {
    kg: 'কেজি',
    gm: 'গ্রাম',
    g: 'গ্রাম',
    gram: 'গ্রাম',
    liter: 'লিটার',
    litre: 'লিটার',
    l: 'লিটার',
    ml: 'মি.লি.',
    pack: 'প্যাক',
    packet: 'প্যাকেট',
    bundle: 'আঁটি',
    piece: 'পিস',
    pcs: 'পিস',
    pc: 'পিস',
    jar: 'জার',
    box: 'বক্স',
    dozen: 'ডজন',
  };
  return unitMap[lower] || unit;
}

export function ProductCard({ product, lang, flashSaleDiscountPrice }: ProductCardProps) {
  const dispatch = useDispatch();
  const isBn = lang === 'bn';

  const productData = product.productVariant?.product;
  const productName = isBn ? productData?.nameBn || productData?.nameEn : productData?.nameEn;
  const variantName = isBn
    ? product.productVariant?.nameBn || product.productVariant?.nameEn
    : product.productVariant?.nameEn;

  const hasDistinctVariant =
    variantName &&
    variantName.toLowerCase() !== 'standard' &&
    variantName.toLowerCase() !== 'default' &&
    variantName !== 'স্ট্যান্ডার্ড' &&
    variantName !== 'ডিফল্ট' &&
    variantName !== productName;
  const displayName = hasDistinctVariant ? `${productName} (${variantName})` : productName || '';

  const image = product.productVariant?.images?.[0] || '/placeholder.jpg';
  const slug = productData?.slug || '';
  const productId = productData?.id || '';
  const rawUnit = productData?.unit || '';
  const formattedUnit = formatUnit(rawUnit, isBn);
  const stock = product.inventory?.quantity ?? 0;
  const isOutOfStock = stock <= 0;

  // Category theme resolution
  const categorySlug = productData?.category?.slug || '';
  const subCategorySlug = productData?.subCategory?.slug || '';
  const categoryTheme = getCategoryTheme(
    categorySlug,
    subCategorySlug,
    `${productData?.nameEn || ''} ${productData?.nameBn || ''}`,
    isBn
  );

  // Fallback badge text if general
  const categoryBadgeLabel =
    categoryTheme.label ||
    (productData?.subCategory
      ? isBn
        ? productData.subCategory.nameBn
        : productData.subCategory.nameEn
      : productData?.category
        ? isBn
          ? productData.category.nameBn
          : productData.category.nameEn
        : '');

  // Resolve prices
  const rawPrice = Number(product.price);
  const rawDiscount = product.discountPrice ? Number(product.discountPrice) : null;
  const compareAt = productData?.compareAtPrice ? Number(productData.compareAtPrice) : null;

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

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const userRoles = getUserRoles(user);
  const isStaffOrSeller = userRoles.some((r) =>
    ['SELLER', 'RIDER', 'ADMIN', 'SUPER_ADMIN'].includes(r)
  );

  const { data: wishlist } = useGetUserWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToWishlist, { isLoading: isAddingWishlist }] = useAddProductToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] =
    useRemoveProductFromWishlistMutation();

  const isWishlisted = wishlist?.some((item) => item.productId === productId);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info(isBn ? 'দয়া করে গ্রাহক হিসেবে লগইন করুন' : 'Please login to save favorites');
      dispatch(setLoginModalOpen(true));
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
    if (isStaffOrSeller) {
      toast.info(
        isBn
          ? 'কার্ট ও পণ্য ক্রয় শুধুমাত্র কাস্টমার অ্যাকাউন্টের জন্য প্রযোজ্য।'
          : 'Shopping and cart actions are reserved for customer accounts.'
      );
      return;
    }
    if (!isAuthenticated) {
      toast.info(
        isBn
          ? 'কার্টে যোগ করতে অনুগ্রহ করে লগইন করুন'
          : 'Please login as a customer to add items to cart'
      );
      dispatch(setLoginModalOpen(true));
      return;
    }
    dispatch(
      addToCart({
        sellerProductId: product.id,
        nameEn: product.productVariant?.nameEn || productData?.nameEn || '',
        nameBn: product.productVariant?.nameBn || productData?.nameBn || '',
        price: currentPrice,
        quantity: 1,
        image,
        maxQuantity: stock,
        slug: productData?.slug || product.productVariant?.product?.slug,
      })
    );
    toast.success(isBn ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
  };

  const avgRating = productData?.averageRating || 0;
  const totalReviews = productData?.totalReviews || 0;
  const brandName = isBn
    ? productData?.brand?.nameBn || productData?.brand?.nameEn
    : productData?.brand?.nameEn;
  const shopName = isBn ? product.shop?.nameBn || product.shop?.nameEn : product.shop?.nameEn;

  const renderCategoryIcon = () => {
    switch (categoryTheme.icon) {
      case 'fish':
        return <Fish className="w-2.5 h-2.5" />;
      case 'flame':
        return <Flame className="w-2.5 h-2.5" />;
      case 'leaf':
        return <Leaf className="w-2.5 h-2.5" />;
      case 'droplets':
        return <Droplets className="w-2.5 h-2.5" />;
      case 'wheat':
        return <Wheat className="w-2.5 h-2.5" />;
      case 'shirt':
        return <Shirt className="w-2.5 h-2.5" />;
      case 'utensils':
        return <Utensils className="w-2.5 h-2.5" />;
      case 'shieldCheck':
        return <ShieldCheck className="w-2.5 h-2.5" />;
      case 'zap':
        return <Zap className="w-2.5 h-2.5" />;
      default:
        return <Sparkles className="w-2.5 h-2.5" />;
    }
  };

  return (
    <Card
      className={`h-full flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card ${categoryTheme.accentBorder} hover:shadow-md transition-all duration-200 group relative w-full min-w-0 max-w-full`}
    >
      {/* Product Image Container */}
      <Link
        href={`/${lang}/products/${slug}`}
        className="block relative aspect-square overflow-hidden bg-muted/20"
      >
        <CustomImage
          src={image}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2 start-2 flex flex-col gap-1 z-10">
          {discountPercent !== null && discountPercent > 0 && !isOutOfStock && (
            <div className="bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs tracking-tight">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-zinc-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
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
          className="absolute top-1.5 end-1.5 h-6.5 w-6.5 sm:h-7 sm:w-7 bg-background/90 hover:bg-background shadow-xs z-10 rounded-full transition-all opacity-85 group-hover:opacity-100"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-foreground/70'}`}
          />
        </Button>

        {/* Unit Tag on Image */}
        {formattedUnit && (
          <div className="absolute bottom-1.5 start-1.5 bg-black/60 backdrop-blur-xs text-[9px] sm:text-[10px] font-semibold text-white px-1.5 py-0.5 rounded shadow-xs z-10">
            {formattedUnit}
          </div>
        )}
      </Link>

      {/* Product Details Content */}
      <CardContent className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0 flex flex-col">
          {/* Row 1: Brand / Category on Left, Star Rating OR New Badge on Right */}
          <div className="h-4 min-h-[1rem] flex items-center justify-between gap-1 mb-1">
            {brandName ? (
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate">
                {brandName}
              </span>
            ) : categoryBadgeLabel ? (
              <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate flex items-center gap-0.5 font-medium">
                {renderCategoryIcon()}
                <span className="truncate">{categoryBadgeLabel}</span>
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] text-muted-foreground/70">
                {isBn ? 'খাঁটি পণ্য' : 'Local Item'}
              </span>
            )}

            {/* Rating OR New Pill */}
            {avgRating > 0 ? (
              <div className="flex items-center text-amber-500 text-[9px] sm:text-[10px] font-semibold gap-0.5 shrink-0">
                <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                <span>{avgRating.toFixed(1)}</span>
                {totalReviews > 0 && (
                  <span className="text-muted-foreground text-[8px] sm:text-[9px]">({totalReviews})</span>
                )}
              </div>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.2 rounded-full shrink-0">
                {isBn ? 'নতুন' : 'New'}
              </span>
            )}
          </div>

          {/* Row 2: Product Title (Compact h-7 sm:h-8 min-h-[1.75rem] sm:min-h-[2rem]) */}
          <Link
            href={`/${lang}/products/${slug}`}
            className="h-7 sm:h-8 min-h-[1.75rem] sm:min-h-[2rem] line-clamp-2 text-[11px] sm:text-xs font-semibold text-foreground hover:text-primary transition-colors leading-snug break-words flex items-start"
            title={displayName}
          >
            {displayName}
          </Link>
        </div>

        {/* Row 3: Price & Shop Section */}
        <div className="pt-1.5 border-t border-border/40 mt-1.5 min-w-0">
          <div className="h-5 sm:h-5.5 flex items-baseline flex-wrap gap-1 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-primary tabular-nums tracking-tight">
              {formatCurrency(currentPrice, lang)}
            </span>
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-[10px] sm:text-[11px] text-muted-foreground line-through tabular-nums">
                {formatCurrency(originalPrice, lang)}
              </span>
            )}
            {formattedUnit && (
              <span className="text-[10px] text-muted-foreground">/ {formattedUnit}</span>
            )}
          </div>

          {/* Shop */}
          <div className="h-3.5 min-h-[0.875rem] flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 truncate">
            {shopName ? (
              <>
                <Store className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-muted-foreground/70" />
                <span className="truncate">{shopName}</span>
              </>
            ) : (
              <span className="text-[9px] text-muted-foreground/60">
                {isBn ? 'ভেরিফাইড বিক্রেতা' : 'Verified Seller'}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer Add to Cart Button */}
      <CardFooter className="p-2 sm:p-2.5 pt-0 w-full min-w-0">
        <Button
          size="sm"
          className="w-full h-7 sm:h-8 text-[10px] sm:text-[11px] font-semibold px-2 rounded-lg sm:rounded-xl shadow-2xs hover:shadow-xs transition-all duration-200 min-w-0 overflow-hidden"
          disabled={isOutOfStock}
          variant={isStaffOrSeller ? 'secondary' : 'default'}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 me-1 sm:me-1.5 shrink-0" />
          <span className="truncate min-w-0">
            {isOutOfStock
              ? isBn
                ? 'স্টক শেষ'
                : 'Out of Stock'
              : isStaffOrSeller
                ? isBn
                  ? 'কাস্টমার ফিচার'
                  : 'Customer Feature'
                : isBn
                  ? 'কার্টে যোগ'
                  : 'Add to Cart'}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
}
