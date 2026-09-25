'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  ShieldCheck,
  Truck,
  Star,
  Heart,
  Share2,
  ChevronRight,
  CheckCircle2,
  ShoppingCart,
  Zap,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Layers,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { SellerProduct, useGetRelatedProductsQuery } from '@/features/catalog/catalogApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addToCart } from '@/store/slices/cartSlice';
import {
  useGetUserWishlistQuery,
  useAddProductToWishlistMutation,
  useRemoveProductFromWishlistMutation,
} from '@/features/wishlists/wishlistsApi';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomImage } from '@/components/ui/CustomImage';
import { StartChatButton } from '@/components/chat/StartChatButton';

export function ProductDetailsClient({
  products,
  lang,
}: {
  products: SellerProduct[];
  lang: string;
}) {
  const isBn = lang === 'bn';
  const dispatch = useDispatch();
  const router = useRouter();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const product = products?.[selectedVariantIdx];
  const images = product?.productVariant.images?.length
    ? product.productVariant.images
    : ['/placeholder.jpg'];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [prevVariantId, setPrevVariantId] = useState(product?.productVariant.id);
  if (product?.productVariant.id !== prevVariantId) {
    setPrevVariantId(product?.productVariant.id);
    setActiveImage(images[0]);
  }

  const slug = product?.productVariant.product.slug;
  const { data: relatedProducts } = useGetRelatedProductsQuery(slug as string, {
    skip: !slug,
  });
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: wishlist } = useGetUserWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToWishlist, { isLoading: isAddingWishlist }] = useAddProductToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] =
    useRemoveProductFromWishlistMutation();

  if (!products || products.length === 0 || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {isBn ? 'পণ্য পাওয়া যায়নি' : 'Product not found'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isBn
            ? 'আপনি যে পণ্যটি খুঁজছেন তা বর্তমানে স্টকে নেই বা সরিয়ে নেওয়া হয়েছে।'
            : 'The product you are looking for is currently out of stock or has been removed.'}
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/${lang}/search`}>{isBn ? 'অন্য পণ্য খুঁজুন' : 'Search other products'}</Link>
          </Button>
          <ProductRequestModal lang={lang} />
        </div>
      </div>
    );
  }

  // Proper Product Title Resolution
  const masterProduct = product.productVariant.product;
  const productName = isBn ? masterProduct.nameBn : masterProduct.nameEn;
  const variantName = isBn ? product.productVariant.nameBn : product.productVariant.nameEn;
  const hasDistinctVariant =
    variantName &&
    variantName.toLowerCase() !== 'standard' &&
    variantName.toLowerCase() !== 'default' &&
    variantName !== 'স্ট্যান্ডার্ড' &&
    variantName !== 'ডিফল্ট' &&
    variantName !== productName;
  const displayName = hasDistinctVariant ? `${productName} (${variantName})` : productName;

  const description = isBn ? masterProduct.descriptionBn : masterProduct.descriptionEn;
  const shortDescription = isBn
    ? masterProduct.shortDescriptionBn
    : masterProduct.shortDescriptionEn;

  // Resolve Price and Discount safely
  const rawPrice = Number(product.price);
  const rawDiscount = product.discountPrice ? Number(product.discountPrice) : null;
  const compareAt = masterProduct.compareAtPrice ? Number(masterProduct.compareAtPrice) : null;

  let currentPrice = rawPrice;
  let originalPrice: number | null = null;

  if (rawDiscount && rawDiscount < rawPrice) {
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

  const stock = product.inventory?.quantity || 0;
  const isOutOfStock = stock <= 0;
  const unit = masterProduct.unit;
  const brand = masterProduct.brand;
  const category = masterProduct.category;
  const subCategory = masterProduct.subCategory;
  const avgRating = masterProduct.averageRating || 0;
  const totalReviews = masterProduct.totalReviews || 0;

  const isWishlisted = wishlist?.some((item) => item.productId === masterProduct.id);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error(isBn ? 'দয়া করে লগইন করুন' : 'Please login first');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(masterProduct.id).unwrap();
        toast.success(isBn ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(masterProduct.id).unwrap();
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
        quantity,
        price: currentPrice,
        nameEn: masterProduct.nameEn,
        nameBn: masterProduct.nameBn,
        image: activeImage,
        sellerNameEn: product.shop.nameEn,
        sellerNameBn: product.shop.nameBn,
        maxQuantity: stock,
      })
    );
    toast.success(isBn ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/${lang}/customer/checkout`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.75)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)',
    });
  };

  return (
    <div className="bg-muted/10 min-h-screen pb-16">
      <div className="container mx-auto px-4 py-5 max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground mb-6 gap-2"
        >
          <Link href={`/${lang}`} className="hover:text-primary transition-colors">
            {isBn ? 'হোম' : 'Home'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Link href={`/${lang}/categories`} className="hover:text-primary transition-colors">
            {isBn ? 'ক্যাটাগরি' : 'Categories'}
          </Link>
          {category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <Link
                href={`/${lang}/categories/${category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {isBn ? category.nameBn : category.nameEn}
              </Link>
            </>
          )}
          {category && subCategory && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <Link
                href={`/${lang}/categories/${category.slug}/${subCategory.slug}`}
                className="hover:text-primary transition-colors"
              >
                {isBn ? subCategory.nameBn : subCategory.nameEn}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-xs">
            {displayName}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT 7 COLS: Image Gallery & Detailed Tabs */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Image Gallery Card */}
            <div className="bg-card rounded-3xl p-5 md:p-7 shadow-xs border border-border/80">
              <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6">
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[480px] no-scrollbar shrink-0">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-18 h-18 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                          activeImage === img
                            ? 'border-primary ring-2 ring-primary/30 shadow-xs'
                            : 'border-border/60 hover:border-primary/50 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <CustomImage
                          src={img}
                          fill
                          sizes="72px"
                          className="object-cover"
                          alt={`Thumbnail ${idx + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Primary Image with Zoom */}
                <div
                  ref={imageContainerRef}
                  className="bg-muted/30 rounded-2xl overflow-hidden aspect-square flex-1 flex items-center justify-center p-4 relative group cursor-zoom-in border border-border/40"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <CustomImage
                    src={activeImage}
                    alt={displayName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-6 transition-transform duration-200 ease-out"
                    priority
                    style={zoomStyle}
                  />

                  {/* Badges */}
                  {discountPercent !== null && discountPercent > 0 && !isOutOfStock && (
                    <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-black px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>-{discountPercent}% ছাড়</span>
                    </div>
                  )}

                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center z-10">
                      <span className="bg-zinc-900/95 text-white font-extrabold px-6 py-2.5 rounded-full text-base shadow-xl">
                        {isBn ? 'স্টক শেষ' : 'SOLD OUT'}
                      </span>
                    </div>
                  )}

                  {/* Top Right Action Overlay (Share & Wishlist) */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 rounded-full shadow-sm bg-background/90 hover:bg-background transition-transform active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(window.location.href);
                        toast.success(isBn ? 'লিঙ্ক কপি করা হয়েছে' : 'Link copied to clipboard');
                      }}
                      title={isBn ? 'শেয়ার করুন' : 'Share'}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className={`h-9 w-9 rounded-full shadow-sm bg-background/90 hover:bg-background transition-transform active:scale-95 ${
                        isWishlisted ? 'text-destructive' : 'text-foreground'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist();
                      }}
                      disabled={isAddingWishlist || isRemovingWishlist}
                      title={isWishlisted ? (isBn ? 'উইশলিস্ট থেকে সরান' : 'Remove from wishlist') : (isBn ? 'উইশলিস্টে যোগ করুন' : 'Add to wishlist')}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Tabs Section */}
            <div className="bg-card rounded-3xl p-6 shadow-xs border border-border/80">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 h-11 bg-muted/60 rounded-xl p-1">
                  <TabsTrigger value="details" className="rounded-lg text-xs md:text-sm font-semibold">
                    {isBn ? 'বিস্তারিত বিবরণ' : 'Description'}
                  </TabsTrigger>
                  <TabsTrigger value="specs" className="rounded-lg text-xs md:text-sm font-semibold">
                    {isBn ? 'স্পেসিফিকেশন' : 'Specifications'}
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-lg text-xs md:text-sm font-semibold">
                    {isBn ? `রিভিউ (${totalReviews})` : `Reviews (${totalReviews})`}
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Detailed Description */}
                <TabsContent value="details" className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {isBn ? 'পণ্যের পূর্ণ বিবরণ' : 'Product Full Description'}
                  </h3>
                  {description ? (
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {description}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      {isBn ? 'এই পণ্যের কোন বিস্তারিত বিবরণ যোগ করা হয়নি।' : 'No full description provided for this product.'}
                    </p>
                  )}
                </TabsContent>

                {/* Tab 2: Specifications Table */}
                <TabsContent value="specs" className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground">
                    {isBn ? 'পণ্যের বৈশিষ্ট্য ও তথ্য' : 'Product Specifications'}
                  </h3>
                  <div className="border border-border/70 rounded-2xl overflow-hidden divide-y divide-border/60">
                    <div className="grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20">
                      <span className="font-semibold text-muted-foreground">{isBn ? 'পণ্য' : 'Product'}</span>
                      <span className="col-span-2 font-medium text-foreground">{productName}</span>
                    </div>
                    {category && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm">
                        <span className="font-semibold text-muted-foreground">{isBn ? 'ক্যাটাগরি' : 'Category'}</span>
                        <span className="col-span-2 font-medium text-foreground">{isBn ? category.nameBn : category.nameEn}</span>
                      </div>
                    )}
                    {subCategory && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20">
                        <span className="font-semibold text-muted-foreground">{isBn ? 'উপ-ক্যাটাগরি' : 'Subcategory'}</span>
                        <span className="col-span-2 font-medium text-foreground">{isBn ? subCategory.nameBn : subCategory.nameEn}</span>
                      </div>
                    )}
                    {brand && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm">
                        <span className="font-semibold text-muted-foreground">{isBn ? 'ব্র্যান্ড' : 'Brand'}</span>
                        <span className="col-span-2 font-medium text-foreground">{isBn ? brand.nameBn : brand.nameEn}</span>
                      </div>
                    )}
                    {unit && (
                      <div className="grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20">
                        <span className="font-semibold text-muted-foreground">{isBn ? 'পরিমাপ ইউনিট' : 'Unit'}</span>
                        <span className="col-span-2 font-medium text-foreground">{unit}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 p-3 text-xs md:text-sm">
                      <span className="font-semibold text-muted-foreground">{isBn ? 'স্টক প্রাপ্যতা' : 'Availability'}</span>
                      <span className="col-span-2 font-medium text-foreground">
                        {isOutOfStock ? (isBn ? 'স্টক শেষ' : 'Out of Stock') : isBn ? `${stock} টি স্টকে আছে` : `${stock} units available`}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-3 text-xs md:text-sm bg-muted/20">
                      <span className="font-semibold text-muted-foreground">{isBn ? 'উৎপত্তি' : 'Origin'}</span>
                      <span className="col-span-2 font-medium text-foreground">
                        {isBn ? 'বাংলাদেশি গ্রামীণ খামার ও বাজার' : 'Local Rural Farms & Artisan Markets, Bangladesh'}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Reviews */}
                <TabsContent value="reviews">
                  <ProductReviews productId={masterProduct.id} isBn={isBn} lang={lang} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Related Products Carousel / Grid */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  {isBn ? 'সংশ্লিষ্ট জনপ্রিয় পণ্য' : 'Related Products'}
                </h2>
                {category && (
                  <Link
                    href={`/${lang}/categories/${category.slug}`}
                    className="text-xs md:text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>{isBn ? 'আরও দেখুন' : 'View more'}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              {relatedProducts && relatedProducts.length > 0 ? (
                <ProductGrid products={relatedProducts} isLoading={false} lang={lang} />
              ) : (
                <p className="text-muted-foreground bg-card p-6 rounded-2xl text-center border border-border/70 text-sm">
                  {isBn ? 'কোন সংশ্লিষ্ট পণ্য পাওয়া যায়নি।' : 'No related products found.'}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT 5 COLS: Sticky Buy Box & Value Props */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Purchase Box Card */}
            <div className="bg-card rounded-3xl p-6 shadow-md border border-border/80 flex flex-col">
              {/* Brand and Categories Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {brand && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {isBn ? brand.nameBn : brand.nameEn}
                  </span>
                )}
                {subCategory && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {isBn ? subCategory.nameBn : subCategory.nameEn}
                  </span>
                )}
              </div>

              {/* Main Product Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-snug mb-2">
                {displayName}
              </h1>

              {/* Short Description */}
              {shortDescription && (
                <p className="text-xs md:text-sm text-muted-foreground mb-4 line-clamp-2">
                  {shortDescription}
                </p>
              )}

              {/* Rating & Review Counter */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/60">
                <div className="flex items-center text-amber-500">
                  <Star className={`h-4 w-4 ${avgRating > 0 ? 'fill-current' : 'text-muted-foreground/30'}`} />
                  <span className="text-sm font-bold text-foreground ml-1.5">
                    {avgRating > 0 ? avgRating.toFixed(1) : (isBn ? 'নতুন' : 'New')}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">•</span>
                <span className="text-xs text-muted-foreground">
                  {totalReviews} {isBn ? 'টি রিভিউ' : 'reviews'}
                </span>
                <span className="text-muted-foreground text-xs">•</span>
                {/* Stock Status Tag */}
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isOutOfStock
                      ? 'bg-destructive/10 text-destructive'
                      : stock <= 5
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-emerald-500/10 text-emerald-600'
                  }`}
                >
                  {isOutOfStock
                    ? isBn ? 'স্টক শেষ' : 'Out of Stock'
                    : stock <= 5
                    ? isBn ? `মাত্র ${stock}টি বাকি!` : `Only ${stock} left!`
                    : isBn ? 'স্টকে আছে' : 'In Stock'}
                </span>
              </div>

              {/* Pricing Box */}
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 mb-5">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl md:text-4xl font-black text-primary">
                    ৳{currentPrice}
                  </span>
                  {originalPrice && originalPrice > currentPrice && (
                    <span className="text-base text-muted-foreground line-through">
                      ৳{originalPrice}
                    </span>
                  )}
                  {unit && (
                    <span className="text-xs text-muted-foreground font-medium">
                      / {unit}
                    </span>
                  )}
                  {discountPercent !== null && discountPercent > 0 && (
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-md ml-auto">
                      {isBn ? `${discountPercent}% ছাড়` : `${discountPercent}% OFF`}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {isBn ? 'ভ্যাট সহ অন্তর্ভুক্ত মূল্য' : 'Inclusive of all local taxes'}
                </p>
              </div>

              {/* Multi-Variant Selector (if multiple variants available) */}
              {products.length > 1 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2.5">
                    {isBn ? 'বিকল্পসমূহ নির্বাচন করুন:' : 'Select Option:'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {products.map((p, idx) => {
                      const pName = isBn
                        ? p.productVariant.nameBn || p.productVariant.product.nameBn
                        : p.productVariant.nameEn || p.productVariant.product.nameEn;
                      const pPrice = p.discountPrice || p.price;
                      const isSelected = selectedVariantIdx === idx;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantIdx(idx);
                            setQuantity(1);
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-xs'
                              : 'border-border/70 hover:border-primary/40 bg-card'
                          }`}
                        >
                          <span className={`text-xs font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {pName}
                          </span>
                          <span className="text-xs font-bold text-foreground mt-1">
                            ৳{pPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {isBn ? 'পরিমাণ:' : 'Quantity:'}
                </span>
                <div className="flex items-center bg-muted/60 border border-border/80 rounded-xl p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="h-8 w-8 p-0 rounded-lg font-bold text-base hover:bg-background"
                  >
                    -
                  </Button>
                  <span className="text-sm font-bold w-10 text-center text-foreground">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock || isOutOfStock}
                    className="h-8 w-8 p-0 rounded-lg font-bold text-base hover:bg-background"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Two High-Converting Action Buttons */}
              <div className="space-y-2.5">
                <Button
                  size="lg"
                  className="w-full h-12 text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                >
                  <Zap className="h-4 w-4 fill-current" />
                  <span>{isBn ? 'এখনই অর্ডার করুন' : 'Buy Now'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-12 text-sm font-bold rounded-xl border-primary/30 text-primary hover:bg-primary/5 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{isBn ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                </Button>
              </div>

              {/* Trust & Guarantee Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-border/60">
                <div className="flex items-start gap-2.5">
                  <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isBn ? 'দ্রুত হোম ডেলিভারি' : 'Fast Delivery'}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn ? '২৪ ঘণ্টার মধ্যে নিশ্চিত' : 'Within 24 hours'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isBn ? '১০০% খাঁটি পণ্য' : '100% Genuine'}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn ? 'খামার থেকে সরাসরি' : 'Direct from farms'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn ? 'হাতে পেয়ে মূল্য দিন' : 'Pay upon delivery'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <RotateCcw className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-foreground">
                      {isBn ? 'সহজ রিটার্ন' : 'Easy Return'}
                    </h5>
                    <p className="text-[11px] text-muted-foreground">
                      {isBn ? 'সমস্যা হলে তাৎক্ষণিক' : 'Instant hassle-free'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant / Shop Information Card */}
            <div className="bg-card rounded-3xl p-5 shadow-xs border border-border/80">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {isBn ? 'বিক্রেতা দোকান' : 'Sold by'}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">
                      {isBn ? product.shop.nameBn : product.shop.nameEn}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{isBn ? 'ভেরিফাইড মার্চেন্ট' : 'Verified Merchant'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 text-xs rounded-xl h-8">
                  <Link href={`/${lang}/shops/${product.shop.id}`}>
                    <Store className="h-3.5 w-3.5 mr-1" />
                    <span>{isBn ? 'দোকান ভিজিট করুন' : 'Visit Shop'}</span>
                  </Link>
                </Button>
                {isAuthenticated && (
                  <StartChatButton
                    participantId={product.shop.sellerId}
                    lang={lang}
                    referenceId={product.id}
                    referenceType="PRODUCT"
                    buttonText={isBn ? 'মেসেজ দিন' : 'Chat'}
                    redirectPath={`/${lang}/messages`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Floating Order Bar */}
      <div className="lg:hidden fixed bottom-[56px] md:bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-md border-t border-border shadow-lg z-40 flex items-center justify-between gap-3">
        <div className="flex flex-col pl-1">
          <span className="text-[10px] text-muted-foreground font-semibold">{isBn ? 'মোট মূল্য' : 'Total'}</span>
          <span className="text-base font-black text-primary">৳{currentPrice * quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 text-xs font-bold rounded-xl border-primary/40 text-primary px-3"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            <span>{isBn ? 'কার্ট' : 'Cart'}</span>
          </Button>
          <Button
            size="sm"
            className="h-10 text-xs font-bold rounded-xl px-5 shadow-sm"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
          >
            <Zap className="h-3.5 w-3.5 fill-current mr-1" />
            <span>{isBn ? 'অর্ডার করুন' : 'Buy Now'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
