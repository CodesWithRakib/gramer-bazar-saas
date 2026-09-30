'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { clearCart, applyCoupon, removeCoupon } from '@/store/slices/cartSlice';
import { useGetAddressesQuery } from '@/features/addresses/addressApi';
import { AddressForm } from '@/components/profile/AddressForm';
import { CouponInput } from '@/components/coupons/CouponInput';
import { useCheckoutOrderMutation } from '@/features/orders/ordersApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCurrency } from '@/lib/format';
import { getCheckoutTotals } from '@/lib/checkout';
import { CheckCircle2, Plus, MapPin, CreditCard, ShoppingBag, Tag } from 'lucide-react';

export default function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  const dispatch = useDispatch();

  const { items, appliedCoupon } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const totals = getCheckoutTotals(subtotal, appliedCoupon?.discountAmount ?? 0);
  const { subtotal: sub, discount, deliveryFee, total } = totals;

  const { data: addresses, isLoading: isAddressesLoading } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [checkoutOrder, { isLoading: isCheckingOut }] = useCheckoutOrderMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lang}/login?redirect=/${lang}/customer/checkout`);
    } else if (items.length === 0) {
      router.push(`/${lang}/cart`);
    }
  }, [isAuthenticated, items.length, router, lang]);

  // Derived state (React-sanctioned): pick a default address / open the form
  // the moment the address list arrives.
  if (addresses && addresses.length > 0 && !selectedAddressId) {
    const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
    setSelectedAddressId(defaultAddress.id);
  } else if (addresses && addresses.length === 0 && !showAddressForm) {
    setShowAddressForm(true);
  }

  if (!isAuthenticated || items.length === 0) return null;

  const hasSavedAddresses = Boolean(addresses && addresses.length > 0);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setErrorMsg(
        isBn ? 'দয়া করে একটি ডেলিভারি ঠিকানা নির্বাচন করুন' : 'Please select a delivery address'
      );
      return;
    }

    try {
      setErrorMsg('');
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod,
        items: items.map((item) => ({
          sellerProductId: item.sellerProductId,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.code,
        lang,
      };

      const res = await checkoutOrder(orderData).unwrap();
      dispatch(clearCart());
      if (res.paymentUrl) {
        setIsRedirecting(true);
        window.location.href = res.paymentUrl;
      } else {
        router.push(`/${lang}/customer/orders/${res.order.id}?success=true`);
      }
    } catch (err) {
      setIsRedirecting(false);
      setErrorMsg(
        getApiErrorMessage(err, isBn ? 'অর্ডার তৈরি করা যায়নি' : 'Could not place your order')
      );
    }
  };

  const cta = (
    <>
      {isRedirecting
        ? isBn
          ? 'পেমেন্ট পেজে যাওয়া হচ্ছে...'
          : 'Redirecting to payment...'
        : isCheckingOut
          ? isBn
            ? 'প্রক্রিয়াধীন...'
            : 'Processing...'
          : paymentMethod === 'ONLINE'
            ? isBn
              ? 'অর্ডার করুন ও পেমেন্ট করুন'
              : 'Place order & pay'
            : isBn
              ? 'অর্ডার নিশ্চিত করুন'
              : 'Confirm order'}
    </>
  );

  return (
    <div className="container max-w-6xl space-y-8 pb-32 pt-8 lg:pb-16">
      <div className="border-b border-border/50 pb-4">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isBn ? 'চেকআউট' : 'Checkout'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isBn
            ? 'ঠিকানা ও পেমেন্ট পদ্ধতি নিশ্চিত করে আপনার অর্ডার সম্পন্ন করুন।'
            : 'Confirm your address and payment method to place the order.'}
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        >
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          {/* Delivery Address */}
          <Card className="overflow-hidden rounded-2xl border-border/70">
            <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                {isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {isAddressesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-10 w-40 rounded-xl" />
                </div>
              ) : (
                <div className="space-y-4">
                  {hasSavedAddresses && !showAddressForm && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {addresses?.map((address) => (
                        <div key={address.id} className="relative">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            id={`addr-${address.id}`}
                            className="peer sr-only"
                            checked={selectedAddressId === address.id}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                          />
                          <Label htmlFor={`addr-${address.id}`}>
                            <div className="flex flex-col gap-1 rounded-xl border-2 border-input p-4 transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5">
                              <span className="font-semibold">
                                {address.title}{' '}
                                {address.isDefault && (
                                  <span className="ms-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                                    {isBn ? 'ডিফল্ট' : 'Default'}
                                  </span>
                                )}
                              </span>
                              <span className="text-sm">
                                {address.contactName} ({address.contactPhone})
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {address.streetAddress}
                              </span>
                              {address.lat != null && address.lng != null && (
                                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                  <MapPin className="h-3 w-3" />
                                  {isBn ? 'জিপিএস পিন করা আছে' : 'GPS pinned'}
                                </span>
                              )}
                            </div>
                          </Label>
                          {selectedAddressId === address.id && (
                            <CheckCircle2 className="absolute end-4 top-4 h-5 w-5 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!showAddressForm && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressForm(true)}
                      className="rounded-xl"
                    >
                      <Plus className="me-2 h-4 w-4" />
                      {isBn ? 'নতুন ঠিকানা যোগ করুন' : 'Add new address'}
                    </Button>
                  )}

                  {showAddressForm && (
                    <div className="rounded-xl border border-border/70 bg-card p-4">
                      <h4 className="mb-4 font-semibold">{isBn ? 'নতুন ঠিকানা' : 'New address'}</h4>
                      <AddressForm
                        isBn={isBn}
                        onSuccess={() => setShowAddressForm(false)}
                        onCancel={hasSavedAddresses ? () => setShowAddressForm(false) : undefined}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="overflow-hidden rounded-2xl border-border/70">
            <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                {isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment method'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    id="cod"
                    className="peer sr-only"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label
                    htmlFor="cod"
                    className="flex h-full flex-col gap-1 rounded-xl border-2 border-input p-4 transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring cursor-pointer"
                  >
                    <span className="font-semibold">
                      {isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on delivery'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {isBn
                        ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন'
                        : 'Pay when you receive the product'}
                    </span>
                  </label>
                  {paymentMethod === 'COD' && (
                    <CheckCircle2 className="absolute end-4 top-4 h-5 w-5 text-primary" />
                  )}
                </div>

                <div className="relative">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    id="digital"
                    className="peer sr-only"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label
                    htmlFor="digital"
                    className="flex h-full flex-col gap-1.5 rounded-xl border-2 border-input p-4 transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring cursor-pointer"
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2 font-semibold">
                      {isBn ? 'ডিজিটাল পেমেন্ট' : 'Digital payment'}
                      <StatusBadge
                        tone="success"
                        label={isBn ? 'নিরাপদ' : 'Secure'}
                        className="text-[10px]"
                      />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {isBn
                        ? 'বিকাশ, নগদ, রকেট, কার্ড ও ইন্টারনেট ব্যাংকিং'
                        : 'bKash, Nagad, Rocket, cards and net banking'}
                    </span>
                    <span className="flex flex-wrap gap-1.5 pt-1" aria-hidden>
                      {['bKash', 'Nagad', 'Rocket', 'Visa/MC'].map((brand) => (
                        <span
                          key={brand}
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {brand}
                        </span>
                      ))}
                    </span>
                  </label>
                  {paymentMethod === 'ONLINE' && (
                    <CheckCircle2 className="absolute end-4 top-4 h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Confirm */}
        <div className="w-full lg:w-[420px]">
          <Card className="sticky top-24 overflow-hidden rounded-2xl border border-primary/25 shadow-xs">
            <CardHeader className="border-b border-primary/15 bg-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="h-5 w-5 text-primary" />
                {isBn ? 'অর্ডারের সারসংক্ষেপ' : 'Order summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="max-h-[300px] space-y-4 overflow-y-auto border-b border-border/60 pe-1 pb-5">
                {items.map((item) => (
                  <div
                    key={item.sellerProductId}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{isBn ? item.nameBn : item.nameEn}</p>
                      <p className="text-muted-foreground">
                        {isBn ? 'পরিমাণ' : 'Qty'}: {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">
                      {formatCurrency(item.price * item.quantity, lang)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  {isBn ? 'কুপন কোড' : 'Coupon code'}
                </p>
                <CouponInput
                  isBn={isBn}
                  subtotal={sub}
                  appliedCoupon={appliedCoupon?.code ?? null}
                  onApply={(coupon) => dispatch(applyCoupon(coupon))}
                  onRemove={() => dispatch(removeCoupon())}
                />
              </div>

              <div className="space-y-3 border-t border-border/60 pt-4 text-sm">
                <div className="flex justify-between gap-3 text-muted-foreground">
                  <span>{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                  <span className="font-medium text-foreground tabular-nums">{formatCurrency(sub, lang)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between gap-3 font-medium text-primary">
                    <span>
                      {isBn ? 'ছাড়' : 'Discount'} ({appliedCoupon.code})
                    </span>
                    <span className="tabular-nums">−{formatCurrency(discount, lang)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-3 text-muted-foreground">
                  <span>{isBn ? 'ডেলিভারি চার্জ' : 'Delivery fee'}</span>
                  <span className="font-medium text-foreground tabular-nums">{formatCurrency(deliveryFee, lang)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-border/60 pt-4 text-lg font-bold">
                  <span>{isBn ? 'সর্বমোট' : 'Total'}</span>
                  <span className="text-primary tabular-nums">{formatCurrency(total, lang)}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-1 h-14 w-full rounded-xl text-base font-semibold active:scale-[0.99] sm:text-lg"
                disabled={
                  isCheckingOut || isRedirecting || !selectedAddressId || isAddressesLoading
                }
                onClick={handleCheckout}
              >
                {cta}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {isBn
                  ? 'আপনার ঠিকানা ও পেমেন্ট তথ্য নিরাপদভাবে সংরক্ষিত হবে'
                  : 'Your address and payment details are handled securely'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Bottom Checkout Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-background/95 p-3 backdrop-blur-md lg:hidden">
        <div className="flex flex-col ps-1">
          <span className="text-[10px] font-semibold text-muted-foreground">
            {isBn ? 'মোট প্রদেয়' : 'Total payable'}
          </span>
          <span className="text-lg font-black text-primary tabular-nums">{formatCurrency(total, lang)}</span>
        </div>
        <Button
          size="sm"
          className="h-11 rounded-xl px-5 text-xs font-bold sm:text-sm"
          disabled={isCheckingOut || isRedirecting || !selectedAddressId || isAddressesLoading}
          onClick={handleCheckout}
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}
