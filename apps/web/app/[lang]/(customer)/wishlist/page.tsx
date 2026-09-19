'use client';

import React, { use } from 'react';
import { useGetUserWishlistQuery, useRemoveProductFromWishlistMutation } from '@/features/wishlists/wishlistsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function WishlistPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: wishlist, isLoading } = useGetUserWishlistQuery();
  const [remove] = useRemoveProductFromWishlistMutation();

  const handleRemove = async (productId: string) => {
    try {
      await remove(productId).unwrap();
      toast.success(isBn ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist');
    } catch {
      toast.error(isBn ? 'একটি ত্রুটি হয়েছে' : 'Error removing item');
    }
  };

  if (isLoading) return <div className="container mx-auto p-8">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{isBn ? 'আমার উইশলিস্ট' : 'My Wishlist'}</h1>
      
      {!wishlist || wishlist.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {isBn ? 'আপনার উইশলিস্ট খালি।' : 'Your wishlist is empty.'}
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href={`/${lang}`}>{isBn ? 'শপিং চালিয়ে যান' : 'Continue Shopping'}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href={`/${lang}/products/${item.product.slug}`} className="hover:underline">
                    {isBn ? item.product.nameBn : item.product.nameEn}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="mb-4">
                  {item.product.isAvailable ? (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      {isBn ? 'স্টকে আছে' : 'In Stock'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20">
                      {isBn ? 'স্টক শেষ' : 'Out of Stock'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button 
                    className="flex-1" 
                    disabled={!item.product.isAvailable}
                    asChild
                  >
                    <Link href={`/${lang}/products/${item.product.slug}`}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {isBn ? 'পণ্যটি দেখুন' : 'View Product'}
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleRemove(item.productId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
