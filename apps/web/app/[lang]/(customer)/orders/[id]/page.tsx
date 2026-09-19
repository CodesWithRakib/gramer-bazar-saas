'use client';
import { use } from 'react';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '@/features/orders/ordersApi';
import { useGetCustomerDeliveryQuery } from '@/features/deliveries/deliveriesApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Package, Truck, Store } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCartOpen, clearCart, addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';

export default function OrderDetailsPage({ params }: { params: Promise<{ lang: string, id: string }> }) {
  const { lang, id } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id);
  const { data: delivery } = useGetCustomerDeliveryQuery(id);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

  if (isLoading) {
    return <div className="container py-8 text-center">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;
  }

  if (isError || !order) {
    return <div className="container py-8 text-center text-red-500">{isBn ? 'অর্ডার খুঁজে পাওয়া যায়নি' : 'Order not found'}</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'CONFIRMED': return 'bg-blue-500';
      case 'PROCESSING': return 'bg-purple-500';
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY': return 'bg-orange-500';
      case 'DELIVERED':
      case 'PICKED_UP': return 'bg-green-500';
      case 'CANCELLED':
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    if (!isBn) return status;
    switch (status) {
      case 'PENDING': return 'অপেক্ষমাণ';
      case 'CONFIRMED': return 'নিশ্চিতকৃত';
      case 'PROCESSING': return 'প্রক্রিয়াজাত হচ্ছে';
      case 'READY_FOR_PICKUP': return 'পিকআপের জন্য প্রস্তুত';
      case 'OUT_FOR_DELIVERY': return 'ডেলিভারির জন্য বের হয়েছে';
      case 'DELIVERED': return 'ডেলিভারি সম্পন্ন';
      case 'PICKED_UP': return 'পিকআপ সম্পন্ন';
      case 'CANCELLED': return 'বাতিলকৃত';
      case 'FAILED': return 'ব্যর্থ';
      default: return status;
    }
  };

  const handleCancel = async () => {
    if (window.confirm(isBn ? 'আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি বাতিল করতে চান?' : 'Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(id).unwrap();
        toast.success(isBn ? 'অর্ডার সফলভাবে বাতিল করা হয়েছে।' : 'Order cancelled successfully.');
      } catch (error) {
        toast.error(isBn ? 'অর্ডার বাতিল করতে ত্রুটি হয়েছে।' : 'Failed to cancel order.');
      }
    }
  };

  const handleReorder = () => {
    if (!order.items) return;
    
    dispatch(clearCart());
    
    order.items.forEach(item => {
      dispatch(addToCart({
        sellerProductId: item.sellerProductId,
        quantity: item.quantity,
        price: item.unitPrice,
        nameEn: item.sellerProduct?.productVariant?.nameEn || item.sellerProduct?.productVariant?.product?.nameEn || 'Unknown Product',
        nameBn: item.sellerProduct?.productVariant?.nameBn || item.sellerProduct?.productVariant?.product?.nameBn || 'অজানা পণ্য',
        image: item.sellerProduct?.productVariant?.images?.[0] || '',
        sellerNameEn: 'Previous Seller', // Note: Need seller detail if strictly required
        sellerNameBn: 'পূর্ববর্তী বিক্রেতা'
      }));
    });
    
    dispatch(setCartOpen(true));
  };

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {isSuccess && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl flex items-center justify-center gap-3 mb-6 animate-in slide-in-from-top-4 fade-in">
          <CheckCircle2 className="h-6 w-6" />
          <p className="font-semibold text-lg">{isBn ? 'আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'Your order has been placed successfully!'}</p>
        </div>
      )}

      <Link href={`/${lang}/orders`} className="flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        {isBn ? 'অর্ডারে ফিরে যান' : 'Back to Orders'}
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? 'অর্ডার বিস্তারিত' : 'Order Details'}</h1>
          <p className="text-sm text-muted-foreground">ID: {order.id}</p>
        </div>
        <Badge className={getStatusColor(order.status) + ' text-white hover:' + getStatusColor(order.status)}>
          {getStatusText(order.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Timeline and Items */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'অর্ডারের স্থিতি' : 'Order Status'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory?.map((history, index) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {index === 0 ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                      </div>
                      {index !== (order.statusHistory?.length || 1) - 1 && (
                        <div className="w-0.5 h-full bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold">{getStatusText(history.status)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(history.createdAt))}
                      </p>
                      {history.remark && <p className="text-sm mt-1">{history.remark}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'অর্ডারের পণ্যসমূহ' : 'Order Items'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {isBn 
                            ? item.sellerProduct?.productVariant?.nameBn || item.sellerProduct?.productVariant?.product?.nameBn || `পণ্য আইডি: ${item.sellerProductId.slice(0, 8)}`
                            : item.sellerProduct?.productVariant?.nameEn || item.sellerProduct?.productVariant?.product?.nameEn || `Product ID: ${item.sellerProductId.slice(0, 8)}`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ৳{Number(item.unitPrice).toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="font-bold">৳{Number(item.subtotal).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary and Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'সারসংক্ষেপ' : 'Order Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span>৳ {Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
                <span>৳ {Number(order.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>{isBn ? 'ডিসকাউন্ট' : 'Discount'}</span>
                <span>- ৳ {Number(order.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                <span>{isBn ? 'সর্বমোট' : 'Total'}</span>
                <span>৳ {Number(order.total).toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" onClick={handleReorder}>
                {isBn ? 'আবার অর্ডার করুন' : 'Reorder'}
              </Button>
              {canCancel && (
                <Button variant="destructive" className="w-full" onClick={handleCancel} disabled={isCancelling}>
                  {isCancelling ? (isBn ? 'বাতিল হচ্ছে...' : 'Cancelling...') : (isBn ? 'অর্ডার বাতিল করুন' : 'Cancel Order')}
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'ডেলিভারি তথ্য' : 'Delivery Info'}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {order.address ? (
                <>
                  <p className="font-semibold">{order.address.contactName}</p>
                  <p>{order.address.contactPhone}</p>
                  <p className="text-muted-foreground">{order.address.streetAddress}</p>
                </>
              ) : (
                <p className="text-muted-foreground">{isBn ? 'কোনো ঠিকানা দেওয়া হয়নি' : 'No address provided'}</p>
              )}
            </CardContent>
          </Card>

          {delivery && delivery.rider && (
            <Card className="border-primary bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  {isBn ? 'আপনার রাইডার' : 'Your Rider'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold text-base">{delivery.rider.firstName} {delivery.rider.lastName}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">{delivery.rider.phone}</span>
                  <a href={`tel:${delivery.rider.phone}`} className="text-primary hover:underline">
                    {isBn ? 'কল করুন' : 'Call'}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'পেমেন্ট তথ্য' : 'Payment Info'}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'পদ্ধতি' : 'Method'}</span>
                <span className="font-medium">{order.paymentMethod === 'COD' ? (isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery') : order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'অবস্থা' : 'Status'}</span>
                <span className={`font-medium ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'PAID' ? (isBn ? 'পরিশোধিত' : 'PAID') : (order.paymentStatus === 'PENDING' ? (isBn ? 'বকেয়া' : 'PENDING') : order.paymentStatus)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
