'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Store, ShieldCheck, Truck, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { SellerProduct, useGetRelatedProductsQuery } from '@/features/catalog/catalogApi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import { useGetUserWishlistQuery, useAddProductToWishlistMutation, useRemoveProductFromWishlistMutation } from '@/features/wishlists/wishlistsApi';
import { useGetProductReviewsQuery, useAddReviewMutation } from '@/features/reviews/reviewsApi';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

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

  if (!products || products.length === 0) {
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

  // Currently we just select from the array of SellerProducts
  // In a real scenario with complex variants, you'd group by variant attributes.
  const product = products[selectedVariantIdx];
  const name = isBn ? product.productVariant.nameBn || product.productVariant.product.nameBn : product.productVariant.nameEn || product.productVariant.product.nameEn;
  const image = product.productVariant.images?.[0] || 'https://placehold.co/800x800?text=No+Image';
  const price = Number(product.price);
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const currentPrice = discountPrice ?? price;
  const stock = product.inventory?.quantity || 0;
  const isOutOfStock = stock <= 0;

  const { data: relatedProducts } = useGetRelatedProductsQuery(product.productVariant.product.slug);
  const { data: reviewsResponse, refetch: refetchReviews } = useGetProductReviewsQuery(product.productVariant.product.id);
  
  // Auth state
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  // Wishlist hooks
  const { data: wishlist } = useGetUserWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addToWishlist, { isLoading: isAddingWishlist }] = useAddProductToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemovingWishlist }] = useRemoveProductFromWishlistMutation();

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
    } catch (error) {
      toast.error(isBn ? 'একটি ত্রুটি হয়েছে' : 'An error occurred');
    }
  };

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [addReview, { isLoading: isAddingReview }] = useAddReviewMutation();

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) return;
    try {
      await addReview({ productId: product.productVariant.product.id, rating, comment }).unwrap();
      toast.success(isBn ? 'রিভিউ জমা দেওয়া হয়েছে' : 'Review submitted successfully');
      setComment('');
      refetchReviews();
    } catch (error: any) {
      toast.error(error?.data?.message || (isBn ? 'রিভিউ জমা দিতে সমস্যা হয়েছে' : 'Failed to submit review'));
    }
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      sellerProductId: product.id,
      quantity,
      price: currentPrice,
      nameEn: product.productVariant.nameEn || product.productVariant.product.nameEn,
      nameBn: product.productVariant.nameBn || product.productVariant.product.nameBn,
      image,
      sellerNameEn: product.shop.nameEn,
      sellerNameBn: product.shop.nameBn,
    }));
    toast.success(isBn ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3 text-muted-foreground">
        <Link href={`/${lang}/search`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isBn ? 'ফিরে যান' : 'Back to Search'}
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="bg-muted rounded-xl overflow-hidden aspect-square flex items-center justify-center p-4">
            <img src={image} alt={name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
          </div>
          {product.productVariant.images && product.productVariant.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.productVariant.images.map((img, idx) => (
                <div key={idx} className="w-20 h-20 bg-muted rounded-md flex-shrink-0 border overflow-hidden">
                  <img src={img} className="w-full h-full object-cover mix-blend-multiply" alt="Thumbnail" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm text-primary font-medium">
            <Link href={`/${lang}/categories/${product.productVariant.product.category.slug}`} className="hover:underline">
              {isBn ? product.productVariant.product.category.nameBn : product.productVariant.product.category.nameEn}
            </Link>
          </div>
          
          <div className="flex justify-between items-start mb-4 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">{name}</h1>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full shrink-0 ${isWishlisted ? 'text-red-500 border-red-200 bg-red-50' : 'text-muted-foreground'}`}
              onClick={toggleWishlist}
              disabled={isAddingWishlist || isRemovingWishlist}
            >
              <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            {discountPrice ? (
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">৳{discountPrice}</span>
                <span className="text-xl text-muted-foreground line-through mb-1">৳{price}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">৳{price}</span>
            )}
          </div>

          {/* Variations (if multiple sellers or variants exist) */}
          {products.length > 1 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">{isBn ? 'অন্যান্য বিকল্প' : 'Other Options'}</h3>
              <div className="flex flex-wrap gap-2">
                {products.map((p, idx) => {
                  const pName = isBn ? p.productVariant.nameBn || p.productVariant.product.nameBn : p.productVariant.nameEn || p.productVariant.product.nameEn;
                  const pSeller = isBn ? p.shop.nameBn : p.shop.nameEn;
                  const pPrice = p.discountPrice || p.price;
                  return (
                    <Button 
                      key={p.id} 
                      variant={selectedVariantIdx === idx ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedVariantIdx(idx);
                        setQuantity(1); // reset quantity on variant change
                      }}
                      className="flex flex-col items-start h-auto py-2"
                    >
                      <span>{pName}</span>
                      <span className="text-xs opacity-80">{pSeller} - ৳{pPrice}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-full">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground">{isBn ? 'বিক্রেতা' : 'Seller'}</p>
                <p className="font-medium">{isBn ? product.shop.nameBn : product.shop.nameEn}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-full">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{isBn ? 'খাঁটি পণ্যের নিশ্চয়তা' : 'Authentic Product Guarantee'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-full">
                <Truck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{isBn ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</p>
                <p className="text-muted-foreground">{isBn ? 'খানসামা উপজেলা জুড়ে' : 'Across Khansama Upazila'}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">{isBn ? 'পরিমাণ:' : 'Quantity:'}</span>
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >-</Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                  disabled={quantity >= stock || isOutOfStock}
                >+</Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {isOutOfStock ? (isBn ? 'স্টক শেষ' : 'Out of Stock') : (isBn ? `${stock} টি স্টকে আছে` : `${stock} available`)}
              </span>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg h-14 rounded-xl" 
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

      {/* Reviews Section */}
      <div className="mt-12 bg-card p-6 md:p-8 rounded-2xl border shadow-sm">
        <h2 className="text-2xl font-bold mb-6">{isBn ? 'গ্রাহকদের মতামত' : 'Customer Reviews'}</h2>
        
        {isAuthenticated && (
          <div className="mb-8 p-4 border rounded-xl bg-muted/30">
            <h3 className="font-semibold mb-4">{isBn ? 'মতামত লিখুন' : 'Write a Review'}</h3>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`} />
                </button>
              ))}
            </div>
            <Textarea 
              placeholder={isBn ? 'আপনার অভিজ্ঞতা শেয়ার করুন...' : 'Share your experience...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-4 bg-background"
            />
            <Button onClick={handleReviewSubmit} disabled={isAddingReview}>
              {isAddingReview ? (isBn ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...') : (isBn ? 'জমা দিন' : 'Submit Review')}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {isBn ? 'বিঃদ্রঃ শুধুমাত্র যারা পণ্যটি কিনেছেন তারাই রিভিউ দিতে পারবেন।' : 'Note: Only customers who have purchased this product can leave a review.'}
            </p>
          </div>
        )}

        {reviewsResponse && reviewsResponse.data && reviewsResponse.data.length > 0 ? (
          <div className="space-y-6">
            {reviewsResponse.data.map(review => (
              <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="font-medium ml-2">{review.user?.name || 'Anonymous'}</span>
                </div>
                {review.comment && <p className="text-muted-foreground mt-2">{review.comment}</p>}
                <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{isBn ? 'এখনও কোন মতামত নেই।' : 'No reviews yet.'}</p>
        )}
      </div>

      {/* Related Products Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">{isBn ? 'সংশ্লিষ্ট পণ্য' : 'Related Products'}</h2>
        {relatedProducts && relatedProducts.length > 0 ? (
          <ProductGrid products={relatedProducts} isLoading={false} lang={lang} />
        ) : (
          <p className="text-muted-foreground">{isBn ? 'কোন সংশ্লিষ্ট পণ্য পাওয়া যায়নি।' : 'No related products found.'}</p>
        )}
      </div>
    </div>
  );
}
