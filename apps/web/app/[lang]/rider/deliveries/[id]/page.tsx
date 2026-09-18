'use client';

import React, { use, useState, useEffect } from 'react';
import { useGetRiderDeliveryDetailsQuery, useUpdateDeliveryStatusMutation, DeliveryStatus } from '@/features/deliveries/deliveriesApi';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Package, ArrowLeft, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RiderDeliveryDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const unwrappedParams = use(params);
  const lang = unwrappedParams.lang;
  const id = unwrappedParams.id;
  const isBn = lang === 'bn';

  const { data: delivery, isLoading, refetch } = useGetRiderDeliveryDetailsQuery(id);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateDeliveryStatusMutation();

  const handleUpdateStatus = async (status: DeliveryStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(isBn ? 'স্ট্যাটাস আপডেট করা হয়েছে' : 'Status updated successfully');
      refetch();
    } catch (error) {
      toast.error(isBn ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Failed to update status');
    }
  };

  if (isLoading) {
    return <div className="p-4 space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!delivery) {
    return (
      <div className="p-4 text-center">
        <p>{isBn ? 'ডেলিভারি পাওয়া যায়নি' : 'Delivery not found'}</p>
        <Button asChild className="mt-4"><Link href={`/${lang}/rider`}>{isBn ? 'ফিরে যান' : 'Go back'}</Link></Button>
      </div>
    );
  }

  const order = delivery.order;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link href={`/${lang}/rider`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="font-semibold text-lg">{isBn ? 'ডেলিভারি বিস্তারিত' : 'Delivery Details'}</h1>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm font-mono text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</span>
            <Badge variant="outline" className="uppercase">{delivery.status.replace(/_/g, ' ')}</Badge>
          </div>
          <CardTitle className="text-xl pt-2">{order.user?.firstName} {order.user?.lastName}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">{isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}</p>
              <p className="text-sm text-muted-foreground">
                {order.address?.street}, {order.address?.city} <br />
                {order.address?.postalCode}, {order.address?.country}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{order.user?.phone}</p>
              <a href={`tel:${order.user?.phone}`} className="text-sm text-primary underline">
                {isBn ? 'কল করুন' : 'Call Customer'}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            {isBn ? 'অর্ডারের বিবরণ' : 'Order Items'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-3">
            {order.items?.map((item: any) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground line-clamp-1">
                  {item.quantity}x {item.sellerProduct?.productVariant?.product?.name}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t flex justify-between font-semibold">
            <span>{isBn ? 'মোট বিল' : 'Total to Collect'}</span>
            <span>৳{Number(order.total).toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn ? 'পেমেন্ট মেথড:' : 'Payment Method:'} <span className="uppercase font-medium text-foreground">{order.paymentMethod}</span> ({order.paymentStatus})
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3 pt-4">
        {delivery.status === DeliveryStatus.ASSIGNED && (
          <Button 
            className="w-full h-12 text-lg" 
            onClick={() => handleUpdateStatus(DeliveryStatus.ACCEPTED)}
            disabled={isUpdating}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isBn ? 'অ্যাক্সেপ্ট করুন' : 'Accept Assignment'}
          </Button>
        )}
        
        {delivery.status === DeliveryStatus.ACCEPTED && (
          <Button 
            className="w-full h-12 text-lg" 
            onClick={() => handleUpdateStatus(DeliveryStatus.PICKED_UP)}
            disabled={isUpdating}
          >
            <Package className="mr-2 h-5 w-5" />
            {isBn ? 'পণ্য পিকআপ করা হয়েছে' : 'Confirm Pickup'}
          </Button>
        )}

        {delivery.status === DeliveryStatus.PICKED_UP && (
          <Button 
            className="w-full h-12 text-lg" 
            onClick={() => handleUpdateStatus(DeliveryStatus.OUT_FOR_DELIVERY)}
            disabled={isUpdating}
          >
            <Truck className="mr-2 h-5 w-5" />
            {isBn ? 'ডেলিভারির জন্য বের হয়েছি' : 'Out for Delivery'}
          </Button>
        )}

        {delivery.status === DeliveryStatus.OUT_FOR_DELIVERY && (
          <div className="space-y-3">
            <Button 
              className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white" 
              onClick={() => handleUpdateStatus(DeliveryStatus.DELIVERED)}
              disabled={isUpdating}
            >
              <CheckCircle2 className="mr-2 h-6 w-6" />
              {isBn ? 'ডেলিভারি সম্পন্ন' : 'Mark as Delivered'}
            </Button>
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={() => {
                if (window.confirm(isBn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
                  handleUpdateStatus(DeliveryStatus.FAILED);
                }
              }}
              disabled={isUpdating}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {isBn ? 'ডেলিভারি ব্যর্থ' : 'Delivery Failed'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
