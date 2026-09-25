'use client';

import React, { use, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useGetOrderByIdQuery } from '@/features/orders/ordersApi';
import { useGetPaymentByTransactionIdQuery } from '@/features/payments/paymentsApi';

export default function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || '';
  const tranId = searchParams.get('tran_id') || '';

  const { data: order } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });

  const { data: payment } = useGetPaymentByTransactionIdQuery(tranId, {
    skip: !tranId,
  });

  const isConfirmed =
    order?.status === 'CONFIRMED' ||
    order?.paymentStatus === 'PAID' ||
    payment?.status === 'PAID' ||
    order?.paymentMethod === 'COD';

  useEffect(() => {
    if (isConfirmed) {
      dispatch(clearCart());
    }
  }, [isConfirmed, dispatch]);

  return (
    <div className="container max-w-xl py-16 px-4">
      <Card className="border-0 shadow-xl ring-1 ring-emerald-500/20 rounded-3xl overflow-hidden bg-card text-center">
        <div className="h-3 bg-gradient-to-r from-emerald-500 to-green-500" />
        <CardHeader className="pt-8 pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
            {isBn ? 'অর্ডার সফল হয়েছে!' : 'Order Placed Successfully!'}
          </CardTitle>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm sm:text-base">
            {isBn
              ? 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।'
              : 'Your order has been received successfully.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
          {(orderId || tranId) && (
            <div className="rounded-2xl bg-muted/40 p-4 space-y-2 border border-border/50 text-sm">
              {orderId && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</span>
                  <span className="font-mono font-semibold text-primary">{orderId.slice(0, 13).toUpperCase()}...</span>
                </div>
              )}
              {tranId && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">{isBn ? 'ট্রানজ্যাকশন আইডি' : 'Transaction ID'}</span>
                  <span className="font-mono text-muted-foreground">{tranId}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild size="lg" className="flex-1 rounded-xl h-12 gap-2 shadow-md">
              <Link href={orderId ? `/${lang}/customer/orders/${orderId}` : `/${lang}/customer/orders`}>
                <ShoppingBag className="w-4 h-4" />
                {isBn ? 'অর্ডার ট্র্যাক করুন' : 'Track Order Status'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 rounded-xl h-12 gap-2">
              <Link href={`/${lang}`}>
                {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
