'use client';
import { use } from 'react';

import React from 'react';
import { useGetSellerDashboardQuery } from '@/features/seller-portal/sellerPortalApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PackageX, ShoppingCart, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AreaChart, 
  Area, 
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {isBn ? 'মোট বিক্রি' : 'Total Sales'}
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">
                ৳ {metrics?.totalSales.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {isBn ? 'পেন্ডিং / সক্রিয় অর্ডার' : 'Active Orders'}
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">{metrics?.activeOrdersCount}</div>
            )}
          </CardContent>
        </Card>

        <Card className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${metrics?.lowStockCount ? 'border-red-500/50' : ''}`}>
          <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${metrics?.lowStockCount ? 'from-red-500/10 via-red-500/5 to-transparent' : 'from-amber-500/10 via-amber-500/5 to-transparent'}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className={`text-sm font-semibold text-muted-foreground ${metrics?.lowStockCount ? 'text-red-500' : ''}`}>
              {isBn ? 'লো স্টক প্রোডাক্ট' : 'Low Stock Products'}
            </CardTitle>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${metrics?.lowStockCount ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
              <PackageX className={`h-5 w-5 ${metrics?.lowStockCount ? 'text-red-500' : 'text-amber-500'}`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-3xl font-bold tracking-tight ${metrics?.lowStockCount ? 'text-red-500' : ''}`}>
                {metrics?.lowStockCount}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {metrics && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
          <Card className="col-span-4 shadow-sm border-muted/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 pb-6 border-b border-muted/30">
              <CardTitle className="text-lg">{isBn ? 'রাজস্ব ওভারভিউ' : 'Revenue Overview'}</CardTitle>
              <CardDescription>{isBn ? 'গত ৭ দিনের বিক্রয়' : 'Sales over the last 7 days'}</CardDescription>
            </CardHeader>
            <CardContent className="pl-0 pt-6 pr-6">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.revenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `৳${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 shadow-sm border-muted/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/10 pb-6 border-b border-muted/30">
              <CardTitle className="text-lg">{isBn ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}</CardTitle>
              <CardDescription>{isBn ? 'আপনার স্টোরের সর্বশেষ অর্ডারসমূহ' : 'Latest orders in your store'}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {(metrics.recentOrders || []).map((order) => (
                  <div key={order.id} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm transition-transform group-hover:scale-110">
                        {order.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground mt-1">Order #{order.id.split('-')[0]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tracking-tight">৳{Number(order.totalAmount).toLocaleString()}</p>
                      <p className={`text-[10px] uppercase font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${
                        order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
                {(!metrics.recentOrders || metrics.recentOrders.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-muted/30 p-4 rounded-full mb-3">
                      <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{isBn ? 'কোন সাম্প্রতিক অর্ডার নেই।' : 'No recent orders found.'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
