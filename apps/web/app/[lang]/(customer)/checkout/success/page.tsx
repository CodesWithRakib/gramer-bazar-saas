'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Locale } from '@/config/i18n';

export default function CheckoutSuccessPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  const isBn = lang === 'bn';
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
      <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">
        {isBn ? 'অর্ডার সফল হয়েছে!' : 'Order Successful!'}
      </h1>
      <p className="text-lg text-muted-foreground mb-2">
        {isBn 
          ? 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।' 
          : 'Your order has been received successfully.'}
      </p>
      {orderId && (
        <p className="font-medium text-lg mb-8">
          {isBn ? 'অর্ডার আইডি:' : 'Order ID:'} <span className="text-primary">{orderId}</span>
        </p>
      )}
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href={`/${lang}/orders`}>
            {isBn ? 'অর্ডার স্ট্যাটাস দেখুন' : 'Track Order Status'}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/${lang}`}>
            {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
