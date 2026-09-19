/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setLoginModalOpen } from '@/store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { useCreateOrderMutation, useGetAddressesQuery, FrontendPaymentMethod } from '@/features/checkout/checkoutApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

export function CheckoutClient({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const router = useRouter();
  const dispatch = useDispatch();

  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: addresses, isLoading: isAddressesLoading } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 50; // hardcoded for now based on plan
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setLoginModalOpen(true));
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (addresses?.length && !selectedAddress) {
      const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress.id);
    }
  }, [addresses, selectedAddress]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{isBn ? 'লগইন প্রয়োজন' : 'Login Required'}</h2>
        <p className="text-muted-foreground mb-6">
          {isBn ? 'চেকআউট করার জন্য আপনাকে প্রথমে লগইন করতে হবে।' : 'You need to login to proceed with checkout.'}
        </p>
        <Button onClick={() => dispatch(setLoginModalOpen(true))}>
          {isBn ? 'লগইন করুন' : 'Login Now'}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{isBn ? 'আপনার কার্ট খালি' : 'Your cart is empty'}</h2>
        <Button onClick={() => router.push(`/${lang}`)}>
          {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
        </Button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setErrorMsg(isBn ? 'দয়া করে একটি ঠিকানা নির্বাচন করুন' : 'Please select a delivery address');
      return;
    }

    try {
      setErrorMsg('');
      const orderItems = items.map(item => ({
        sellerProductId: item.sellerProductId,
        quantity: item.quantity,
      }));

      const result = await createOrder({
        addressId: selectedAddress,
        paymentMethod: FrontendPaymentMethod.COD,
        items: orderItems,
      }).unwrap();

      dispatch(clearCart());
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        router.push(`/${lang}/checkout/success?orderId=${result.order.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.data?.message || (isBn ? 'অর্ডার করতে সমস্যা হয়েছে' : 'Failed to place order'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{isBn ? 'চেকআউট' : 'Checkout'}</h1>
      
      {errorMsg && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6 font-medium">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAddressesLoading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ) : (addresses && addresses.length > 0) ? (
                <div className="space-y-4">
                  {addresses.map((address: any) => (
                    <div 
                      key={address.id}
                      className={`border p-4 rounded-md cursor-pointer transition-colors ${selectedAddress === address.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{address.title} - {address.contactName}</h4>
                          <p className="text-sm text-muted-foreground">{address.contactPhone}</p>
                          <p className="text-sm mt-1">{address.streetAddress}</p>
                        </div>
                        {selectedAddress === address.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    {isBn ? '+ নতুন ঠিকানা যোগ করুন' : '+ Add New Address'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    {isBn ? 'কোনো সংরক্ষিত ঠিকানা নেই' : 'No saved addresses found'}
                  </p>
                  <Button variant="outline">
                    {isBn ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-primary bg-primary/5 p-4 rounded-md flex items-center justify-between">
                <div className="font-medium">
                  {isBn ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)'}
                </div>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{isBn ? 'অর্ডার সারসংক্ষেপ' : 'Order Summary'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{isBn ? `সাবটোটাল (${items.length} আইটেম)` : `Subtotal (${items.length} items)`}</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{isBn ? 'ডেলিভারি ফি' : 'Delivery Fee'}</span>
                  <span>৳{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>{isBn ? 'সর্বমোট' : 'Total'}</span>
                  <span className="text-primary">৳{total.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6" 
                size="lg" 
                onClick={handlePlaceOrder}
                disabled={isCreatingOrder || !selectedAddress || items.length === 0}
              >
                {isCreatingOrder 
                  ? (isBn ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'Processing...') 
                  : (isBn ? 'অর্ডার প্লেস করুন' : 'Place Order')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
