'use client';

import React, { use, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { clearCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  const dispatch = useDispatch();
  
  const items = useSelector((state: RootState) => state.cart.items);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 50;
  const total = subtotal + (items.length > 0 ? shipping : 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // If order is placed, show success state
  if (orderPlaced) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center text-center space-y-6 max-w-lg">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'অর্ডার সফল হয়েছে!' : 'Order Placed Successfully!'}
        </h1>
        <p className="text-muted-foreground">
          {isBn 
            ? 'আপনার অর্ডারটি গ্রহণ করা হয়েছে। ডেলিভারির জন্য প্রস্তুত হলে আপনাকে জানানো হবে।' 
            : 'Your order has been received. You will be notified when it is out for delivery.'}
        </p>
        <Button size="lg" className="w-full mt-4" onClick={() => router.push(`/${lang}/profile`)}>
          {isBn ? 'আমার অর্ডার দেখুন' : 'View My Orders'}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    router.push(`/${lang}/cart`);
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to create order
    setTimeout(() => {
      setIsSubmitting(false);
      dispatch(clearCart());
      setOrderPlaced(true);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        {isBn ? 'চেকআউট' : 'Checkout'}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}</CardTitle>
              <CardDescription>
                {isBn ? 'অর্ডার গ্রহণের ঠিকানা দিন' : 'Enter your shipping details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{isBn ? 'নামের প্রথমাংশ' : 'First Name'}</Label>
                  <Input id="firstName" defaultValue={user?.firstName || ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{isBn ? 'নামের শেষাংশ' : 'Last Name'}</Label>
                  <Input id="lastName" defaultValue={user?.lastName || ''} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</Label>
                <Input id="phone" type="tel" defaultValue={user?.phone || ''} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">{isBn ? 'ঠিকানা (গ্রাম, রাস্তা, বাড়ি)' : 'Full Address (Village, Street, House)'}</Label>
                <Input id="address" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="upazila">{isBn ? 'উপজেলা' : 'Upazila'}</Label>
                  <Input id="upazila" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">{isBn ? 'জেলা' : 'District'}</Label>
                  <Input id="district" required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 border rounded-md p-4 bg-muted/50">
                <input type="radio" id="cod" name="payment" defaultChecked className="w-4 h-4 text-primary" />
                <Label htmlFor="cod" className="font-medium cursor-pointer">
                  {isBn ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)'}
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">
                {isBn ? 'আপনার অর্ডার' : 'Your Order'}
              </h2>
              
              <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.sellerProductId} className="flex gap-3">
                    <div className="w-16 h-16 bg-muted shrink-0 rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-2">{isBn ? item.nameBn : item.nameEn}</p>
                      <p className="text-muted-foreground mt-1">{item.quantity} x ৳{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 text-sm border-y py-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                  <span className="font-medium">৳{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? 'ডেলিভারি চার্জ' : 'Delivery'}</span>
                  <span className="font-medium">৳{shipping}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>{isBn ? 'সর্বমোট' : 'Total'}</span>
                <span>৳{total}</span>
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isBn ? 'প্রসেসিং...' : 'Processing...') 
                  : (isBn ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
