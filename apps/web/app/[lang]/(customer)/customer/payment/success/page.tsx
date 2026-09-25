'use client';

import React, { use, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, AlertCircle, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useGetPaymentByTransactionIdQuery } from '@/features/payments/paymentsApi';
import { useGetOrderByIdQuery } from '@/features/orders/ordersApi';

export default function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const orderId = searchParams.get('orderId') || '';
  const tranId = searchParams.get('tran_id') || '';

  // Authoritative server-side verification: NEVER trust query params alone!
  const {
    data: paymentData,
    isLoading: isPaymentLoading,
    error: paymentError,
  } = useGetPaymentByTransactionIdQuery(tranId, {
    skip: !tranId,
  });

  const {
    data: orderData,
    isLoading: isOrderLoading,
  } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });

  const isLoading = isPaymentLoading || (isOrderLoading && !paymentData);

  const isVerifiedPaid =
    paymentData?.status === 'PAID' ||
    orderData?.paymentStatus === 'PAID';

  useEffect(() => {
    if (isVerifiedPaid) {
      dispatch(clearCart());
    }
  }, [isVerifiedPaid, dispatch]);

  if (isLoading) {
    return (
      <div className="container max-w-lg py-24 px-4 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {isBn ? 'পেমেন্ট যাচাই করা হচ্ছে...' : 'Verifying Payment...'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isBn
              ? 'SSLCOMMERZ গেটওয়ে ও সার্ভারের সাথে পেমেন্ট নিশ্চিত করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন।'
              : 'Securely validating transaction with SSLCOMMERZ gateway. Please wait...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12 px-4 space-y-8">
      {isVerifiedPaid ? (
        <Card className="border-0 shadow-xl ring-1 ring-emerald-500/20 rounded-3xl overflow-hidden bg-gradient-to-b from-card to-emerald-500/[0.02]">
          <div className="h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 ring-8 ring-emerald-500/5">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
              {isBn ? 'পেমেন্ট সফল হয়েছে!' : 'Payment Successful!'}
            </CardTitle>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
              {isBn
                ? 'আপনার পেমেন্ট সফলভাবে গৃহীত হয়েছে এবং অর্ডার কনফার্ম করা হয়েছে।'
                : 'Your payment has been successfully processed and your order is confirmed.'}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
            <div className="rounded-2xl bg-muted/40 p-5 space-y-3.5 border border-border/50 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-muted-foreground">{isBn ? 'ট্রানজ্যাকশন আইডি' : 'Transaction ID'}</span>
                <span className="font-mono font-semibold text-primary">{tranId || paymentData?.transactionId || 'N/A'}</span>
              </div>
              {orderId && (
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</span>
                  <span className="font-mono font-medium">{orderId.slice(0, 13).toUpperCase()}...</span>
                </div>
              )}
              {paymentData?.amount && (
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">{isBn ? 'পরিশোধিত অর্থ' : 'Amount Paid'}</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ৳{Number(paymentData.amount).toFixed(2)} {paymentData.currency || 'BDT'}
                  </span>
                </div>
              )}
              {paymentData?.cardType && (
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">{isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}</span>
                  <span className="font-medium uppercase">{paymentData.cardType}</span>
                </div>
              )}
              {paymentData?.bankTransactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{isBn ? 'ব্যাংক রেফারেন্স' : 'Bank Reference'}</span>
                  <span className="font-mono text-xs">{paymentData.bankTransactionId}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-xl border border-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              <span>
                {isBn
                  ? 'এই লেনদেনটি SSLCOMMERZ 256-bit এনক্রিপশন দ্বারা নিরাপদ।'
                  : 'This transaction is verified & secured with SSLCOMMERZ 256-bit encryption.'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {orderId ? (
                <Button asChild size="lg" className="flex-1 rounded-xl h-12 gap-2 shadow-md">
                  <Link href={`/${lang}/customer/orders/${orderId}`}>
                    <ShoppingBag className="w-4 h-4" />
                    {isBn ? 'অর্ডার ট্র্যাকিং দেখুন' : 'Track Order Status'}
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="flex-1 rounded-xl h-12 gap-2 shadow-md">
                  <Link href={`/${lang}/customer/orders`}>
                    <ShoppingBag className="w-4 h-4" />
                    {isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="flex-1 rounded-xl h-12 gap-2">
                <Link href={`/${lang}`}>
                  {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl ring-1 ring-amber-500/20 rounded-3xl overflow-hidden bg-card">
          <div className="h-3 bg-amber-500" />
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isBn ? 'পেমেন্ট প্রক্রিয়াধীন অথবা নিশ্চিত হয়নি' : 'Payment Pending Verification'}
            </CardTitle>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
              {isBn
                ? 'আপনার পেমেন্ট রেকর্ডটি এখনো প্রক্রিয়াকরণ পর্যায়ে রয়েছে। অনুগ্রহ করে আপনার ব্যাংক স্টেটমেন্ট বা অর্ডার হিস্টোরি চেক করুন।'
                : 'Your payment record is being processed. Please verify your order status in your dashboard.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {orderId && (
                <Button asChild size="lg" className="rounded-xl h-12">
                  <Link href={`/${lang}/customer/orders/${orderId}`}>
                    {isBn ? 'অর্ডার বিস্তারিত দেখুন' : 'View Order Details'}
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="rounded-xl h-12">
                <Link href={`/${lang}/customer/checkout`}>
                  {isBn ? 'চেকআউটে ফিরে যান' : 'Return to Checkout'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
