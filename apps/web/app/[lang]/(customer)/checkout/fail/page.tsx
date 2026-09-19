'use client';

import { use } from 'react';
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
    <div className="container max-w-2xl py-16 text-center space-y-6">
      <div className="flex justify-center text-destructive mb-4">
        <XCircle className="w-24 h-24" />
      </div>
      <h1 className="text-3xl font-bold text-destructive">
        {isBn ? 'পেমেন্ট ব্যর্থ হয়েছে' : 'Payment Failed'}
      </h1>
      <p className="text-muted-foreground text-lg">
        {isBn 
          ? 'দুঃখিত, আপনার পেমেন্ট সফল হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।' 
          : 'Sorry, your payment could not be processed. Please try again.'}
      </p>
      
      {orderId && (
        <div className="bg-muted/30 p-4 rounded-lg my-6">
          <p className="font-mono">Order ID: {orderId}</p>
        </div>
      )}

      <div className="flex justify-center gap-4 mt-8">
        <Button asChild variant="outline">
          <Link href={`/${lang}/checkout`}>
            {isBn ? 'চেকআউটে ফিরে যান' : 'Back to Checkout'}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/${lang}/orders`}>
            {isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
