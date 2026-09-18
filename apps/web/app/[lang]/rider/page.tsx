'use client';

import React, { use, useState, useEffect } from 'react';
import { useGetRiderDeliveriesQuery } from '@/features/deliveries/deliveriesApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DeliveryStatus } from '@/features/deliveries/deliveriesApi';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';

export default function RiderDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState('en');
  useEffect(() => { params.then(p => setLang(p.lang)); }, [params]);
  const isBn = lang === 'bn';

  const { data: deliveries, isLoading } = useGetRiderDeliveriesQuery(undefined, {
    pollingInterval: 30000, // refresh every 30 seconds
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>;
  }

  const activeDeliveries = deliveries?.filter(d => 
    [DeliveryStatus.ACCEPTED, DeliveryStatus.PICKED_UP, DeliveryStatus.OUT_FOR_DELIVERY].includes(d.status)
  ) || [];

  const pendingDeliveries = deliveries?.filter(d => d.status === DeliveryStatus.ASSIGNED) || [];

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold">{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</h1>
        <p className="text-muted-foreground">{isBn ? 'আজকের কাজ' : 'Today\'s tasks'}</p>
      </div>

      {activeDeliveries.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">{isBn ? 'বর্তমান ডেলিভারি' : 'Active Delivery'}</h2>
          {activeDeliveries.map(delivery => (
            <Card key={delivery.id} className="border-primary shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="default" className="text-xs uppercase">{delivery.status.replace(/_/g, ' ')}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">#{delivery.order.id.slice(-6).toUpperCase()}</span>
                </div>
                <CardTitle className="text-lg mt-2">{delivery.order.user?.firstName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-muted-foreground">{delivery.order.address?.street}, {delivery.order.address?.city}</span>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/${lang}/rider/deliveries/${delivery.id}`}>
                      {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="icon">
                    <a href={`tel:${delivery.order.user?.phone}`}><Phone className="w-4 h-4" /></a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">{isBn ? 'নতুন অ্যাসাইনমেন্ট' : 'New Assignments'} ({pendingDeliveries.length})</h2>
        {pendingDeliveries.length === 0 && (
          <p className="text-muted-foreground text-sm">{isBn ? 'কোনো নতুন ডেলিভারি নেই।' : 'No new deliveries.'}</p>
        )}
        {pendingDeliveries.map(delivery => (
          <Card key={delivery.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="text-xs uppercase">{delivery.status}</Badge>
                <span className="text-xs text-muted-foreground font-mono">#{delivery.order.id.slice(-6).toUpperCase()}</span>
              </div>
              <CardTitle className="text-base mt-2">{delivery.order.user?.firstName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mt-2" variant="secondary">
                <Link href={`/${lang}/rider/deliveries/${delivery.id}`}>
                  {isBn ? 'অ্যাক্সেপ্ট করুন' : 'Review & Accept'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
