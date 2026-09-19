'use client';

import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCartOpen, updateQuantity, removeFromCart } from '@/store/slices/cartSlice';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';

export function CartDrawer({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const dispatch = useDispatch();
  const { items, isOpen } = useSelector((state: RootState) => state.cart);

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => dispatch(setCartOpen(open))}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {isBn ? 'আপনার কার্ট' : 'Your Cart'} 
            <span className="text-muted-foreground text-sm font-normal">
              ({items.length} {isBn ? 'টি আইটেম' : 'items'})
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="bg-muted p-4 rounded-full">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-lg">{isBn ? 'আপনার কার্ট খালি' : 'Your cart is empty'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isBn ? 'কেনাকাটা শুরু করতে পণ্য যোগ করুন' : 'Add products to start shopping'}
              </p>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => dispatch(setCartOpen(false))}>
              {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 -mx-6 px-6 py-4 overflow-y-auto">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.sellerProductId} className="flex gap-4 py-2 border-b last:border-0 border-muted/50">
                    <div className="h-20 w-20 bg-muted/30 rounded-xl overflow-hidden flex-shrink-0 border p-1">
                      <img src={item.image} alt={isBn ? item.nameBn : item.nameEn} className="h-full w-full object-contain mix-blend-multiply rounded-lg" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                          {isBn ? item.nameBn : item.nameEn}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isBn ? item.sellerNameBn : item.sellerNameEn}
                        </p>
                      </div>
                      <div className="flex items-end justify-between mt-2">
                        <div className="font-bold text-primary">
                          ৳{item.price} <span className="text-xs text-muted-foreground font-normal">x {item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-muted/50 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => dispatch(updateQuantity({ sellerProductId: item.sellerProductId, quantity: Math.max(1, item.quantity - 1) }))}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => dispatch(updateQuantity({ sellerProductId: item.sellerProductId, quantity: item.maxQuantity ? Math.min(item.maxQuantity, item.quantity + 1) : item.quantity + 1 }))}
                              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors"
                            onClick={() => dispatch(removeFromCart(item.sellerProductId))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SheetFooter className="border-t pt-4 flex-col gap-4 sm:flex-col mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between w-full font-semibold text-lg">
                <span>{isBn ? 'সর্বমোট (আনুমানিক):' : 'Subtotal (Est):'}</span>
                <span className="text-primary text-xl">৳{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center bg-muted/30 p-2 rounded-lg">
                {isBn ? 'ডেলিভারি চার্জ চেকআউটে হিসাব করা হবে' : 'Delivery fee calculated at checkout'}
              </p>
              <div className="flex w-full gap-3 mt-2">
                <Button variant="secondary" className="flex-1 font-medium" asChild onClick={() => dispatch(setCartOpen(false))}>
                  <Link href={`/${lang}/cart`}>
                    {isBn ? 'কার্ট দেখুন' : 'View Cart'}
                  </Link>
                </Button>
                <Button className="flex-1 font-medium shadow-md" size="lg" asChild onClick={() => dispatch(setCartOpen(false))}>
                  <Link href={`/${lang}/checkout`}>
                    {isBn ? 'চেকআউট' : 'Checkout'}
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
