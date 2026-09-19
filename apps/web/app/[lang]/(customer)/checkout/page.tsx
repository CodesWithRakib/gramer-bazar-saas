'use client';
import { use } from 'react';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { clearCart } from '@/store/slices/cartSlice';
import { useGetAddressesQuery, useCreateAddressMutation } from '@/features/addresses/addressesApi';
import { useCheckoutOrderMutation } from '@/features/orders/ordersApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Plus, MapPin } from 'lucide-react';

export default function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  const dispatch = useDispatch();

  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = 60; // Hardcoded for now, could be dynamic
  const total = subtotal + deliveryFee;

  const { data: addresses, isLoading: isAddressesLoading } = useGetAddressesQuery(undefined, { skip: !isAuthenticated });
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateAddressMutation();
  const [checkoutOrder, { isLoading: isCheckingOut }] = useCheckoutOrderMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH_ON_DELIVERY');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    title: 'Home',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Bangladesh',
    contactName: '',
    contactPhone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lang}/login?redirect=/${lang}/checkout`);
    } else if (items.length === 0) {
      router.push(`/${lang}/cart`);
    }
  }, [isAuthenticated, items.length, router, lang]);

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    } else if (addresses && addresses.length === 0) {
      setShowAddressForm(true);
    }
  }, [addresses, selectedAddressId]);

  if (!isAuthenticated || items.length === 0) return null;

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createAddress(newAddress).unwrap();
      setSelectedAddressId(res.id);
      setShowAddressForm(false);
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to create address');
    }
  };

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
      };

      const res = await checkoutOrder(orderData).unwrap();
      dispatch(clearCart());
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        router.push(`/${lang}/orders/${res.order.id}?success=true`);
      }
    } catch (err: any) {
      setErrorMsg(err.data?.message || (isBn ? 'অর্ডার তৈরি করতে সমস্যা হয়েছে' : 'Failed to place order'));
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                          <span className="text-sm text-muted-foreground">{address.streetAddress}, {address.city}</span>
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
                    <form onSubmit={handleCreateAddress} className="space-y-4 border p-4 rounded-lg bg-muted/20">
                      <h4 className="font-semibold">{isBn ? 'নতুন ঠিকানা' : 'New Address'}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{isBn ? 'ঠিকানার নাম' : 'Address Title (e.g., Home)'}</Label>
                          <Input required value={newAddress.title} onChange={e => setNewAddress({...newAddress, title: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>{isBn ? 'যোগাযোগের নাম' : 'Contact Name'}</Label>
                          <Input required value={newAddress.contactName} onChange={e => setNewAddress({...newAddress, contactName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>{isBn ? 'যোগাযোগের নম্বর' : 'Contact Phone'}</Label>
                          <Input required value={newAddress.contactPhone} onChange={e => setNewAddress({...newAddress, contactPhone: e.target.value})} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>{isBn ? 'রাস্তা / বিস্তারিত ঠিকানা' : 'Street Address'}</Label>
                          <Input required value={newAddress.streetAddress} onChange={e => setNewAddress({...newAddress, streetAddress: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>{isBn ? 'শহর' : 'City'}</Label>
                          <Input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label>{isBn ? 'পোস্টাল কোড' : 'Postal Code'}</Label>
                          <Input required value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        {addresses && addresses.length > 0 && (
                          <Button type="button" variant="ghost" onClick={() => setShowAddressForm(false)}>
                            {isBn ? 'বাতিল' : 'Cancel'}
                          </Button>
                        )}
                        <Button type="submit" disabled={isCreatingAddress}>
                          {isCreatingAddress ? (isBn ? 'যোগ করা হচ্ছে...' : 'Saving...') : (isBn ? 'ঠিকানা সেভ করুন' : 'Save Address')}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                {isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="CASH_ON_DELIVERY" 
                    id="cod" 
                    className="peer sr-only" 
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Label
                    htmlFor="cod"
                    className="flex flex-col gap-1 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5"
                  >
                    <span className="font-semibold text-base">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
                    <span className="text-sm text-muted-foreground">{isBn ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন' : 'Pay when you receive the product'}</span>
                  </Label>
                  {paymentMethod === 'CASH_ON_DELIVERY' && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />}
                </div>
                <div className="relative">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="DIGITAL_PAYMENT" 
                    id="digital" 
                    className="peer sr-only" 
                    checked={paymentMethod === 'DIGITAL_PAYMENT'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Label
                    htmlFor="digital"
                    className="flex flex-col gap-1 p-4 border-2 rounded-lg cursor-pointer hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/5"
                  >
                    <span className="font-semibold text-base">{isBn ? 'ডিজিটাল পেমেন্ট' : 'Digital Payment'}</span>
                    <span className="text-sm text-muted-foreground">{isBn ? 'বিকাশ, রকেট, কার্ড (SSLCommerz)' : 'bKash, Nagad, Cards (SSLCommerz)'}</span>
                  </Label>
                  {paymentMethod === 'DIGITAL_PAYMENT' && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Confirm */}
        <div className="w-full lg:w-[400px]">
          <Card className="sticky top-24 border-primary/20">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-xl">{isBn ? 'অর্ডারের সারসংক্ষেপ' : 'Order Summary'}</CardTitle>
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
                  <span>{isBn ? 'সর্বমোট' : 'Subtotal'}</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
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
                className="w-full text-lg h-14" 
                disabled={isCheckingOut || !selectedAddressId || isAddressesLoading}
                onClick={handleCheckout}
              >
                {isCheckingOut ? (isBn ? 'প্রক্রিয়াধীন...' : 'Processing...') : (isBn ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
