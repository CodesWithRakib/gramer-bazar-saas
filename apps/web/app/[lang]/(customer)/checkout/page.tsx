'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import { use } from 'react';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { clearCart } from '@/store/slices/cartSlice';
import { useGetAddressesQuery } from '@/features/addresses/addressApi';
import { AddressForm } from '@/features/addresses/components/AddressForm';
import { useCheckoutOrderMutation } from '@/features/orders/ordersApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Plus, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

export default function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  const dispatch = useDispatch();

  const { items } = useSelector((state: RootState) => state.cart);
  const { appliedCoupon } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = 60; // Hardcoded for now, could be dynamic
  const total = appliedCoupon ? subtotal - appliedCoupon.discountAmount + deliveryFee : subtotal + deliveryFee;

  const { data: addresses, isLoading: isAddressesLoading } = useGetAddressesQuery(undefined, { skip: !isAuthenticated });
  const [checkoutOrder, { isLoading: isCheckingOut }] = useCheckoutOrderMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lang}/login?redirect=/${lang}/checkout`);
    } else if (items.length === 0) {
      router.push(`/${lang}/cart`);
    }
  }, [isAuthenticated, items.length, router, lang]);

  if (addresses && addresses.length > 0 && !selectedAddressId) {
    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
    setSelectedAddressId(defaultAddress.id);
  } else if (addresses && addresses.length === 0 && !showAddressForm) {
    setShowAddressForm(true);
  }

  if (!isAuthenticated || items.length === 0) return null;

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setErrorMsg(isBn ? 'দয়া করে একটি ডেলিভারি ঠিকানা নির্বাচন করুন' : 'Please select a delivery address');
      return;
    }

    try {
      setErrorMsg('');
      const orderData = {
        addressId: selectedAddressId,
        paymentMethod,
        items: items.map(item => ({
          sellerProductId: item.sellerProductId,
          quantity: item.quantity,
        })),
        couponCode: appliedCoupon?.code, // Send code instead of ID, backend can process it
        lang,
      };

      const res = await checkoutOrder(orderData).unwrap();
      dispatch(clearCart());
      if (res.paymentUrl) {
        setIsRedirecting(true);
        window.location.href = res.paymentUrl;
      } else {
        router.push(`/${lang}/orders/${res.order.id}?success=true`);
      }
    } catch (err) {
      setIsRedirecting(false);
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'অর্ডার তৈরি করতে সমস্যা হয়েছে' : 'Failed to place order'));
    }
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">{isBn ? 'চেকআউট' : 'Checkout'}</h1>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md font-medium">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          {/* Delivery Address */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isAddressesLoading ? (
                <div className="py-4 text-center text-muted-foreground">{isBn ? 'লোড হচ্ছে...' : 'Loading addresses...'}</div>
              ) : (
                <div className="space-y-4">
                  {addresses && addresses.length > 0 && !showAddressForm && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
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
                        <Label
                          htmlFor={`addr-${address.id}`}
                          className="flex flex-col gap-1 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5"
                        >
                          <span className="font-semibold text-base">{address.title} {address.isDefault && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">Default</span>}</span>
                          <span className="text-sm">{address.contactName} ({address.contactPhone})</span>
                          <span className="text-sm text-muted-foreground">{address.streetAddress}</span>
                        </Label>
                        {selectedAddressId === address.id && (
                          <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                  )}

                  {!showAddressForm && (
                    <Button variant="outline" onClick={() => setShowAddressForm(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      {isBn ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address'}
                    </Button>
                  )}

                  {showAddressForm && (
                    <div className="border p-4 rounded-lg bg-card">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">{isBn ? 'নতুন ঠিকানা' : 'New Address'}</h4>
                        {addresses && addresses.length > 0 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddressForm(false)}>
                            {isBn ? 'বাতিল' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                      <AddressForm onSuccess={() => setShowAddressForm(false)} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <Label
                    htmlFor="cod"
                    className="flex flex-col gap-1 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5"
                  >
                    <span className="font-semibold text-base">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
                    <span className="text-sm text-muted-foreground">{isBn ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন' : 'Pay when you receive the product'}</span>
                  </Label>
                  {paymentMethod === 'COD' && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />}
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
                  <Label
                    htmlFor="digital"
                    className="flex flex-col gap-1.5 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-base flex items-center gap-2">
                        {isBn ? 'ডিজিটাল পেমেন্ট (SSLCommerz)' : 'Digital Payment (SSLCommerz)'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Instant & Secure
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {isBn ? 'বিকাশ, নগদ, রকেট, কার্ড (ভিসা, মাস্টারকার্ড), ইন্টারনেট ব্যাংকিং' : 'bKash, Nagad, Rocket, Cards (Visa, Mastercard), Net Banking'}
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">bKash</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">Nagad</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">Rocket</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">Visa/Mastercard</span>
                    </div>
                  </Label>
                  {paymentMethod === 'ONLINE' && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Confirm */}
        <div className="w-full lg:w-[420px]">
          <Card className="sticky top-24 border-0 shadow-sm ring-1 ring-primary/20 rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                {isBn ? 'অর্ডারের সারসংক্ষেপ' : 'Order Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 border-b pb-6">
                {items.map(item => (
                  <div key={item.sellerProductId} className="flex justify-between items-start gap-4 text-sm">
                    <div>
                      <p className="font-medium">{isBn ? item.nameBn : item.nameEn}</p>
                      <p className="text-muted-foreground">{isBn ? 'পরিমাণ:' : 'Qty:'} {item.quantity}</p>
                    </div>
                    <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>{isBn ? 'ডিসকাউন্ট' : 'Discount'} ({appliedCoupon.code})</span>
                    <span>-৳{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>{isBn ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
                  <span>৳{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t flex justify-between font-bold text-2xl">
                  <span>{isBn ? 'মোট' : 'Total'}</span>
                  <span className="text-primary">৳{total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full text-base sm:text-lg h-14 rounded-xl shadow-lg transition-transform active:scale-[0.98] mt-2 font-semibold" 
                disabled={isCheckingOut || isRedirecting || !selectedAddressId || isAddressesLoading}
                onClick={handleCheckout}
              >
                {isRedirecting
                  ? (isBn ? 'SSLCOMMERZ-এ নিয়ে যাওয়া হচ্ছে...' : 'Redirecting to SSLCOMMERZ...')
                  : isCheckingOut
                  ? (isBn ? 'প্রক্রিয়াধীন...' : 'Processing...')
                  : paymentMethod === 'ONLINE'
                  ? (isBn ? 'অর্ডার প্লেস ও পে করুন' : 'Place Order & Pay with SSLCommerz')
                  : (isBn ? 'অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)' : 'Confirm Order (Cash on Delivery)')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
