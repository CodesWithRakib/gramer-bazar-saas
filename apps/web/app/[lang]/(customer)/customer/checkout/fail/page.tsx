'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw, ShoppingCart, HelpCircle } from 'lucide-react';
import { useRetryPaymentMutation } from '@/features/payments/paymentsApi';

export default function CheckoutFailPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const searchParams = useSearchParams();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || '';
  const [retryPayment, { isLoading: isRetrying }] = useRetryPaymentMutation();
  const [errorMessage, setErrorMessage] = useState('');

  const handleRetry = async () => {
    if (!orderId) return;
    try {
      setErrorMessage('');
      const res = await retryPayment({ orderId, lang }).unwrap();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message ||
          (isBn ? 'পেমেন্ট পুনরায় শুরু করতে সমস্যা হয়েছে।' : 'Failed to restart payment session.'),
      );
    }
  };

  return (
    <div className="container max-w-xl py-16 px-4">
      <Card className="border-0 shadow-xl ring-1 ring-destructive/20 rounded-3xl overflow-hidden bg-card text-center">
        <div className="h-3 bg-destructive" />
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 ring-8 ring-destructive/5">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-destructive tracking-tight">
            {isBn ? 'পেমেন্ট ব্যর্থ হয়েছে' : 'Payment Failed'}
          </CardTitle>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
            {isBn
              ? 'দুঃখিত, আপনার পেমেন্ট সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা অন্য কোনো পেমেন্ট পদ্ধতি ব্যবহার করুন।'
              : 'Sorry, your payment could not be processed. Please try again or use a different payment method.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
          {orderId && (
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/50 text-sm flex justify-between items-center">
              <span className="text-muted-foreground">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</span>
              <span className="font-mono font-semibold text-primary">{orderId.slice(0, 13).toUpperCase()}...</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium text-left">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {orderId && (
              <Button
                size="lg"
                className="flex-1 rounded-xl h-12 gap-2 shadow-md font-semibold"
                disabled={isRetrying}
                onClick={handleRetry}
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying
                  ? (isBn ? 'রিডাইরেক্ট হচ্ছে...' : 'Redirecting...')
                  : (isBn ? 'আবার চেষ্টা করুন' : 'Retry Payment')}
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="flex-1 rounded-xl h-12 gap-2">
              <Link href={`/${lang}/cart`}>
                <ShoppingCart className="w-4 h-4" />
                {isBn ? 'কার্টে ফিরে যান' : 'Back to Cart'}
              </Link>
            </Button>
          </div>

          <div className="text-center pt-2">
            <Link
              href={`/${lang}/contact`}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {isBn ? 'যোগাযোগ করুন' : 'Contact Support'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
