'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { useGetRiderDeliveriesQuery, DeliveryStatus } from '@/features/deliveries/deliveriesApi';

export interface RiderDeliveriesViewProps {
  lang?: string;
}

type TabKey = 'new' | 'active' | 'completed' | 'all';

const ACTIVE_STATUSES = [
  DeliveryStatus.ACCEPTED,
  DeliveryStatus.PICKED_UP,
  DeliveryStatus.OUT_FOR_DELIVERY,
];

export function RiderDeliveriesView({ lang = 'en' }: RiderDeliveriesViewProps) {
  const isBn = lang === 'bn';
  const [tab, setTab] = useState<TabKey>('new');

  const { data: deliveries, isLoading, isError, refetch } = useGetRiderDeliveriesQuery(undefined, {
    pollingInterval: 30000,
  });

  const grouped = useMemo(() => {
    const list = deliveries ?? [];
    return {
      new: list.filter((d) => d.status === DeliveryStatus.ASSIGNED),
      active: list.filter((d) => ACTIVE_STATUSES.includes(d.status)),
      completed: list.filter((d) => d.status === DeliveryStatus.DELIVERED),
      all: list,
    };
  }, [deliveries]);

  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 pt-2">
        <PageHeader
          title={isBn ? 'ডেলিভারি' : 'Deliveries'}
          description={isBn ? 'আপনার ডেলিভারি অ্যাসাইনমেন্ট দেখুন।' : 'Your delivery assignments.'}
        />
        <ErrorState isBn={isBn} onRetry={refetch} />
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'new', label: isBn ? 'নতুন' : 'New', count: grouped.new.length },
    { key: 'active', label: isBn ? 'চলমান' : 'Active', count: grouped.active.length },
    { key: 'completed', label: isBn ? 'সম্পন্ন' : 'Completed', count: grouped.completed.length },
    { key: 'all', label: isBn ? 'সব' : 'All', count: grouped.all.length },
  ];

  const visible = grouped[tab];

  return (
    <div className="space-y-5 pt-2">
      <PageHeader
        title={isBn ? 'ডেলিভারি' : 'Deliveries'}
        description={
          isBn
            ? 'আপনার নতুন, চলমান এবং সম্পন্ন ডেলিভারি দেখুন ও পরিচালনা করুন।'
            : 'Review and manage your new, active and completed deliveries.'
        }
      />

      <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((item) => (
            <TabsTrigger key={item.key} value={item.key} className="gap-1.5 text-xs sm:text-sm">
              <span className="truncate">{item.label}</span>
              <span className="rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                {item.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState
          className="min-h-[260px] rounded-2xl"
          icon={<Truck className="h-8 w-8 text-primary" />}
          title={
            tab === 'new'
              ? isBn
                ? 'নতুন অ্যাসাইনমেন্ট নেই'
                : 'No new assignments'
              : tab === 'active'
                ? isBn
                  ? 'চলমান ডেলিভারি নেই'
                  : 'No active deliveries'
                : tab === 'completed'
                  ? isBn
                    ? 'সম্পন্ন ডেলিভারি নেই'
                    : 'No completed deliveries yet'
                  : isBn
                    ? 'কোনো ডেলিভারি নেই'
                    : 'No deliveries'
          }
          description={
            isBn
              ? 'নতুন ডেলিভারি এলে এখানে দেখতে পাবেন।'
              : 'New deliveries assigned to you will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((delivery) => (
            <Card key={delivery.id} className="rounded-2xl border-border shadow-none">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="outline" className="text-[11px] uppercase">
                    {delivery.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    #{delivery.order.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <p className="truncate font-semibold text-foreground">
                  {delivery.order.user?.firstName} {delivery.order.user?.lastName}
                </p>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="line-clamp-2">
                    {delivery.order.address?.streetAddress}
                    {delivery.order.address?.contactPhone
                      ? `, ${delivery.order.address.contactPhone}`
                      : ''}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button asChild className="h-11 flex-1">
                    <Link href={`/${lang}/rider/deliveries/${delivery.id}`}>
                      {delivery.status === DeliveryStatus.ASSIGNED
                        ? isBn
                          ? 'পর্যালোচনা ও গ্রহণ'
                          : 'Review & Accept'
                        : isBn
                          ? 'বিস্তারিত'
                          : 'View Details'}
                    </Link>
                  </Button>
                  {delivery.order.user?.phone && (
                    <Button asChild variant="outline" size="icon" className="h-11 w-11 shrink-0">
                      <a
                        href={`tel:${delivery.order.user.phone}`}
                        aria-label={isBn ? 'গ্রাহককে কল করুন' : 'Call customer'}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
