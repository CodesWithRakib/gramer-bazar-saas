/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Truck, Star, Heart, Share2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { SellerProduct, useGetRelatedProductsQuery } from '@/features/catalog/catalogApi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { useGetUserWishlistQuery, useAddProductToWishlistMutation, useRemoveProductFromWishlistMutation } from '@/features/wishlists/wishlistsApi';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomImage } from '@/components/ui/CustomImage';
import { StartChatButton } from '@/components/chat/StartChatButton';

export function ProductDetailsClient({ 
  products, 
  lang 
}: { 
  products: SellerProduct[], 
  lang: string 
}) {
  const isBn = lang === 'bn';
  const dispatch = useDispatch();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const product = products?.[selectedVariantIdx];
  const images = product?.productVariant.images?.length
    ? product.productVariant.images
    : ['/placeholder.jpg'];

  // Hooks must run unconditionally, before any early return.
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
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { data: wishlist } = useGetUserWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [addToWishlist, { isLoading: isAddingWishlist }] =
    useAddProductToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] =
    useRemoveProductFromWishlistMutation();

  if (!products || products.length === 0 || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{isBn ? 'পণ্য পাওয়া যায়নি' : 'Product not found'}</h1>
        <p className="text-muted-foreground mb-6">
          {isBn ? 'আপনি যে পণ্যটি খুঁজছেন তা বর্তমানে স্টকে নেই বা সরিয়ে নেওয়া হয়েছে।' : 'The product you are looking for is currently out of stock or has been removed.'}
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

  const name = isBn ? product.productVariant.nameBn || product.productVariant.product.nameBn : product.productVariant.nameEn || product.productVariant.product.nameEn;
  const description = isBn ? product.productVariant.product.descriptionBn : product.productVariant.product.descriptionEn;

  const price = Number(product.price);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const currentPrice = discountPrice ?? price;
  const stock = product.inventory?.quantity || 0;
  const isOutOfStock = stock <= 0;

  const isWishlisted = wishlist?.some(item => item.productId === product.productVariant.product.id);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error(isBn ? 'দয়া করে লগইন করুন' : 'Please login first');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.productVariant.product.id).unwrap();
        toast.success(isBn ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(product.productVariant.product.id).unwrap();
        toast.success(isBn ? 'উইশলিস্টে যোগ করা হয়েছে' : 'Added to wishlist');
      }
    } catch {
      toast.error(isBn ? 'একটি ত্রুটি হয়েছে' : 'An error occurred');
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      sellerProductId: product.id,
      quantity,
      price: currentPrice,
      nameEn: product.productVariant.nameEn || product.productVariant.product.nameEn,
      nameBn: product.productVariant.nameBn || product.productVariant.product.nameBn,
      image: activeImage,
      sellerNameEn: product.shop.nameEn,
      sellerNameBn: product.shop.nameBn,
    }));
    toast.success(isBn ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  return (
    <div className="bg-muted/10 min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center text-sm text-muted-foreground mb-6 gap-2">
          <Link href={`/${lang}`} className="hover:text-primary transition-colors">
            {isBn ? 'হোম' : 'Home'}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/${lang}/search`} className="hover:text-primary transition-colors">
            {isBn ? 'পণ্য' : 'Products'}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/${lang}/categories/${product.productVariant.product.category.slug}`} className="hover:text-primary transition-colors">
            {isBn ? product.productVariant.product.category.nameBn : product.productVariant.product.category.nameEn}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          
          {/* LEFT COLUMN: Images, Description, Tabs, Reviews */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            
            {/* Main Image Gallery Card */}
            <div className="bg-background rounded-3xl p-6 shadow-sm border overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
                {images.length > 1 && (
                  <div className="flex md:flex-col gap-3 overflow-auto hide-scrollbar order-2 md:order-1 max-h-[500px]">
                    {images.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImage(img)}
                        className={`relative w-20 h-20 bg-muted rounded-xl flex-shrink-0 border-2 overflow-hidden transition-all duration-300 ${activeImage === img ? 'border-primary ring-4 ring-primary/20 ring-offset-2 scale-105' : 'border-transparent hover:border-primary/50'}`}
                      >
                        <CustomImage 
                          src={img} 
                          fill 
                          sizes="80px"
                          className="object-cover mix-blend-multiply" 
                          alt={`Thumbnail ${idx + 1}`} 
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Active Image with Zoom */}
                <div 
                  ref={imageContainerRef}
                  className="bg-muted/50 rounded-2xl overflow-hidden aspect-square flex-1 flex items-center justify-center p-4 relative group cursor-zoom-in order-1 md:order-2 w-full"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <CustomImage 
                    src={activeImage} 
                    alt={name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain p-8 mix-blend-multiply transition-transform duration-200 ease-out" 
                    priority
                    style={zoomStyle}
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <span className="bg-destructive text-destructive-foreground font-bold px-8 py-3 rounded-full text-xl shadow-2xl rotate-12">
                        {isBn ? 'স্টক শেষ' : 'SOLD OUT'}
                      </span>
                    </div>
                  )}
                  {/* Share and Wishlist overlay buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full shadow-md hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(window.location.href);
                        toast.success(isBn ? 'লিঙ্ক কপি করা হয়েছে' : 'Link copied to clipboard');
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label={
                        isWishlisted
                          ? isBn ? 'উইশলিস্ট থেকে সরান' : 'Remove from wishlist'
                          : isBn ? 'উইশলিস্টে যোগ করুন' : 'Add to wishlist'
                      }
                      className={`rounded-full shadow-md hover:scale-110 transition-transform ${isWishlisted ? 'text-red-500' : 'text-muted-foreground'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist();
                      }}
                      disabled={isAddingWishlist || isRemovingWishlist}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="bg-background rounded-3xl p-6 shadow-sm border">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/50 rounded-xl p-1">
                  <TabsTrigger value="details" className="rounded-lg text-base font-medium">{isBn ? 'বিস্তারিত' : 'Details'}</TabsTrigger>
                  <TabsTrigger value="seller" className="rounded-lg text-base font-medium">{isBn ? 'বিক্রেতা ও শিপিং' : 'Seller & Shipping'}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-bold mb-4">{isBn ? 'পণ্যের বিবরণ' : 'Product Description'}</h3>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {description}
                  </div>
                </TabsContent>
                
                <TabsContent value="seller" className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                  {/* Seller Card */}
                  <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-2xl border border-primary/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-sm">
                          <Store className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">{isBn ? 'সেলার' : 'Sold by'}</p>
                          <h4 className="font-bold text-xl text-foreground">{isBn ? product.shop.nameBn : product.shop.nameEn}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p className="text-sm text-green-700 font-medium">{isBn ? 'ভেরিফাইড মার্চেন্ট' : 'Verified Merchant'}</p>
                          </div>
                        </div>
                      </div>
                      {isAuthenticated && (
                        <StartChatButton 
                          participantId={product.shop.sellerId} 
                          lang={lang} 
                          referenceId={product.id}
                          referenceType="PRODUCT"
                          buttonText={isBn ? 'মেসেজ দিন' : 'Message Seller'} 
                          redirectPath={`/${lang}/messages`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border">
                      <div className="bg-background p-3 rounded-xl shadow-sm">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{isBn ? 'খাঁটি পণ্যের নিশ্চয়তা' : 'Authentic Guarantee'}</p>
                        <p className="text-sm text-muted-foreground">{isBn ? '১০০% আসল পণ্য' : '100% genuine product'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border">
                      <div className="bg-background p-3 rounded-xl shadow-sm">
                        <Truck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</p>
                        <p className="text-sm text-muted-foreground">{isBn ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ' : 'Pay when you receive'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Reviews Section */}
            <div id="product-reviews" className="bg-background rounded-3xl shadow-sm border p-6">
              <ProductReviews productId={product.productVariant.product.id} isBn={isBn} lang={lang} />
            </div>
            
            {/* Related Products */}
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-6">{isBn ? 'সংশ্লিষ্ট পণ্য' : 'Related Products'}</h2>
              {relatedProducts && relatedProducts.length > 0 ? (
                <ProductGrid products={relatedProducts} isLoading={false} lang={lang} />
              ) : (
                <p className="text-muted-foreground bg-background p-6 rounded-2xl text-center border">{isBn ? 'কোন সংশ্লিষ্ট পণ্য পাওয়া যায়নি।' : 'No related products found.'}</p>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Buy Box */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 flex flex-col gap-6">
              
              <div className="bg-background rounded-3xl p-6 lg:p-8 shadow-xl shadow-primary/5 border flex flex-col">
                
                {/* Title and Ratings */}
                <div className="mb-6">
                  <h1 className="text-2xl lg:text-3xl font-bold leading-tight mb-3">{name}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <div 
                      className="flex items-center gap-1 cursor-pointer hover:bg-muted p-1.5 -ml-1.5 rounded-lg transition-colors" 
                      onClick={() => {
                        const reviewSection = document.getElementById('product-reviews');
                        if(reviewSection) {
                          const y = reviewSection.getBoundingClientRect().top + window.scrollY - 80;
                          window.scrollTo({top: y, behavior: 'smooth'});
                        }
                      }}
                    >
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold ml-1">{Number(product.productVariant.product.averageRating || 0).toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground underline decoration-dotted">
                        ({product.productVariant.product.totalReviews || 0} {isBn ? 'রিভিউ' : 'reviews'})
                      </span>
                    </div>
                    <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {isBn ? product.shop.nameBn : product.shop.nameEn}
                    </p>
                  </div>
                </div>
                
                {/* Price Section */}
                <div className="bg-muted/40 p-5 rounded-2xl mb-6">
                  {discountPrice ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-black text-primary">৳{discountPrice}</span>
                        <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md text-sm mb-1 animate-pulse">
                          -{Math.round(((price - discountPrice) / price) * 100)}%
                        </span>
                      </div>
                      <span className="text-lg text-muted-foreground line-through">৳{price}</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-black text-primary">৳{price}</span>
                  )}
                </div>

                {/* Variations */}
                {products.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3">{isBn ? 'বিকল্পসমূহ:' : 'Options:'}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {products.map((p, idx) => {
                        const pName = isBn ? p.productVariant.nameBn || p.productVariant.product.nameBn : p.productVariant.nameEn || p.productVariant.product.nameEn;
                        const pPrice = p.discountPrice || p.price;
                        const isSelected = selectedVariantIdx === idx;
                        return (
                          <button 
                            key={p.id} 
                            onClick={() => {
                              setSelectedVariantIdx(idx);
                              setQuantity(1);
                            }}
                            className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-muted hover:border-primary/40'}`}
                          >
                            <span className={`text-sm font-medium line-clamp-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>{pName}</span>
                            <span className="text-xs font-bold mt-1">৳{pPrice}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">{isBn ? 'পরিমাণ:' : 'Quantity:'}</span>
                    <span className={`text-xs font-bold ${isOutOfStock ? 'text-destructive' : stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                      {isOutOfStock ? (isBn ? 'স্টক শেষ' : 'Out of Stock') : (isBn ? `${stock} টি স্টকে আছে` : `${stock} available`)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-muted/30 border rounded-xl p-1">
                    <Button 
                      variant="ghost" 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="h-10 w-12 rounded-lg"
                    >-</Button>
                    <span className="text-lg font-bold w-12 text-center">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                      disabled={quantity >= stock || isOutOfStock}
                      className="h-10 w-12 rounded-lg"
                    >+</Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-auto">
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20 transition-transform active:scale-[0.98] hover:-translate-y-0.5" 
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                  >
                    {isOutOfStock 
                      ? (isBn ? 'স্টক শেষ' : 'Out of Stock') 
                      : (isBn ? 'কার্টে যোগ করুন' : 'Add to Cart')}
                  </Button>
                </div>
                
              </div>
              
            </div>
          </div>
          
        </div>
      </div>

      {/* Mobile Sticky Add to Cart Footer (only visible on mobile) */}
      <div className="lg:hidden fixed bottom-[60px] md:bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">{isBn ? 'মোট মূল্য' : 'Total Price'}</span>
          <span className="text-lg font-black text-primary">৳{currentPrice * quantity}</span>
        </div>
        <Button 
          size="lg" 
          className="px-8 text-base h-12 rounded-xl shadow-lg transition-transform active:scale-[0.98]" 
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          {isOutOfStock 
            ? (isBn ? 'স্টক শেষ' : 'Out of Stock') 
            : (isBn ? 'কার্টে যোগ করুন' : 'Add to Cart')}
        </Button>
      </div>

    </div>
  );
}
