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
import { Trash2, ShoppingBag } from 'lucide-react';

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
                  <div key={item.sellerProductId} className="flex gap-4">
                    <div className="h-20 w-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={isBn ? item.nameBn : item.nameEn} className="h-full w-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {isBn ? item.nameBn : item.nameEn}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isBn ? item.sellerNameBn : item.sellerNameEn}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="font-semibold text-primary">
                          ৳{item.price}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded-md">
                            <button
                              className="px-2 py-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
                              onClick={() => dispatch(updateQuantity({ sellerProductId: item.sellerProductId, quantity: Math.max(1, item.quantity - 1) }))}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              className="px-2 py-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
                              onClick={() => dispatch(updateQuantity({ sellerProductId: item.sellerProductId, quantity: item.maxQuantity ? Math.min(item.maxQuantity, item.quantity + 1) : item.quantity + 1 }))}
                              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                            >
                              +
                            </button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
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

            <SheetFooter className="border-t pt-4 flex-col gap-4 sm:flex-col">
              <div className="flex items-center justify-between w-full font-medium text-lg">
                <span>{isBn ? 'সর্বমোট (আনুমানিক):' : 'Subtotal (Est):'}</span>
                <span className="text-primary">৳{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {isBn ? 'ডেলিভারি চার্জ চেকআউটে হিসাব করা হবে' : 'Delivery fee calculated at checkout'}
              </p>
              <div className="flex w-full gap-2 mt-2">
                <Button variant="outline" className="flex-1" asChild onClick={() => dispatch(setCartOpen(false))}>
                  <Link href={`/${lang}/cart`}>
                    {isBn ? 'কার্ট দেখুন' : 'View Cart'}
                  </Link>
                </Button>
                <Button className="flex-1" size="lg" asChild onClick={() => dispatch(setCartOpen(false))}>
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
