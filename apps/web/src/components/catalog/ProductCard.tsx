'use client';
import React from 'react';
import Link from 'next/link';
import { CustomImage } from '@/components/ui/CustomImage';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import type { SellerProduct } from '@/features/catalog/catalogApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetUserWishlistQuery, useAddProductToWishlistMutation, useRemoveProductFromWishlistMutation } from '@/features/wishlists/wishlistsApi';

interface ProductCardProps {
  product: SellerProduct;
  lang: string;
  flashSaleDiscountPrice?: number;
}

export function ProductCard({ product, lang, flashSaleDiscountPrice }: ProductCardProps) {
  const dispatch = useDispatch();
  const name = lang === 'bn' ? product.productVariant.nameBn || product.productVariant.product.nameBn : product.productVariant.nameEn || product.productVariant.product.nameEn;
  const image = product.productVariant.images?.[0] || '/placeholder.jpg';
  const price = Number(product.price);
  const discountPrice = flashSaleDiscountPrice ? Number(flashSaleDiscountPrice) : (product.discountPrice ? Number(product.discountPrice) : null);
  const slug = product.productVariant.product.slug;
  const currentPrice = discountPrice ?? price;
  const productId = product.productVariant.product.id;

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: wishlist } = useGetUserWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addToWishlist, { isLoading: isAddingWishlist }] = useAddProductToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] = useRemoveProductFromWishlistMutation();

  const isWishlisted = wishlist?.some(item => item.productId === productId);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product details
    if (!isAuthenticated) {
      toast.error(lang === 'bn' ? 'দয়া করে লগইন করুন' : 'Please login first');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId).unwrap();
        toast.success(lang === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
      } else {
        await addToWishlist(productId).unwrap();
        toast.success(lang === 'bn' ? 'উইশলিস্টে যোগ করা হয়েছে' : 'Added to wishlist');
      }
    } catch {
      toast.error(lang === 'bn' ? 'একটি ত্রুটি হয়েছে' : 'An error occurred');
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      sellerProductId: product.id,
      nameEn: product.productVariant.nameEn || product.productVariant.product.nameEn,
      nameBn: product.productVariant.nameBn || product.productVariant.product.nameBn,
      price: currentPrice,
      quantity: 1,
      image,
      maxQuantity: product.inventory.quantity,
    }));
    toast.success(lang === 'bn' ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border-border bg-card">
      <Link href={`/${lang}/products/${slug}`} className="block relative pt-[100%] overflow-hidden bg-muted/20">
        <CustomImage 
          src={image} 
          alt={name} 
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {discountPrice && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-sm z-10 shadow-sm uppercase tracking-wider">
            {lang === 'bn' ? 'ছাড়' : 'Sale'}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleWishlist}
          disabled={isAddingWishlist || isRemovingWishlist}
          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background/90 backdrop-blur-sm shadow-sm z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-primary text-primary' : 'text-foreground'}`} />
          <span className="sr-only">Wishlist</span>
        </Button>
      </Link>
      <CardContent className="p-4 flex-grow flex flex-col">
        <Link href={`/${lang}/products/${slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary transition-colors mb-1">
          {name}
        </Link>
        
        {/* Dynamic Average Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const avgRating = product.productVariant.product.averageRating || 0;
              return (
                <Star
                  key={star}
                  className={`h-3 w-3 ${star <= avgRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground opacity-20'}`}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-muted-foreground">
            ({product.productVariant.product.totalReviews || 0})
          </span>
        </div>

        <div className="mt-auto">
          {discountPrice ? (
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-base md:text-lg font-bold text-primary">৳{discountPrice}</span>
              <span className="text-xs text-muted-foreground line-through">৳{price}</span>
              {product.productVariant.product.unit && (
                <span className="text-xs text-muted-foreground">/ {product.productVariant.product.unit}</span>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-base md:text-lg font-bold text-foreground">৳{price}</span>
              {product.productVariant.product.unit && (
                <span className="text-xs text-muted-foreground">/ {product.productVariant.product.unit}</span>
              )}
            </div>
          )}
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">
            {lang === 'bn' ? 'দোকান: ' : 'Shop: '}
            <span className="font-medium text-foreground/80">{lang === 'bn' ? product.shop.nameBn : product.shop.nameEn}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full group-hover:bg-primary/90 transition-colors" 
          disabled={product.inventory.quantity <= 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.inventory.quantity > 0 ? (lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart') : (lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock')}
        </Button>
      </CardFooter>
    </Card>
  );
}
