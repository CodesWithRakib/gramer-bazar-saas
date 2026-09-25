'use client';

import React from 'react';
import { useGetSellerOrderByIdQuery } from '@/features/seller-portal/sellerPortalApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StartChatButton } from '@/components/chat/StartChatButton';

import { use } from 'react';

export interface SellerOrderDetailsViewProps {
  lang?: string;
  id: string;
}

export function SellerOrderDetailsView({ lang = 'en', id }: SellerOrderDetailsViewProps) {
  const isBn = lang === 'bn';
  const { data: order, isLoading, isError } = useGetSellerOrderByIdQuery(id);

  if (isLoading) return <Skeleton className="w-full h-96" />;
  if (isError || !order) return <div className="text-red-500">Order not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isBn ? 'অর্ডার বিস্তারিত' : 'Order Details'} - {order.id.slice(-8).toUpperCase()}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{isBn ? 'গ্রাহকের তথ্য' : 'Customer Info'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <p><strong>{isBn ? 'নাম' : 'Name'}:</strong> {order.user?.firstName} {order.user?.lastName}</p>
                <p><strong>{isBn ? 'ফোন' : 'Phone'}:</strong> {order.user?.phone}</p>
                <p><strong>{isBn ? 'ঠিকানা' : 'Address'}:</strong> {order.address?.street}, {order.address?.city}</p>
              </div>
              {order.user?.id && (
                <div className="pt-4 border-t">
                  <StartChatButton 
                    participantId={order.user.id} 
                    lang={lang} 
                    referenceId={order.id}
                    referenceType="ORDER"
                    buttonText={isBn ? 'গ্রাহককে মেসেজ দিন' : 'Message Customer'} 
                    redirectPath={`/${lang}/seller/messages`}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isBn ? 'অর্ডার সামারি' : 'Order Summary'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>{isBn ? 'স্ট্যাটাস' : 'Status'}:</strong> <Badge>{order.status}</Badge></p>
            <p><strong>{isBn ? 'আপনার সাবটোটাল' : 'Your Subtotal'}:</strong> ৳ {order.sellerSubtotal}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'আইটেমসমূহ' : 'Items'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex justify-between">
                <div>
                  <p className="font-medium">{item.sellerProduct?.productVariant?.nameEn || item.sellerProduct?.productVariant?.product?.nameEn}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold">৳ {item.subtotal}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
