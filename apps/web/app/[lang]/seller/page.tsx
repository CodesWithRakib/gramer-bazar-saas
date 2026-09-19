'use client';
import { use } from 'react';

import React from 'react';
import { useGetSellerDashboardQuery } from '@/features/seller-portal/sellerPortalApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageX, ShoppingCart, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellerDashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: metrics, isLoading, isError } = useGetSellerDashboardQuery();

  if (isError) {
    return <div className="text-red-500">{isBn ? 'ড্যাশবোর্ড লোড করতে ত্রুটি হয়েছে' : 'Failed to load dashboard'}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isBn ? 'সেলার ড্যাশবোর্ড' : 'Seller Dashboard'}</h1>
        <p className="text-muted-foreground">{isBn ? 'আপনার দোকানের বর্তমান অবস্থা' : 'Overview of your shop'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'মোট বিক্রি' : 'Total Sales'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                ৳ {metrics?.totalSales.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'পেন্ডিং / সক্রিয় অর্ডার' : 'Active Orders'}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.activeOrdersCount}</div>
            )}
          </CardContent>
        </Card>

        <Card className={metrics?.lowStockCount ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${metrics?.lowStockCount ? 'text-red-500' : ''}`}>
              {isBn ? 'লো স্টক প্রোডাক্ট' : 'Low Stock Products'}
            </CardTitle>
            <PackageX className={`h-4 w-4 ${metrics?.lowStockCount ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold ${metrics?.lowStockCount ? 'text-red-500' : ''}`}>
                {metrics?.lowStockCount}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
