'use client';

import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function CheckoutCancelPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  return (
    <div className="container max-w-2xl py-16 text-center space-y-6">
      <div className="flex justify-center text-muted-foreground mb-4">
        <AlertCircle className="w-24 h-24 text-yellow-500" />
      </div>
      <h1 className="text-3xl font-bold">
        {isBn ? 'পেমেন্ট বাতিল করা হয়েছে' : 'Payment Cancelled'}
      </h1>
      <p className="text-muted-foreground text-lg">
        {isBn 
          ? 'আপনি পেমেন্ট প্রক্রিয়াটি বাতিল করেছেন।' 
          : 'You have cancelled the payment process.'}
      </p>

      <div className="flex justify-center gap-4 mt-8">
        <Button asChild variant="outline">
          <Link href={`/${lang}/checkout`}>
            {isBn ? 'চেকআউটে ফিরে যান' : 'Back to Checkout'}
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/${lang}/cart`}>
            {isBn ? 'কার্টে ফিরে যান' : 'Back to Cart'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
