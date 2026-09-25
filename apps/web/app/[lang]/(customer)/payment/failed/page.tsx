'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, RefreshCw, ShoppingCart, HelpCircle, AlertTriangle } from 'lucide-react';
import { useRetryPaymentMutation } from '@/features/payments/paymentsApi';
import { useGetOrderByIdQuery } from '@/features/orders/ordersApi';

export default function PaymentFailedPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || '';
  const tranId = searchParams.get('tran_id') || '';
  const reason = searchParams.get('reason') || '';

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
          (isBn ? 'পেমেন্ট পুনরায় শুরু করতে সমস্যা হয়েছে।' : 'Failed to retry payment session.'),
      );
    }
  };

  return (
    <div className="container max-w-xl py-16 px-4 space-y-8">
      <Card className="border-0 shadow-xl ring-1 ring-destructive/20 rounded-3xl overflow-hidden bg-card">
        <div className="h-3 bg-destructive" />
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 ring-8 ring-destructive/5">
            <XCircle className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-destructive tracking-tight">
            {isBn ? 'পেমেন্ট সম্পন্ন হয়নি' : 'Payment Failed'}
          </CardTitle>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
            {isBn
              ? 'দুঃখিত, আপনার পেমেন্ট প্রক্রিয়াটি সফল হয়নি। কার্ডের তথ্য বা ব্যালেন্স পরীক্ষা করে আবার চেষ্টা করুন।'
              : 'Unfortunately, your payment could not be completed. Please check your card balance or try an alternative method.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
          {(tranId || orderId || reason) && (
            <div className="rounded-2xl bg-muted/40 p-4 space-y-2.5 border border-border/50 text-sm">
              {tranId && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">{isBn ? 'ট্রানজ্যাকশন আইডি' : 'Transaction ID'}</span>
                  <span className="font-mono text-foreground font-medium">{tranId}</span>
                </div>
              )}
              {orderId && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">{isBn ? 'অর্ডার রেফারেন্স' : 'Order Reference'}</span>
                  <span className="font-mono text-foreground font-medium">{orderId.slice(0, 13)}...</span>
                </div>
              )}
              {order?.total && (
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                  <span className="text-muted-foreground">{isBn ? 'অর্ডার মোট' : 'Order Total'}</span>
                  <span>৳{Number(order.total).toFixed(2)}</span>
                </div>
              )}
              {reason && (
                <div className="pt-2 border-t border-border/40 text-xs text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{reason}</span>
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
                  ? (isBn ? 'রিডাইরেক্ট হচ্ছে...' : 'Redirecting...')
                  : (isBn ? 'পুনরায় পেমেন্ট করুন' : 'Retry Payment')}
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
              {isBn ? 'সহায়তার জন্য আমাদের সাপোর্ট সেন্টারে যোগাযোগ করুন' : 'Need help? Contact Gramer Bazar support'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
