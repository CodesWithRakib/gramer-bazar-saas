'use client';
import { use } from 'react';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutCancelPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="container max-w-lg py-20 text-center space-y-6">
      <div className="flex justify-center">
        <AlertCircle className="h-24 w-24 text-amber-500" />
      </div>
      <h1 className="text-4xl font-bold text-amber-500">
        {isBn ? 'পেমেন্ট বাতিল করা হয়েছে' : 'Payment Cancelled'}
      </h1>
      <p className="text-muted-foreground text-lg">
        {isBn 
          ? 'আপনি পেমেন্ট প্রক্রিয়াটি বাতিল করেছেন। আপনার কার্টে থাকা পণ্যগুলি এখনো সংরক্ষিত আছে।' 
          : 'You have cancelled the payment process. Your cart items are still saved.'}
      </p>

      {orderId && (
        <div className="bg-muted p-4 rounded-lg inline-block">
          <p className="text-sm font-medium">{isBn ? 'অর্ডার আইডি:' : 'Order ID:'} <span className="font-mono">{orderId.slice(-8).toUpperCase()}</span></p>
        </div>
      )}

      <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`/${lang}/checkout`}>
            {isBn ? 'চেকআউটে ফিরে যান' : 'Return to Checkout'}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href={`/${lang}/cart`}>
            {isBn ? 'কার্ট দেখুন' : 'View Cart'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
