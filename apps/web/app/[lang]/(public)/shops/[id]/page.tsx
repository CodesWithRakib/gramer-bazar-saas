'use client';

import React, { use, useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useGetShopByIdQuery, useGetShopProductsQuery } from '@/features/shops/shopsApi';
import { useGetShopCouponsQuery } from '@/features/coupons/couponsApi';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import AdminPagination from '@/components/ui/AdminPagination';
import {
  Store,
  CheckCircle,
  Phone,
  MessageSquare,
  ArrowLeft,
  Share2,
  MapPin,
  Clock,
  Truck,
  Globe,
  SlidersHorizontal,
  Search,
  X,
  Star,
  Scissors,
  ExternalLink,
  MessageCircle,
  Layers,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ShopProfilePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read filter state from URL
  const activeCategory = searchParams.get('category') || '';
  const activeBrand = searchParams.get('brand') || '';
  const urlSearch = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Local state for debounced search and price inputs
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);

  // Sync inputs if URL changes externally
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setMinPriceInput(minPriceParam);
    setMaxPriceInput(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  // Query Shop profile
  const { data: shopInitial, isLoading: isShopLoading } = useGetShopByIdQuery(id);

  // Query shop products with dynamic aggregations
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    isFetching: isProductsFetching,
  } = useGetShopProductsQuery({
    id,
    page: currentPage,
    limit: 12,
    search: urlSearch || undefined,
    categoryId: activeCategory || undefined,
    brandId: activeBrand || undefined,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    inStock: inStockParam ? true : undefined,
    sort: sortParam,
  });

  // Query shop coupons
  const { data: coupons } = useGetShopCouponsQuery(id);

  // Prefer the freshest shop data returned from products query if available
  const shop = productsResponse?.shop || shopInitial;

  // Helper to update URL params cleanly
  const updateFilters = (newParams: Record<string, string | number | boolean | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Reset page to 1 when changing filters other than page
    if (!('page' in newParams)) {
      params.delete('page');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const applyPriceFilter = () => {
    updateFilters({
      minPrice: minPriceInput ? Number(minPriceInput) : null,
      maxPrice: maxPriceInput ? Number(maxPriceInput) : null,
    });
  };

  const handleShare = async () => {
    const shopName = shop ? (isBn ? shop.nameBn : shop.nameEn) : 'Gramer Bazar Shop';
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shopName,
          text: shop?.shortDescription || shopName,
          url: shareUrl,
        });
      } catch {
        // User cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(isBn ? 'দোকানের লিংক কপি করা হয়েছে' : 'Shop link copied to clipboard');
      } catch {
        toast.error(isBn ? 'লিংক কপি করতে ব্যর্থ হয়েছে' : 'Failed to copy link');
      }
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(isBn ? `কুপন কোড ${code} কপি করা হয়েছে` : `Coupon code ${code} copied`);
  };

  if (isShopLoading && !shop) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse max-w-7xl">
        <div className="h-64 bg-muted rounded-2xl mb-8" />
        <div className="h-10 bg-muted w-1/3 rounded mb-4" />
        <div className="h-4 bg-muted w-2/3 rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-7xl">
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

  const shopPhone = shop.phone || shop.seller?.phone;
  const locationParts = [shop.village, shop.union, shop.upazila, shop.district, shop.address].filter(Boolean);
  const locationString = locationParts.join(', ');
  const activeFiltersCount = [
    activeCategory,
    activeBrand,
    urlSearch,
    minPriceParam,
    maxPriceParam,
    inStockParam,
  ].filter(Boolean).length;

  return (
    <div className="pb-16 bg-muted/10 min-h-screen">
      {/* 1. Hero Cover Banner */}
      <div className="relative h-48 md:h-72 lg:h-80 w-full bg-linear-to-r from-emerald-800 to-green-700 overflow-hidden">
        {shop.banner ? (
          <Image
            src={shop.banner}
            alt={isBn ? shop.nameBn : shop.nameEn}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-r from-emerald-700 to-teal-800 opacity-90 flex items-center justify-center">
            <Store className="w-24 h-24 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-16 md:-mt-20 relative z-10">
        {/* 2. Shop Identity Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            {/* Logo */}
            <div className="w-28 h-28 md:w-36 md:h-36 bg-background rounded-2xl border-4 border-background overflow-hidden flex items-center justify-center shadow-md shrink-0 relative">
              {shop.logo ? (
                <Image
                  src={shop.logo}
                  alt={isBn ? shop.nameBn : shop.nameEn}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-4xl md:text-5xl font-bold">
                  {shop.nameEn.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  {isBn ? shop.nameBn : shop.nameEn}
                </h1>
                {shop.isVerified && (
                  <Badge variant="secondary" className="bg-blue-600 text-white gap-1 py-0.5 px-2 text-xs">
                    <CheckCircle className="h-3.5 w-3.5" />
                    {isBn ? 'ভেরিফাইড দোকান' : 'Verified Shop'}
                  </Badge>
                )}
              </div>

              {/* Short Description */}
              {shop.shortDescription && (
                <p className="text-sm font-medium text-foreground/80 mb-2 max-w-3xl">
                  {shop.shortDescription}
                </p>
              )}

              {/* Badges / Rating / Location */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs md:text-sm text-muted-foreground mb-3">
                {/* Rating */}
                {(shop.averageRating ?? 0) > 0 ? (
                  <div className="flex items-center gap-1 font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{Number(shop.averageRating).toFixed(1)}</span>
                    <span className="text-muted-foreground font-normal">
                      ({shop.totalReviews || 0})
                    </span>
                  </div>
                ) : (
                  <span className="bg-muted px-2 py-0.5 rounded-md text-xs">
                    {isBn ? 'নতুন দোকান' : 'New Store'}
                  </span>
                )}

                {/* Product Count */}
                <span className="bg-muted px-2 py-0.5 rounded-md text-xs font-medium">
                  {shop.productCount || productsResponse?.meta?.total || 0} {isBn ? 'টি পণ্য' : 'products'}
                </span>

                {/* Location */}
                {locationString && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="line-clamp-1">{locationString}</span>
                  </div>
                )}
              </div>

              {/* Full Description if distinct from short description */}
              {shop.description && shop.description !== shop.shortDescription && (
                <p className="text-xs text-muted-foreground max-w-3xl line-clamp-2 md:line-clamp-none mb-4">
                  {shop.description}
                </p>
              )}

              {/* Operational details: hours & delivery */}
              {(shop.openingHours || shop.deliveryInfo) && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                  {shop.openingHours && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{isBn ? 'সময়সূচী:' : 'Hours:'} {shop.openingHours}</span>
                    </div>
                  )}
                  {shop.deliveryInfo && (
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{isBn ? 'ডেলিভারি:' : 'Delivery:'} {shop.deliveryInfo}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions & Contact */}
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 justify-center">
              {/* Call */}
              {shopPhone && (
                <Button asChild variant="default" size="sm" className="flex-1 md:flex-none">
                  <a href={`tel:${shopPhone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    {isBn ? 'কল করুন' : 'Call'}
                  </a>
                </Button>
              )}

              {/* WhatsApp */}
              {shop.whatsapp && (
                <Button asChild variant="outline" size="sm" className="flex-1 md:flex-none text-emerald-600 border-emerald-500/30 hover:bg-emerald-50">
                  <a
                    href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              )}

              {/* Share */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-1 md:flex-none"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {isBn ? 'শেয়ার' : 'Share'}
              </Button>

              {/* Social links */}
              <div className="hidden md:flex items-center justify-center gap-2 pt-2">
                {shop.website && (
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    title="Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {shop.facebook && (
                  <a
                    href={shop.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-600 transition-colors p-1"
                    title="Facebook"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Shop Coupons Section */}
        {coupons && coupons.length > 0 && (
          <div className="bg-card border border-border/70 rounded-2xl p-4 md:p-6 shadow-xs mb-8">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-primary" />
              {isBn ? 'দোকানের বিশেষ কুপন ও অফার' : 'Exclusive Shop Coupons'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-extrabold text-base text-primary">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% ${isBn ? 'ছাড়' : 'OFF'}`
                        : `৳${coupon.discountValue} ${isBn ? 'ছাড়' : 'OFF'}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isBn ? 'সর্বনিম্ন অর্ডার:' : 'Min. Order:'} ৳{coupon.minOrderAmount}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="bg-background border border-dashed border-primary/50 text-primary font-mono font-bold px-2.5 py-1 rounded text-xs">
                      {coupon.code}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 hover:bg-primary/10"
                      onClick={() => copyCouponCode(coupon.code)}
                    >
                      {isBn ? 'কপি' : 'Copy'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Mobile Category Carousel (<lg screens only) */}
        {productsResponse?.categories && productsResponse.categories.length > 0 && (
          <div className="lg:hidden mb-4 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <Button
                variant={!activeCategory ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilters({ category: null })}
                className="rounded-full text-xs font-semibold px-3 h-8 shrink-0"
              >
                {isBn ? 'সকল পণ্য' : 'All Products'}
                <span className="ml-1 opacity-80 text-[11px]">
                  ({productsResponse.meta?.total || 0})
                </span>
              </Button>

              {productsResponse.categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    updateFilters({ category: activeCategory === cat.id ? null : cat.id })
                  }
                  className="rounded-full text-xs font-semibold px-3 h-8 shrink-0"
                >
                  <span className="mr-1">{cat.icon || '🏷️'}</span>
                  {isBn ? cat.nameBn : cat.nameEn}
                  <span className="ml-1 opacity-80 text-[11px]">
                    ({cat.count ?? (cat as any).productCount ?? 0})
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Main 2-Column Storefront Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6 mb-8">
          {/* Left Column: Desktop Sidebar (Shop Categories & Shop Filters) */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 space-y-4 sticky top-20">
            {/* Shop Categories Card */}
            {productsResponse?.categories && productsResponse.categories.length > 0 && (
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    {isBn ? 'দোকানের ক্যাটাগরি' : 'Shop Categories'}
                  </h3>
                  {activeCategory && (
                    <button
                      type="button"
                      onClick={() => updateFilters({ category: null })}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      {isBn ? 'রিসেট' : 'Reset'}
                    </button>
                  )}
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => updateFilters({ category: null })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      !activeCategory
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-foreground hover:bg-muted font-medium'
                    }`}
                  >
                    <span>{isBn ? 'সকল পণ্য' : 'All Products'}</span>
                    <span className="opacity-80 text-[11px]">
                      {productsResponse.meta?.total || 0}
                    </span>
                  </button>

                  {productsResponse.categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        updateFilters({ category: activeCategory === cat.id ? null : cat.id })
                      }
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-foreground hover:bg-muted font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{cat.icon || '🏷️'}</span>
                        <span className="truncate">{isBn ? cat.nameBn : cat.nameEn}</span>
                      </span>
                      <span className="opacity-80 text-[11px] ml-1 shrink-0">
                        {cat.count ?? (cat as any).productCount ?? 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shop Filters Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  {isBn ? 'ফিল্টারসমূহ' : 'Filters'}
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[11px] text-destructive hover:underline font-medium"
                  >
                    {isBn ? 'সব মুছুন' : 'Clear all'}
                  </button>
                )}
              </div>

              {/* Brands */}
              {productsResponse?.brands && productsResponse.brands.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    {isBn ? 'ব্র্যান্ড' : 'Brand'}
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {productsResponse.brands.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => updateFilters({ brand: activeBrand === b.id ? null : b.id })}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          activeBrand === b.id
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className="truncate">{isBn ? b.nameBn : b.nameEn}</span>
                        <span className="opacity-80 text-[11px] ml-1 shrink-0">
                          {b.count ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Availability */}
              <div className="pt-3 border-t border-border/60">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  {isBn ? 'প্রাপ্যতা' : 'Availability'}
                </label>
                <button
                  type="button"
                  onClick={() => updateFilters({ inStock: !inStockParam })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-colors ${
                    inStockParam
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{isBn ? 'স্টকে থাকা পণ্য' : 'In Stock Only'}</span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      inStockParam
                        ? 'bg-emerald-500 ring-2 ring-emerald-300'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                </button>
              </div>

              {/* Price Range */}
              <div className="pt-3 border-t border-border/60">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  {isBn ? 'মূল্য সীমা (৳)' : 'Price Range (৳)'}
                </label>
                <div className="flex items-center gap-1.5 mb-2">
                  <Input
                    type="number"
                    placeholder={isBn ? 'সর্বনিম্ন' : 'Min'}
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                    className="h-8 text-xs rounded-lg"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder={isBn ? 'সর্বোচ্চ' : 'Max'}
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs font-medium"
                  onClick={applyPriceFilter}
                >
                  {isBn ? 'প্রয়োগ করুন' : 'Apply'}
                </Button>
              </div>
            </div>
          </aside>

          {/* Right Column: Search, Filters Bar, Active Filter Chips, Products Grid */}
          <main className="flex-1 min-w-0 w-full space-y-4">
            {/* Search & Sort Bar */}
            <div className="bg-card border border-border/80 rounded-2xl p-3 md:p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:flex-1">
                  <Input
                    type="search"
                    placeholder={isBn ? 'এই দোকানে পণ্য খুঁজুন...' : 'Search products in this shop...'}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9 pr-8 h-10 text-sm rounded-xl"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        updateFilters({ search: null });
                      }}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Sort Selector */}
                  <Select
                    value={sortParam}
                    onValueChange={(val) => updateFilters({ sort: val })}
                  >
                    <SelectTrigger className="h-10 text-xs w-full sm:w-[160px] rounded-xl">
                      <SelectValue placeholder={isBn ? 'সাজান' : 'Sort by'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{isBn ? 'নতুন পণ্য' : 'Newest'}</SelectItem>
                      <SelectItem value="price_asc">
                        {isBn ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}
                      </SelectItem>
                      <SelectItem value="price_desc">
                        {isBn ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}
                      </SelectItem>
                      <SelectItem value="rating">
                        {isBn ? 'রেটিং অনুসারে' : 'Highest Rated'}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Filter Button (Opens Sheet on Mobile & Tablet) */}
                  <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="h-10 text-xs rounded-xl relative lg:hidden shrink-0">
                        <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                        {isBn ? 'ফিল্টার' : 'Filters'}
                        {activeFiltersCount > 0 && (
                          <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[320px] sm:w-[380px] p-6 overflow-y-auto">
                      <SheetHeader className="mb-6">
                        <SheetTitle className="text-lg font-bold flex items-center justify-between">
                          <span>{isBn ? 'ফিল্টারসমূহ' : 'Filter Products'}</span>
                          {activeFiltersCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                clearAllFilters();
                                setIsFilterSheetOpen(false);
                              }}
                              className="text-xs text-destructive hover:bg-destructive/10"
                            >
                              {isBn ? 'সব মুছুন' : 'Reset All'}
                            </Button>
                          )}
                        </SheetTitle>
                      </SheetHeader>

                      <div className="space-y-6">
                        {/* Categories inside mobile drawer */}
                        {productsResponse?.categories && productsResponse.categories.length > 0 && (
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                              {isBn ? 'ক্যাটাগরি' : 'Category'}
                            </label>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              <button
                                type="button"
                                onClick={() => updateFilters({ category: null })}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                                  !activeCategory
                                    ? 'bg-primary text-primary-foreground font-semibold'
                                    : 'hover:bg-muted text-foreground'
                                }`}
                              >
                                <span>{isBn ? 'সকল পণ্য' : 'All Products'}</span>
                                <span className="opacity-80">
                                  ({productsResponse.meta?.total || 0})
                                </span>
                              </button>
                              {productsResponse.categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() =>
                                    updateFilters({
                                      category: activeCategory === cat.id ? null : cat.id,
                                    })
                                  }
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                                    activeCategory === cat.id
                                      ? 'bg-primary text-primary-foreground font-semibold'
                                      : 'hover:bg-muted text-foreground'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5 truncate">
                                    <span>{cat.icon || '🏷️'}</span>
                                    <span className="truncate">
                                      {isBn ? cat.nameBn : cat.nameEn}
                                    </span>
                                  </span>
                                  <span className="opacity-80">
                                    ({cat.count ?? (cat as any).productCount ?? 0})
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Brand Filter */}
                        {productsResponse?.brands && productsResponse.brands.length > 0 && (
                          <div className="pt-4 border-t border-border">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                              {isBn ? 'ব্র্যান্ড' : 'Brand'}
                            </label>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {productsResponse.brands.map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() =>
                                    updateFilters({ brand: activeBrand === b.id ? null : b.id })
                                  }
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                                    activeBrand === b.id
                                      ? 'bg-primary text-primary-foreground font-semibold'
                                      : 'hover:bg-muted text-foreground'
                                  }`}
                                >
                                  <span>{isBn ? b.nameBn : b.nameEn}</span>
                                  <span className="opacity-80">({b.count ?? 0})</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Stock Availability */}
                        <div className="pt-4 border-t border-border">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                            {isBn ? 'প্রাপ্যতা' : 'Availability'}
                          </label>
                          <button
                            type="button"
                            onClick={() => updateFilters({ inStock: !inStockParam })}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs border transition-colors ${
                              inStockParam
                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                : 'border-border text-foreground hover:bg-muted'
                            }`}
                          >
                            <span>{isBn ? 'শুধুমাত্র স্টকে থাকা পণ্য' : 'In Stock Only'}</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          </button>
                        </div>

                        {/* Price Range */}
                        <div className="pt-4 border-t border-border">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                            {isBn ? 'মূল্য সীমা (৳)' : 'Price Range (৳)'}
                          </label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder={isBn ? 'সর্বনিম্ন' : 'Min'}
                              value={minPriceInput}
                              onChange={(e) => setMinPriceInput(e.target.value)}
                              className="h-9 text-xs"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                              type="number"
                              placeholder={isBn ? 'সর্বোচ্চ' : 'Max'}
                              value={maxPriceInput}
                              onChange={(e) => setMaxPriceInput(e.target.value)}
                              className="h-9 text-xs"
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full mt-6"
                          onClick={() => {
                            applyPriceFilter();
                            setIsFilterSheetOpen(false);
                          }}
                        >
                          {isBn ? 'পণ্য দেখুন' : 'Apply & View'}
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50 mt-3">
                  <span className="text-xs text-muted-foreground">
                    {isBn ? 'সক্রিয় ফিল্টার:' : 'Active filters:'}
                  </span>

                  {urlSearch && (
                    <Badge variant="secondary" className="gap-1 text-xs py-1">
                      &quot;{urlSearch}&quot;
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => {
                          setSearchInput('');
                          updateFilters({ search: null });
                        }}
                      />
                    </Badge>
                  )}

                  {activeCategory && productsResponse?.categories && (
                    <Badge variant="secondary" className="gap-1 text-xs py-1">
                      {(() => {
                        const c = productsResponse.categories.find((x) => x.id === activeCategory);
                        return c ? (isBn ? c.nameBn : c.nameEn) : activeCategory;
                      })()}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => updateFilters({ category: null })}
                      />
                    </Badge>
                  )}

                  {activeBrand && productsResponse?.brands && (
                    <Badge variant="secondary" className="gap-1 text-xs py-1">
                      {(() => {
                        const b = productsResponse.brands.find((x) => x.id === activeBrand);
                        return b ? (isBn ? b.nameBn : b.nameEn) : activeBrand;
                      })()}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => updateFilters({ brand: null })}
                      />
                    </Badge>
                  )}

                  {inStockParam && (
                    <Badge variant="secondary" className="gap-1 text-xs py-1">
                      {isBn ? 'স্টকে আছে' : 'In Stock'}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => updateFilters({ inStock: null })}
                      />
                    </Badge>
                  )}

                  {(minPriceParam || maxPriceParam) && (
                    <Badge variant="secondary" className="gap-1 text-xs py-1">
                      ৳{minPriceParam || '0'} - ৳{maxPriceParam || '∞'}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => updateFilters({ minPrice: null, maxPrice: null })}
                      />
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 text-xs text-destructive hover:bg-destructive/10 px-2"
                  >
                    {isBn ? 'সব মুছুন' : 'Clear all'}
                  </Button>
                </div>
              )}
            </div>

            {/* Products Grid & Results */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  {isBn ? 'দোকানের পণ্যসমূহ' : 'Shop Products'}
                </h2>
                <span className="text-xs md:text-sm text-muted-foreground font-medium">
                  {productsResponse?.meta?.total ?? 0} {isBn ? 'টি পণ্য পাওয়া গেছে' : 'items found'}
                </span>
              </div>

              {isProductsLoading || isProductsFetching ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="h-72 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : !productsResponse?.data || productsResponse.data.length === 0 ? (
                <div className="text-center py-16 px-4 bg-card rounded-2xl border border-dashed border-border/80">
                  <Store className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <h3 className="text-lg font-bold mb-1">
                    {isBn ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                    {activeFiltersCount > 0
                      ? isBn
                        ? 'আপনার ফিল্টারের সাথে মিলে এমন কোন পণ্য পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করুন।'
                        : 'No products matched your active filters. Try adjusting or clearing filters.'
                      : isBn
                      ? 'এই দোকানটি এখনও কোন পণ্য যোগ করেনি।'
                      : 'This shop has not listed any products yet.'}
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      {isBn ? 'সব ফিল্টার মুছুন' : 'Clear Filters'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <ProductGrid
                    products={productsResponse.data}
                    isLoading={false}
                    lang={lang}
                  />

                  {/* Pagination */}
                  {productsResponse.meta && productsResponse.meta.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <AdminPagination
                        totalItems={productsResponse.meta.total}
                        itemsPerPage={productsResponse.meta.limit}
                        currentPage={productsResponse.meta.page}
                        lang={lang}
                        showLimitSelector={false}
                        onPageChange={(page) => updateFilters({ page })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
