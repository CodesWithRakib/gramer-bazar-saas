'use client';

import React from 'react';
import { useGetSalesAnalyticsQuery } from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export interface SalesAnalyticsViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function SalesAnalyticsView({ lang = 'en' }: SalesAnalyticsViewProps) {
  const isBn = lang === 'bn';
  const { data, isLoading } = useGetSalesAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'বিক্রয় ফানেল' : 'Sales Funnel'}</CardTitle>
          <CardDescription>
            {isBn ? 'গ্রাহকদের ক্রয় ধাপগুলো দেখুন' : 'Observe customer purchase stages'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.salesFunnel.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                <span className="font-medium">{item.step}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Methods'}</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
            {data?.paymentMethods.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                <span className="font-medium">{item.method}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
