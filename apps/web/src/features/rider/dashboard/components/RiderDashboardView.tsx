'use client';

import React, { useState, useEffect } from 'react';
import { useGetRiderDeliveriesQuery } from '@/features/deliveries/deliveriesApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DeliveryStatus } from '@/features/deliveries/deliveriesApi';
import Link from 'next/link';
import { MapPin, Phone, Banknote, Navigation } from 'lucide-react';

export interface RiderDashboardViewProps {
  lang?: string;
}

export function RiderDashboardView({ lang = 'en' }: RiderDashboardViewProps) {
  
  
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

  const completedDeliveries = deliveries?.filter(d => d.status === DeliveryStatus.DELIVERED) || [];

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</h1>
          <p className="text-muted-foreground text-sm">{isBn ? 'আজকের কাজ' : 'Today\'s tasks'}</p>
        </div>
        <Badge variant={activeDeliveries.length > 0 ? "default" : "secondary"} className="h-8">
          {activeDeliveries.length > 0 ? (isBn ? 'কাজে আছেন' : 'On Duty') : (isBn ? 'অপেক্ষমাণ' : 'Standby')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{isBn ? 'নতুন অ্যাসাইনমেন্ট' : 'New Assignments'}</p>
              <h3 className="text-3xl font-bold tracking-tight">{pendingDeliveries.length} <span className="text-xl font-normal text-muted-foreground">{isBn ? 'টি' : ''}</span></h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-500/80 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <Navigation className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{isBn ? 'সম্পন্ন' : 'Completed'}</p>
              <h3 className="text-3xl font-bold tracking-tight">{completedDeliveries.length} <span className="text-xl font-normal text-muted-foreground">{isBn ? 'টি' : ''}</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeDeliveries.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">{isBn ? 'বর্তমান ডেলিভারি' : 'Active Delivery'}</h2>
          {activeDeliveries.map(delivery => (
            <Card key={delivery.id} className="border-primary/40 shadow-md overflow-hidden relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
              <CardHeader className="pb-3 pt-5 px-6">
                <div className="flex justify-between items-start">
                  <Badge variant="default" className="text-xs uppercase font-bold shadow-sm">{delivery.status.replace(/_/g, ' ')}</Badge>
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">#{delivery.order.id.slice(-6).toUpperCase()}</span>
                </div>
                <CardTitle className="text-xl mt-3">{delivery.order.user?.firstName} {delivery.order.user?.lastName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 px-6 pb-6">
                <div className="flex items-start gap-3 text-sm bg-muted/30 p-3 rounded-lg border border-muted/50">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{delivery.order.address?.street}, {delivery.order.address?.city}</span>
                </div>
                <div className="flex gap-3">
                  <Button asChild className="flex-1 shadow-sm font-semibold rounded-xl" size="lg">
                    <Link href={`/${lang}/rider/deliveries/${delivery.id}`}>
                      {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-xl w-14 shrink-0 shadow-sm border-muted/50 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
                    <a href={`tel:${delivery.order.user?.phone}`}><Phone className="w-5 h-5" /></a>
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
          <Card key={delivery.id} className="shadow-sm border-muted/50 hover:border-muted transition-colors rounded-xl overflow-hidden group">
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="text-xs uppercase font-semibold bg-background">{delivery.status.replace(/_/g, ' ')}</Badge>
                <span className="text-xs text-muted-foreground font-mono">#{delivery.order.id.slice(-6).toUpperCase()}</span>
              </div>
              <CardTitle className="text-lg mt-3">{delivery.order.user?.firstName} {delivery.order.user?.lastName}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <Button asChild className="w-full mt-3 rounded-lg bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
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
