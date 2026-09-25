'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '@/features/orders/ordersApi';
import { OrderTrackingTimeline } from '@/components/orders/OrderTrackingTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomImage } from '@/components/ui/CustomImage';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Receipt, Phone, User, AlertCircle, Ban, Undo2, Star, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { AddReviewModal } from '@/components/reviews/AddReviewModal';
import { useRetryPaymentMutation } from '@/features/payments/paymentsApi';

export default function OrderDetailsPage({ params }: { params: Promise<{ lang: string, orderId: string }> }) {
  const { lang, orderId } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();

  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [retryPayment, { isLoading: isRetrying }] = useRetryPaymentMutation();
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);

  const handlePayOnline = async () => {
    if (!order) return;
    try {
      const res = await retryPayment({ orderId: order.id, lang }).unwrap();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || (isBn ? 'পেমেন্ট গেটওয়েতে যেতে ব্যর্থ হয়েছে' : 'Failed to redirect to payment gateway'),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">{isBn ? 'অর্ডারটি পাওয়া যায়নি' : 'Order not found'}</h2>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isBn ? 'ফিরে যান' : 'Go Back'}
        </Button>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    if (confirm(isBn ? 'আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি বাতিল করতে চান?' : 'Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(order.id).unwrap();
        toast.success(isBn ? 'অর্ডারটি সফলভাবে বাতিল করা হয়েছে' : 'Order cancelled successfully');
      } catch {
        toast.error(isBn ? 'অর্ডার বাতিল করতে সমস্যা হয়েছে' : 'Failed to cancel order');
      }
    }
  };

  const handleReturnRequest = () => {
    // Placeholder for return workflow
    toast.info(isBn ? 'রিটার্ন রিকোয়েস্ট অপশন শীঘ্রই আসছে!' : 'Return request option coming soon!');
  };

  const canCancel = order.status.toUpperCase() === 'PENDING';
  const canReturn = order.status.toUpperCase() === 'DELIVERED';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/${lang}/customer/orders`)} className="shrink-0 rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {isBn ? 'অর্ডার' : 'Order'} #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
                dateStyle: 'full',
                timeStyle: 'short',
              }).format(new Date(order.createdAt))}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canCancel && (
            <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
              <Ban className="w-4 h-4 mr-2" />
              {isBn ? 'অর্ডার বাতিল করুন' : 'Cancel Order'}
            </Button>
          )}
          {canReturn && (
            <Button variant="outline" onClick={handleReturnRequest}>
              <Undo2 className="w-4 h-4 mr-2" />
              {isBn ? 'রিটার্ন রিকোয়েস্ট' : 'Request Return'}
            </Button>
          )}
        </div>
      </div>

      {/* Tracking Timeline */}
      <Card className="mb-8 border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <CardTitle className="text-lg flex justify-between items-center">
            {isBn ? 'ট্র্যাকিং স্ট্যাটাস' : 'Tracking Status'}
            <Badge variant="outline" className="font-mono text-xs uppercase bg-background">
              {order.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <OrderTrackingTimeline 
            statusHistory={order.statusHistory || []} 
            currentStatus={order.status} 
            lang={lang} 
          />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content: Items */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-lg">{isBn ? 'অর্ডার করা পণ্য' : 'Ordered Items'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item) => {
                  const variant = item.sellerProduct?.productVariant;
                  const name = variant ? (isBn ? variant.nameBn || variant.product.nameBn : variant.nameEn || variant.product.nameEn) : 'Unknown Product';
                  const image = variant?.images?.[0] || '/placeholder.jpg';
                  
                  return (
                    <div key={item.id} className="flex gap-4 p-4 md:p-6 hover:bg-muted/10 transition-colors">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border bg-muted/20 shrink-0">
                        <CustomImage src={image} alt={name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-sm md:text-base line-clamp-2 mb-1">
                            <Link href={`/${lang}/products/${variant?.product.slug}`} className="hover:underline">
                              {name}
                            </Link>
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {isBn ? 'পরিমাণ:' : 'Qty:'} <span className="font-medium text-foreground">{item.quantity}</span>
                          </p>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          {order.status.toUpperCase() === 'DELIVERED' && variant && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setReviewProductId(variant.product.id)}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {isBn ? 'রিভিউ দিন' : 'Write Review'}
                            </Button>
                          )}
                          <p className="font-bold text-primary ml-auto">৳{item.subtotal}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Summary & Address */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5 text-muted-foreground" />
                {isBn ? 'পেমেন্ট সারাংশ' : 'Payment Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span className="font-medium">৳{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
                <span className="font-medium">৳{order.deliveryFee}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>{isBn ? 'ডিসকাউন্ট' : 'Discount'}</span>
                  <span className="font-medium">-৳{order.discount}</span>
                </div>
              )}
              <div className="border-t pt-4 mt-2 flex justify-between items-center">
                <span className="font-bold text-base">{isBn ? 'সর্বমোট' : 'Total'}</span>
                <span className="font-bold text-xl text-primary">৳{order.total}</span>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg border mt-4 flex items-center justify-between">
                <span className="text-muted-foreground">{isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</span>
                <Badge variant="secondary" className="uppercase">{order.paymentMethod}</Badge>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg border mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">{isBn ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}</span>
                <Badge className={order.paymentStatus === 'PAID' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}>
                  {order.paymentStatus}
                </Badge>
              </div>

              {order.paymentStatus !== 'PAID' && order.status.toUpperCase() !== 'CANCELLED' && (
                <Button
                  className="w-full mt-3 rounded-xl h-11 shadow-sm gap-2 font-semibold"
                  disabled={isRetrying}
                  onClick={handlePayOnline}
                >
                  <CreditCard className="w-4 h-4" />
                  {isRetrying
                    ? (isBn ? 'রিডাইরেক্ট করা হচ্ছে...' : 'Redirecting...')
                    : (isBn ? 'অনলাইনে পে করুন (SSLCOMMERZ)' : 'Pay with SSLCOMMERZ')}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                {isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{order.address?.contactName || `${order.user.firstName} ${order.user.lastName}`}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm">{order.address?.contactPhone || order.user.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {order.address?.streetAddress}
                    {order.address?.street && `, ${order.address.street}`}
                    {order.address?.city && `, ${order.address.city}`}
                    {order.address?.postalCode && ` - ${order.address.postalCode}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {reviewProductId && (
        <AddReviewModal
          isOpen={!!reviewProductId}
          onClose={() => setReviewProductId(null)}
          productId={reviewProductId}
          isBn={isBn}
        />
      )}
    </div>
  );
}
