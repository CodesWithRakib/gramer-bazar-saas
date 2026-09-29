'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { updateQuantity, removeFromCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Store, Minus, Plus } from 'lucide-react';
import { CustomImage } from '@/components/ui/CustomImage';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/format';

export default function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const dispatch = useDispatch();

  const { items } = useSelector((state: RootState) => state.cart);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="container max-w-4xl py-10">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-primary" />}
          title={isBn ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
          description={
            isBn
              ? 'পছন্দের পণ্য যোগ করলে সেটি এখানে দেখা যাবে। শুরু করতে ক্যাটাগরি ব্রাউজ করুন।'
              : 'Anything you add will show up here. Start by browsing our categories.'
          }
          action={{
            label: isBn ? 'কেনাকাটা শুরু করুন' : 'Start shopping',
            href: `/${lang}/categories`,
          }}
          secondaryAction={{
            label: isBn ? 'হোমে ফিরে যান' : 'Back to home',
            href: `/${lang}`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl space-y-8 py-8">
      <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
        <Link href={`/${lang}`}>
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue shopping'}
        </Link>
      </Button>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Cart Items */}
        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-baseline gap-2 border-b border-border/50 pb-3">
            <h1 className="text-2xl font-bold md:text-3xl">
              {isBn ? 'শপিং কার্ট' : 'Shopping Cart'}
            </h1>
            <span className="text-sm text-muted-foreground">
              {totalUnits} {isBn ? 'টি পণ্য' : 'item(s)'} • {items.length}{' '}
              {isBn ? 'টি এন্ট্রি' : 'line(s)'}
            </span>
          </div>

          <ul className="space-y-4">
            {items.map((item) => {
              const name = isBn ? item.nameBn : item.nameEn;
              const sellerName = isBn ? item.sellerNameBn : item.sellerNameEn;
              const atMax = item.maxQuantity ? item.quantity >= item.maxQuantity : false;

              return (
                <li key={item.sellerProductId}>
                  <Card className="overflow-hidden rounded-2xl border-border/70">
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-32">
                          <CustomImage
                            src={item.image}
                            alt={name}
                            width={128}
                            height={128}
                            sizes="128px"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/${lang}/products/${item.slug || item.sellerProductId}`}
                                className="hover:text-primary"
                              >
                                <h3 className="line-clamp-2 text-base font-semibold sm:text-lg">
                                  {name}
                                </h3>
                              </Link>
                              <span className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                <Store className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {isBn ? 'দোকান' : 'Shop'}:{' '}
                                  {sellerName || (isBn ? 'গ্রামের বাজার' : 'Gramer Bazar')}
                                </span>
                              </span>
                            </div>
                            <p className="text-lg font-bold text-primary sm:text-xl">
                              {formatCurrency(item.price)}
                            </p>
                          </div>

                          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                            <div className="flex items-center rounded-lg border border-input">
                              <button
                                type="button"
                                aria-label={`${isBn ? name + ' পরিমাণ কমান' : `Decrease quantity of ${name}`}`}
                                className="flex h-9 w-9 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onClick={() =>
                                  dispatch(
                                    updateQuantity({
                                      sellerProductId: item.sellerProductId,
                                      quantity: Math.max(1, item.quantity - 1),
                                    })
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span
                                aria-live="polite"
                                className="w-10 text-center text-sm font-semibold"
                              >
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`${isBn ? name + ' পরিমাণ বাড়ান' : `Increase quantity of ${name}`}`}
                                className="flex h-9 w-9 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                disabled={atMax}
                                onClick={() =>
                                  dispatch(
                                    updateQuantity({
                                      sellerProductId: item.sellerProductId,
                                      quantity: item.maxQuantity
                                        ? Math.min(item.maxQuantity, item.quantity + 1)
                                        : item.quantity + 1,
                                    })
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-sm text-muted-foreground">
                                <span className="hidden sm:inline">{isBn ? 'মোট' : 'Total'}: </span>
                                <span className="font-semibold text-foreground">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                aria-label={
                                  isBn ? `${name} কার্ট থেকে সরান` : `Remove ${name} from cart`
                                }
                                onClick={() => dispatch(removeFromCart(item.sellerProductId))}
                              >
                                <Trash2 className="me-2 h-4 w-4" />
                                {isBn ? 'মুছুন' : 'Remove'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-[350px] lg:w-[400px]">
          <Card className="sticky top-24 rounded-2xl border-border/70">
            <CardContent className="p-5 sm:p-6">
              <h2 className="mb-5 border-b border-border/60 pb-4 text-lg font-bold">
                {isBn ? 'অর্ডারের সারসংক্ষেপ' : 'Order summary'}
              </h2>

              <div className="mb-5 space-y-4">
                <div className="flex justify-between gap-3 text-muted-foreground">
                  <span>{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                  <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-3 text-muted-foreground">
                  <span>{isBn ? 'ডেলিভারি চার্জ' : 'Delivery fee'}</span>
                  <span className="text-sm italic">
                    {isBn ? 'পরের ধাপে হিসাব হবে' : 'Calculated next step'}
                  </span>
                </div>
                <div className="flex justify-between gap-3 border-t border-border/60 pt-4 text-base font-bold">
                  <span>{isBn ? 'মোট (আনুমানিক)' : 'Estimated total'}</span>
                  <span className="text-primary">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <Button size="lg" className="w-full gap-2 rounded-xl" asChild>
                <Link href={`/${lang}/customer/checkout`}>
                  {isBn ? 'চেকআউটে যান' : 'Proceed to checkout'}
                  <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" />
                </Link>
              </Button>

              <p className="mt-4 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
                {isBn
                  ? 'ক্যাশ অন ডেলিভারি ও নিরাপদ পেমেন্ট সুবিধা'
                  : 'Cash on delivery and secure online payment'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
