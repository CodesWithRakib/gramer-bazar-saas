'use client';
import { use } from 'react';

import React from 'react';
import { useGetSellerDashboardQuery } from '@/features/seller-portal/sellerPortalApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PackageX, ShoppingCart, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

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

      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>{isBn ? 'রাজস্ব ওভারভিউ' : 'Revenue Overview'}</CardTitle>
              <CardDescription>{isBn ? 'গত ৭ দিনের বিক্রয়' : 'Sales over the last 7 days'}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.revenueData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `৳${value}`}
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>{isBn ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}</CardTitle>
              <CardDescription>{isBn ? 'আপনার স্টোরের সর্বশেষ অর্ডারসমূহ' : 'Latest orders in your store'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(metrics.recentOrders || []).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground mt-1">Order #{order.id.split('-')[0]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">৳{Number(order.totalAmount).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-1">{order.status}</p>
                    </div>
                  </div>
                ))}
                {(!metrics.recentOrders || metrics.recentOrders.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">{isBn ? 'কোন সাম্প্রতিক অর্ডার নেই।' : 'No recent orders found.'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
