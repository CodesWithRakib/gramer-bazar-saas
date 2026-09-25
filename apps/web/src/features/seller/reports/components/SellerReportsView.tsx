'use client';

import React, { use } from 'react';
import { useGetSellerDashboardQuery } from '@/features/seller-portal/sellerPortalApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Activity, ShoppingBag, Package } from 'lucide-react';

export interface SellerReportsViewProps {
  lang?: string;
}

export function SellerReportsView({ lang = 'en' }: SellerReportsViewProps) {
  
  const isBn = lang === 'bn';

  const { data: metrics, isLoading } = useGetSellerDashboardQuery();

  if (isLoading) {
    return <div className="p-8 text-center">{isBn ? 'লোড হচ্ছে...' : 'Loading reports...'}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'রিপোর্ট এবং বিশ্লেষণ' : 'Reports & Analytics'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isBn ? 'আপনার ব্যবসার মূল মেট্রিক্স এবং পারফরম্যান্স দেখুন' : 'View key metrics and performance of your business.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'মোট বিক্রয়' : 'Total Sales'}
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{metrics?.totalSales?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'এই মাসে' : 'This month'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'সক্রিয় অর্ডার' : 'Active Orders'}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeOrdersCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'প্রসেসিং বা ডেলিভারিতে আছে' : 'Processing or out for delivery'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'স্টক অ্যালার্ট' : 'Low Stock Alert'}
            </CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics?.lowStockCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'পণ্য স্টক আউট হওয়ার পথে' : 'Products nearing stock out'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{isBn ? 'মাসিক বিক্রয় ওভারভিউ' : 'Monthly Sales Overview'}</CardTitle>
          <CardDescription>
            {isBn ? 'আপনার দোকানের পারফরম্যান্সের গ্রাফিকাল ভিউ' : 'Graphical view of your store performance'}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-muted/20 border rounded-md m-6 border-dashed">
          <div className="text-center text-muted-foreground flex flex-col items-center">
            <Activity className="h-10 w-10 mb-2 opacity-50" />
            <p>{isBn ? 'চার্ট ডেটা প্রস্তুত করা হচ্ছে...' : 'Chart data is being prepared...'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
