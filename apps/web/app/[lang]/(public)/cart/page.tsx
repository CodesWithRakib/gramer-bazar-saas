'use client';
import { use } from 'react';

import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { updateQuantity, removeFromCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { CustomImage } from '@/components/ui/CustomImage';

export default function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const dispatch = useDispatch();
  
  const { items } = useSelector((state: RootState) => state.cart);
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <div className="container max-w-4xl py-16 text-center space-y-6 flex flex-col items-center">
        <div className="bg-muted p-8 rounded-full">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">{isBn ? 'আপনার কার্ট সম্পূর্ণ খালি!' : 'Your cart is completely empty!'}</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {isBn 
              ? 'আমাদের অসংখ্য পণ্য থেকে আপনার পছন্দের জিনিসগুলো বেছে নিন এবং কেনাকাটা শুরু করুন।' 
              : 'Browse our extensive catalog and add your favorite items to start shopping.'}
          </p>
        </div>
        <Button size="lg" asChild className="mt-8">
          <Link href={`/${lang}`}>{isBn ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href={`/${lang}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isBn ? 'ফিরে যান' : 'Back to Shopping'}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl font-bold">{isBn ? 'শপিং কার্ট' : 'Shopping Cart'} ({items.length} {isBn ? 'টি আইটেম' : 'items'})</h1>
          
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.sellerProductId} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
                    <div className="h-24 w-24 sm:h-32 sm:w-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <CustomImage
                        src={item.image}
                        alt={isBn ? item.nameBn : item.nameEn}
                        width={128}
                        height={128}
                        sizes="128px"
                        className="h-full w-full object-cover mix-blend-multiply"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link href={`/${lang}/products/${item.sellerProductId}`} className="hover:underline">
                            <h3 className="font-semibold text-lg line-clamp-2">
                              {isBn ? item.nameBn : item.nameEn}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isBn ? 'সেলার:' : 'Seller:'} {isBn ? item.sellerNameBn : item.sellerNameEn}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-primary">৳{item.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t">
                        <div className="flex items-center border rounded-md">
                          <button
                            className="px-3 py-1.5 text-muted-foreground hover:bg-muted font-medium transition-colors"
                            onClick={() => dispatch(updateQuantity({ sellerProductId: item.sellerProductId, quantity: Math.max(1, item.quantity - 1) }))}
                          >
                            -
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            className="px-3 py-1.5 text-muted-foreground hover:bg-muted font-medium transition-colors"
                            onClick={() => dispatch(updateQuantity({ sellerProductId: item.sellerProductId, quantity: item.quantity + 1 }))}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-muted-foreground hidden sm:block">
                            {isBn ? 'মোট:' : 'Total:'} <span className="text-foreground">৳{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => dispatch(removeFromCart(item.sellerProductId))}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isBn ? 'মুছে ফেলুন' : 'Remove'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-[350px] lg:w-[400px]">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b">
                {isBn ? 'অর্ডারের সারসংক্ষেপ' : 'Order Summary'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>{isBn ? 'সর্বমোট' : 'Subtotal'}</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{isBn ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
                  <span className="text-sm italic">{isBn ? 'পরবর্তী ধাপে হিসাব করা হবে' : 'Calculated next step'}</span>
                </div>
                <div className="pt-4 border-t flex justify-between font-bold text-lg">
                  <span>{isBn ? 'মোট (আনুমানিক)' : 'Estimated Total'}</span>
                  <span className="text-primary">৳{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Button size="lg" className="w-full" asChild>
                <Link href={`/${lang}/customer/checkout`}>
                  {isBn ? 'চেকআউটে যান' : 'Proceed to Checkout'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
                {isBn 
                  ? 'নিরাপদ পেমেন্ট এবং দ্রুত ডেলিভারির নিশ্চয়তা' 
                  : 'Secure payments and fast delivery guaranteed'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
