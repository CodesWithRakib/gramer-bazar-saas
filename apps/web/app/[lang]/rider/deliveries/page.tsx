'use client';

import React, { use, useState, useEffect } from 'react';
import { useGetRiderDeliveriesQuery } from '@/features/deliveries/deliveriesApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RiderDeliveriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState('en');
  useEffect(() => { params.then(p => setLang(p.lang)); }, [params]);
  const isBn = lang === 'bn';

  const { data: deliveries, isLoading } = useGetRiderDeliveriesQuery(undefined, {
    pollingInterval: 30000,
  });

  if (isLoading) {
    return <div className="space-y-4 pt-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>;
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="pt-12 text-center text-muted-foreground">
        <p>{isBn ? 'আপনার কোনো অ্যাসাইনমেন্ট নেই' : 'You have no assignments.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold">{isBn ? 'সকল অ্যাসাইনমেন্ট' : 'All Assignments'}</h1>
      </div>

      <div className="space-y-3">
        {deliveries.map((delivery) => (
          <Link key={delivery.id} href={`/${lang}/rider/deliveries/${delivery.id}`} className="block">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-xs uppercase">{delivery.status.replace(/_/g, ' ')}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">#{delivery.order.id.slice(-6).toUpperCase()}</span>
                </div>
                <CardTitle className="text-lg mt-2 flex justify-between items-center">
                  <span>{delivery.order.user?.firstName} {delivery.order.user?.lastName}</span>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
