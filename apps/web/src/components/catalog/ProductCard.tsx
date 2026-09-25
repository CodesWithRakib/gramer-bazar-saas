'use client';

import React from 'react';
import Link from 'next/link';
import { CustomImage } from '@/components/ui/CustomImage';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
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
    combined.includes('চিংড়ি') ||
    combined.includes('ইলিশ') ||
    combined.includes('পাঙ্গাস') ||
    combined.includes('কৈ')
  ) {
    return {
      type: 'fish',
      label: isBn ? 'তাজা মাছ' : 'Fresh Fish',
      badgeClass: 'bg-cyan-600 text-white',
      accentBorder: 'hover:border-cyan-500/50',
      icon: 'fish',
    };
  }

  // Meat & Poultry
  if (
    combined.includes('meat') ||
    combined.includes('chicken') ||
    combined.includes('beef') ||
    combined.includes('mutton') ||
    combined.includes('মাংস') ||
    combined.includes('মুরগি') ||
    combined.includes('গরু') ||
    combined.includes('খাসি') ||
    combined.includes('হাঁস') ||
    combined.includes('কলিজা')
  ) {
    return {
      type: 'meat',
      label: isBn ? 'দেশি মাংস' : 'Fresh Meat',
      badgeClass: 'bg-red-600 text-white',
      accentBorder: 'hover:border-red-500/50',
      icon: 'flame',
    };
  }

  // Fruits
  if (
    combined.includes('fruit') ||
    combined.includes('ফল') ||
    combined.includes('পেয়ারা') ||
    combined.includes('আম') ||
    combined.includes('কলা') ||
    combined.includes('আপেল') ||
    combined.includes('কমলা') ||
    combined.includes('আঙ্গুর') ||
    combined.includes('লিচু') ||
    combined.includes('লেবু') ||
    combined.includes('মাল্টা')
  ) {
    return {
      type: 'fruits',
      label: isBn ? 'তাজা ফল' : 'Fresh Fruits',
      badgeClass: 'bg-orange-500 text-white',
      accentBorder: 'hover:border-orange-500/50',
      icon: 'sparkles',
    };
  }

  // Spices & Condiments (e.g. Jeera, Haldi, Morich)
  if (
    combined.includes('spice') ||
    combined.includes('মসলা') ||
    combined.includes('জিরা') ||
    combined.includes('হলুদ') ||
    combined.includes('মরিচ গুঁড়া') ||
    combined.includes('ধনিয়া') ||
    combined.includes('দারুচিনি') ||
    combined.includes('এলাচ') ||
    combined.includes('লবঙ্গ') ||
    combined.includes('আদা') ||
    combined.includes('রসুন') ||
    combined.includes('পেঁয়াজ')
  ) {
    return {
      type: 'spices',
      label: isBn ? 'খাঁটি মসলা' : 'Pure Spices',
      badgeClass: 'bg-amber-600 text-white',
      accentBorder: 'hover:border-amber-500/50',
      icon: 'sparkles',
    };
  }

  // Fresh Vegetables & Greens
  if (
    combined.includes('vegetable') ||
    combined.includes('সবজি') ||
    combined.includes('shak') ||
    combined.includes('শাক') ||
    combined.includes('কাঁচা মরিচ') ||
    combined.includes('আলু') ||
    combined.includes('টমেটো') ||
    combined.includes('বেগুন') ||
    combined.includes('শসা') ||
    combined.includes('লাউ')
  ) {
    return {
      type: 'vegetables',
      label: isBn ? 'টাটকা সবজি' : 'Fresh Vegetables',
      badgeClass: 'bg-emerald-600 text-white',
      accentBorder: 'hover:border-emerald-500/50',
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
      badgeClass: 'bg-amber-500 text-white',
      accentBorder: 'hover:border-amber-500/50',
      icon: 'droplets',
    };
  }

  // Grains, Rice, Pulses
  if (
    combined.includes('rice') ||
    combined.includes('dal') ||
    combined.includes('grain') ||
    combined.includes('চাল') ||
    combined.includes('ডাল') ||
    combined.includes('আটা') ||
    combined.includes('ময়দা') ||
    combined.includes('সুজি')
  ) {
    return {
      type: 'grains',
      label: isBn ? 'খাদ্যশস্য' : 'Grains & Rice',
      badgeClass: 'bg-yellow-600 text-white',
      accentBorder: 'hover:border-yellow-500/50',
      icon: 'wheat',
    };
  }

  // Electronics & Gadgets
  if (
    combined.includes('electron') ||
    combined.includes('mobile') ||
    combined.includes('gadget') ||
    combined.includes('appliance') ||
    combined.includes('computer') ||
    combined.includes('ফোন') ||
    combined.includes('ফ্যান')
  ) {
    return {
      type: 'electronics',
      label: isBn ? 'অফিশিয়াল গ্যাজেট' : 'Official Device',
      badgeClass: 'bg-blue-600 text-white',
      accentBorder: 'hover:border-blue-500/50',
      icon: 'shieldCheck',
    };
  }

  // Fashion & Apparel
  if (
    combined.includes('cloth') ||
    combined.includes('fashion') ||
    combined.includes('wear') ||
    combined.includes('পোশাক') ||
    combined.includes('শাড়ি') ||
    combined.includes('পাঞ্জাবি') ||
    combined.includes('লুঙ্গি')
  ) {
    return {
      type: 'fashion',
      label: isBn ? 'ফ্যাশন ও পোশাক' : 'Fashion Wear',
      badgeClass: 'bg-purple-600 text-white',
      accentBorder: 'hover:border-purple-500/50',
      icon: 'shirt',
    };
  }

  // Cosmetics & Beauty
  if (
    combined.includes('cosmetic') ||
    combined.includes('beauty') ||
    combined.includes('skincare') ||
    combined.includes('প্রসাধন') ||
    combined.includes('সাবান') ||
    combined.includes('শ্যাম্পু') ||
    combined.includes('ক্রিম')
  ) {
    return {
      type: 'cosmetics',
      label: isBn ? '১০০% আসল' : '100% Authentic',
      badgeClass: 'bg-rose-500 text-white',
      accentBorder: 'hover:border-rose-500/50',
      icon: 'zap',
    };
  }

  // Medicine & Healthcare
  if (
    combined.includes('medicine') ||
    combined.includes('health') ||
    combined.includes('pharmacy') ||
    combined.includes('ওষুধ') ||
    combined.includes('ব্যান্ডেজ') ||
    combined.includes('প্লাস্টার') ||
    combined.includes('স্যালাইন')
  ) {
    return {
      type: 'medicine',
      label: isBn ? 'স্বাস্থ্যসেবা' : 'Healthcare',
      badgeClass: 'bg-teal-600 text-white',
      accentBorder: 'hover:border-teal-500/50',
      icon: 'shieldCheck',
    };
  }

  // Food & Bakery
  if (
    combined.includes('food') ||
    combined.includes('bakery') ||
    combined.includes('sweet') ||
    combined.includes('খাবার') ||
    combined.includes('মিষ্টি') ||
    combined.includes('বিস্কুট') ||
    combined.includes('কেক') ||
    combined.includes('পাউরুটি')
  ) {
    return {
      type: 'food',
      label: isBn ? 'খাবার ও মিষ্টি' : 'Food & Bakery',
      badgeClass: 'bg-amber-600 text-white',
      accentBorder: 'hover:border-amber-500/50',
      icon: 'utensils',
    };
  }

  return {
    type: 'general',
    label: '',
    badgeClass: 'bg-zinc-700/90 text-white',
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
        nameEn: product.productVariant?.nameEn || productData?.nameEn || '',
        nameBn: product.productVariant?.nameBn || productData?.nameBn || '',
        price: currentPrice,
        quantity: 1,
        image,
        maxQuantity: stock,
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
      className={`h-full flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card ${categoryTheme.accentBorder} hover:shadow-lg transition-all duration-300 group relative`}
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
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent !== null && discountPercent > 0 && !isOutOfStock && (
            <div className="bg-destructive text-destructive-foreground text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              -{discountPercent}%
            </div>
          )}

          {categoryBadgeLabel && !isOutOfStock && (
            <Badge
              variant="secondary"
              className={`${categoryTheme.badgeClass} border-none text-[9px] px-1.5 py-0 font-medium flex items-center gap-0.5 shadow-xs`}
            >
              {renderCategoryIcon()}
              <span>{categoryBadgeLabel}</span>
            </Badge>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/65 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-zinc-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
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
          className="absolute top-2.5 right-2.5 h-8 w-8 bg-background/90 hover:bg-background shadow-xs z-10 rounded-full transition-all opacity-85 group-hover:opacity-100"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-foreground/70'}`}
          />
        </Button>

        {/* Unit Tag on Image */}
        {formattedUnit && (
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-xs text-[10px] font-semibold text-foreground px-2 py-0.5 rounded shadow-xs z-10">
            {formattedUnit}
          </div>
        )}
      </Link>

      {/* Product Details Content */}
      <CardContent className="p-3.5 flex-grow flex flex-col justify-between">
        <div>
          {/* Brand or Category Tag */}
          <div className="flex items-center justify-between gap-1 mb-1">
            {brandName ? (
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate">
                {brandName}
              </span>
            ) : productData?.category ? (
              <span className="text-[10px] text-muted-foreground truncate flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />
                {isBn
                  ? productData.category.nameBn || productData.category.nameEn
                  : productData.category.nameEn}
              </span>
            ) : (
              <span />
            )}

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center text-amber-500 text-[10px] font-semibold gap-0.5 shrink-0">
                <Star className="h-3 w-3 fill-current" />
                <span>{avgRating.toFixed(1)}</span>
                {totalReviews > 0 && (
                  <span className="text-muted-foreground">({totalReviews})</span>
                )}
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link
            href={`/${lang}/products/${slug}`}
            className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug mb-1.5"
            title={displayName}
          >
            {displayName}
          </Link>

          {/* Electronics / Specs snippet */}
          {categoryTheme.type === 'electronics' && productData?.shortDescriptionEn && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">
              {isBn && productData.shortDescriptionBn
                ? productData.shortDescriptionBn
                : productData.shortDescriptionEn}
            </p>
          )}

          {categoryTheme.type !== 'electronics' && avgRating === 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                {isBn ? 'নতুন পণ্য' : 'New'}
              </span>
            </div>
          )}
        </div>

        {/* Price & Shop Section */}
        <div className="pt-2 border-t border-border/40 mt-1">
          <div className="flex items-baseline flex-wrap gap-1.5">
            <span className="text-base md:text-lg font-bold text-primary">৳{currentPrice}</span>
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-xs text-muted-foreground line-through">৳{originalPrice}</span>
            )}
            {formattedUnit && (
              <span className="text-xs text-muted-foreground">/ {formattedUnit}</span>
            )}
          </div>

          {/* Shop */}
          {shopName && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 truncate">
              <Store className="h-3 w-3 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{shopName}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer Add to Cart Button */}
      <CardFooter className="p-3.5 pt-0">
        <Button
          className={`w-full h-9 text-xs font-semibold rounded-xl shadow-xs transition-colors ${
            categoryTheme.type === 'vegetables' || categoryTheme.type === 'fruits'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : categoryTheme.type === 'spices' || categoryTheme.type === 'grains'
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : categoryTheme.type === 'fish'
              ? 'bg-cyan-700 hover:bg-cyan-800 text-white'
              : categoryTheme.type === 'meat'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : ''
          }`}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          {isOutOfStock
            ? isBn
              ? 'স্টক শেষ'
              : 'Out of Stock'
            : isBn
            ? 'কার্টে যোগ করুন'
            : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
