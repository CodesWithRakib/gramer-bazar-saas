'use client';

import React from 'react';
import { useGetSellerDashboardQuery } from '@/features/seller-portal/sellerPortalApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PackageX, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardSkeleton } from '@/components/ui/Skeletons';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface SellerDashboardViewProps {
  lang?: string;
}

export function SellerDashboardView({ lang = 'en' }: SellerDashboardViewProps) {
  const isBn = lang === 'bn';
  const { data: metrics, isLoading, isError, refetch } = useGetSellerDashboardQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !metrics) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'সেলার ড্যাশবোর্ড' : 'Seller Dashboard'}
          description={isBn ? 'আপনার দোকানের বর্তমান অবস্থা' : 'Overview of your shop'}
        />
        <ErrorState
          isBn={isBn}
          title={isBn ? 'ড্যাশবোর্ড লোড করতে ত্রুটি হয়েছে' : 'Failed to load dashboard'}
          message={
            isBn
              ? 'দোকানের সাম্প্রতিক মেট্রিক্স সংগ্রহ করা সম্ভব হয়নি।'
              : 'Unable to load seller metrics from the server.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isBn ? 'সেলার ড্যাশবোর্ড' : 'Seller Dashboard'}
        description={
          isBn
            ? 'আপনার দোকানের বিক্রয়, অর্ডার এবং ইনভেন্টরির সার্বিক অবস্থা পর্যবেক্ষণ করুন।'
            : 'Monitor your shop sales, pending orders, and inventory status in real-time.'
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 border-primary/20 rounded-2xl bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {isBn ? 'মোট বিক্রি' : 'Total Sales'}
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              ৳{metrics.totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 rounded-2xl border-border/70 bg-card">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              {isBn ? 'পেন্ডিং / সক্রিয় অর্ডার' : 'Active Orders'}
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-extrabold tracking-tight text-foreground">
              {metrics.activeOrdersCount}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`relative overflow-hidden group hover:shadow-md transition-all duration-300 rounded-2xl bg-card ${
            metrics.lowStockCount ? 'border-destructive/40' : 'border-border/70'
          }`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              metrics.lowStockCount
                ? 'from-destructive/10 via-destructive/5 to-transparent'
                : 'from-amber-500/10 via-amber-500/5 to-transparent'
            }`}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle
              className={`text-sm font-semibold ${
                metrics.lowStockCount ? 'text-destructive font-bold' : 'text-muted-foreground'
              }`}
            >
              {isBn ? 'লো স্টক প্রোডাক্ট' : 'Low Stock Products'}
            </CardTitle>
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                metrics.lowStockCount ? 'bg-destructive/10' : 'bg-amber-500/10'
              }`}
            >
              <PackageX
                className={`h-5 w-5 ${
                  metrics.lowStockCount ? 'text-destructive' : 'text-amber-500'
                }`}
              />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className={`text-3xl font-extrabold tracking-tight ${
                metrics.lowStockCount ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {metrics.lowStockCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="lg:col-span-4 shadow-xs border-border/70 rounded-3xl overflow-hidden bg-card">
          <CardHeader className="bg-muted/15 pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold text-foreground">
              {isBn ? 'রাজস্ব ওভারভিউ' : 'Revenue Overview'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn ? 'গত ৭ দিনের বিক্রয় অগ্রগতি' : 'Sales performance over the last 7 days'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0 pt-6 pr-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.revenueData || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                    cursor={{
                      stroke: 'hsl(var(--primary))',
                      strokeWidth: 1,
                      strokeDasharray: '3 3',
                    }}
                    contentStyle={{
                      borderRadius: '16px',
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-xs border-border/70 rounded-3xl overflow-hidden bg-card">
          <CardHeader className="bg-muted/15 pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold text-foreground">
              {isBn ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn ? 'আপনার স্টোরের সর্বশেষ অর্ডারসমূহ' : 'Latest orders received by your store'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {(metrics.recentOrders || []).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 ring-1 ring-primary/20">
                      {order.customerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-foreground truncate">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Order #{order.id.split('-')[0]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      ৳{Number(order.totalAmount).toLocaleString()}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] mt-0.5 ${
                        order.status === 'PENDING'
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : order.status === 'DELIVERED'
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!metrics.recentOrders || metrics.recentOrders.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="bg-muted/40 p-3.5 rounded-full mb-2">
                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isBn ? 'কোন সাম্প্রতিক অর্ডার নেই।' : 'No recent orders found.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
