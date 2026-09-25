'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useRetryPaymentMutation } from '@/features/payments/paymentsApi';
import { useGetOrderByIdQuery } from '@/features/orders/ordersApi';

export default function PaymentCancelledPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || '';
  const tranId = searchParams.get('tran_id') || '';

  const [retryPayment, { isLoading: isRetrying }] = useRetryPaymentMutation();
  const [errorMessage, setErrorMessage] = useState('');

  const { data: order } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });

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
    <div className="container max-w-xl py-16 px-4 space-y-8">
      <Card className="border-0 shadow-xl ring-1 ring-amber-500/20 rounded-3xl overflow-hidden bg-card">
        <div className="h-3 bg-amber-500" />
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 ring-8 ring-amber-500/5">
            <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
            {isBn ? 'পেমেন্ট প্রক্রিয়া বাতিল করা হয়েছে' : 'Payment Cancelled'}
          </CardTitle>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
            {isBn
              ? 'আপনি পেমেন্ট প্রক্রিয়াটি বাতিল করেছেন। আপনার অ্যাকাউন্ট থেকে কোনো টাকা কাটা হয়নি।'
              : 'You cancelled the payment transaction. No funds were deducted from your account.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
          {(tranId || orderId) && (
            <div className="rounded-2xl bg-muted/40 p-4 space-y-2 border border-border/50 text-sm">
              {orderId && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">{isBn ? 'অর্ডার রেফারেন্স' : 'Order Reference'}</span>
                  <span className="font-mono font-medium">{orderId.slice(0, 13)}...</span>
                </div>
              )}
              {order?.total && (
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                  <span className="text-muted-foreground">{isBn ? 'অর্ডার মোট' : 'Order Total'}</span>
                  <span>৳{Number(order.total).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
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
                  ? (isBn ? 'গেটওয়েতে নিয়ে যাওয়া হচ্ছে...' : 'Redirecting...')
                  : (isBn ? 'আবার পেমেন্ট করুন' : 'Resume Payment')}
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
              href={`/${lang}/checkout`}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {isBn ? 'অন্য কোনো পেমেন্ট মেথড দিয়ে অর্ডার করুন' : 'Change payment method at checkout'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
