'use client';

import React, { use } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateQuantity, removeFromCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const dispatch = useDispatch();
  
  const items = useSelector((state: RootState) => state.cart.items);
  
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 50; // Mock flat shipping
  const total = subtotal + (items.length > 0 ? shipping : 0);

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center text-center space-y-6">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
        </h1>
        <p className="text-muted-foreground">
          {isBn ? 'আপনার কার্টে কোন পণ্য নেই। কেনাকাটা শুরু করুন।' : 'Looks like you haven\'t added any items yet.'}
        </p>
        <Link href={`/${lang}`}>
          <Button size="lg">{isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        {isBn ? 'শপিং কার্ট' : 'Shopping Cart'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.sellerProductId} className="overflow-hidden">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="sm:w-32 h-32 bg-muted relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image || 'https://via.placeholder.com/150'} 
                    alt={isBn ? item.nameBn : item.nameEn}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {isBn ? item.nameBn : item.nameEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isBn ? 'সেলার: ' : 'Seller: '}
                        {isBn ? item.sellerNameBn : item.sellerNameEn}
                      </p>
                    </div>
                    <p className="font-bold whitespace-nowrap ml-4">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center gap-3 border rounded-md px-2 py-1 bg-background">
                      <button 
                        className="p-1 hover:text-primary transition-colors disabled:opacity-50"
                        onClick={() => dispatch(updateQuantity({ sellerProductId: item.sellerProductId, quantity: Math.max(1, item.quantity - 1) }))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-4 text-center font-medium">{item.quantity}</span>
                      <button 
                        className="p-1 hover:text-primary transition-colors"
                        onClick={() => dispatch(updateQuantity({ sellerProductId: item.sellerProductId, quantity: item.quantity + 1 }))}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => dispatch(removeFromCart(item.sellerProductId))}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {isBn ? 'রিমুভ' : 'Remove'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {isBn ? 'অর্ডার সামারি' : 'Order Summary'}
              </h2>
              
              <div className="space-y-3 text-sm border-b pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                  <span className="font-medium">৳{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                  <span className="font-medium">৳{shipping}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>{isBn ? 'সর্বমোট' : 'Total'}</span>
                <span>৳{total}</span>
              </div>
              
              <Link href={`/${lang}/checkout`} className="block w-full">
                <Button className="w-full" size="lg">
                  {isBn ? 'চেকআউট করুন' : 'Proceed to Checkout'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
