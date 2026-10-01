'use client';

import React from 'react';
import { useGetProductsAnalyticsQuery } from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export interface ProductsAnalyticsViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function ProductsAnalyticsView({ lang = 'en' }: ProductsAnalyticsViewProps) {
  const isBn = lang === 'bn';
  const { data, isLoading } = useGetProductsAnalyticsQuery();

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
          <CardTitle>{isBn ? 'শীর্ষ পণ্যসমূহ' : 'Top Products'}</CardTitle>
          <CardDescription>
            {isBn ? 'বিক্রয়ের ভিত্তিতে শীর্ষ পণ্যসমূহ' : 'Top products based on revenue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.topProducts.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">#{item.productId.substring(0, 8)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-primary">{formatCurrency(item.revenue, lang)}</span>
                  <span className="text-xs text-muted-foreground">{item.sales} {isBn ? 'টি বিক্রয়' : 'sales'}</span>
                </div>
              </div>
            ))}
            {(!data?.topProducts || data.topProducts.length === 0) && (
              <div className="text-center p-6 text-muted-foreground">
                {isBn ? 'কোনো ডাটা পাওয়া যায়নি' : 'No data available'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
