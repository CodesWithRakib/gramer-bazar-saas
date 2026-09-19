'use client';
import { use } from 'react';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutFailPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="container max-w-lg py-20 text-center space-y-6">
      <div className="flex justify-center">
        <XCircle className="h-24 w-24 text-destructive" />
      </div>
      <h1 className="text-4xl font-bold text-destructive">
        {isBn ? 'পেমেন্ট ব্যর্থ হয়েছে' : 'Payment Failed'}
      </h1>
      <p className="text-muted-foreground text-lg">
        {isBn 
          ? 'দুঃখিত, আপনার পেমেন্ট সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা অন্য কোনো পেমেন্ট পদ্ধতি ব্যবহার করুন।' 
          : 'Sorry, your payment could not be processed. Please try again or use a different payment method.'}
      </p>
      
      {orderId && (
        <div className="bg-muted p-4 rounded-lg inline-block">
          <p className="text-sm font-medium">{isBn ? 'অর্ডার আইডি:' : 'Order ID:'} <span className="font-mono">{orderId.slice(-8).toUpperCase()}</span></p>
        </div>
      )}

      <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`/${lang}/checkout`}>
            {isBn ? 'আবার চেষ্টা করুন' : 'Try Again'}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href={`/${lang}/contact`}>
            {isBn ? 'যোগাযোগ করুন' : 'Contact Support'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
