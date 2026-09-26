'use client';

import React from 'react';
import { useGetRiderDeliveriesQuery } from '@/features/deliveries/deliveriesApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderSkeleton } from '@/components/ui/Skeletons';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { MapPin, ArrowRight, Truck } from 'lucide-react';
import Link from 'next/link';

export interface RiderDeliveriesViewProps {
  lang?: string;
}

export function RiderDeliveriesView({ lang = 'en' }: RiderDeliveriesViewProps) {
  const isBn = lang === 'bn';

  const { data: deliveries, isLoading } = useGetRiderDeliveriesQuery(undefined, {
    pollingInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        <PageHeader
          title={isBn ? 'সকল অ্যাসাইনমেন্ট' : 'All Deliveries'}
          description={
            isBn
              ? 'আপনার বর্তমান ডেলিভারি অ্যাসাইনমেন্টসমূহ পর্যালোচনা ও পরিচালনা করুন।'
              : 'Review and manage your active and assigned deliveries.'
          }
        />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="space-y-6 pt-2">
        <PageHeader
          title={isBn ? 'সকল অ্যাসাইনমেন্ট' : 'All Deliveries'}
          description={
            isBn
              ? 'আপনার বর্তমান ডেলিভারি অ্যাসাইনমেন্টসমূহ পর্যালোচনা ও পরিচালনা করুন।'
              : 'Review and manage your active and assigned deliveries.'
          }
        />
        <EmptyState
          icon={<Truck className="w-8 h-8 text-primary" />}
          title={isBn ? 'কোনো সক্রিয় অ্যাসাইনমেন্ট নেই' : 'No Active Deliveries'}
          description={
            isBn
              ? 'এই মুহূর্তে আপনার জন্য কোনো ডেলিভারি বরাদ্দ নেই। নতুন ডেলিভারি আসলে নোটিফিকেশন পাবেন।'
              : 'You do not have any assigned deliveries right now. You will be notified when new orders are assigned.'
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <PageHeader
        title={isBn ? 'সকল অ্যাসাইনমেন্ট' : 'All Deliveries'}
        description={
          isBn
            ? 'আপনার বর্তমান ডেলিভারি অ্যাসাইনমেন্টসমূহ পর্যালোচনা ও পরিচালনা করুন।'
            : 'Review and manage your active and assigned deliveries.'
        }
        badge={
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
            {deliveries.length} {isBn ? 'টি ডেলিভারি' : 'deliveries'}
          </span>
        }
      />

      <div className="space-y-3">
        {deliveries.map((delivery) => (
          <Link
            key={delivery.id}
            href={`/${lang}/rider/deliveries/${delivery.id}`}
            className="block group"
          >
            <Card className="rounded-2xl border-border/70 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer bg-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-xs uppercase font-medium bg-muted/30">
                    {delivery.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono font-medium">
                    #{delivery.order.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg mt-2 flex justify-between items-center text-foreground group-hover:text-primary transition-colors">
                  <span>
                    {delivery.order.user?.firstName} {delivery.order.user?.lastName}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/70" />
                  <span className="line-clamp-2">
                    {delivery.order.address?.street}, {delivery.order.address?.city}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
