'use client';

import React from 'react';
import { useGetDashboardMetricsQuery } from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Users, DollarSign, UserCheck, TrendingUp } from 'lucide-react';
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

export interface AdminDashboardViewProps {
  lang?: string;
}

export function AdminDashboardView({ lang = 'en' }: AdminDashboardViewProps) {
  const isBn = lang === 'bn';
  const { data, isLoading, isError, refetch } = useGetDashboardMetricsQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
          description={
            isBn
              ? 'প্ল্যাটফর্মের বিক্রয় ও পরিচালনা কার্যক্রম'
              : 'Platform operations, sales and metrics'
          }
        />
        <ErrorState
          isBn={isBn}
          title={isBn ? 'মেট্রিক্স লোড করতে সমস্যা হয়েছে' : 'Failed to load metrics'}
          message={
            isBn
              ? 'প্ল্যাটফর্মের পরিসংখ্যান সংগ্রহ করা যায়নি।'
              : 'Unable to retrieve dashboard metrics from the server.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const metrics = data?.metrics;
  const recentOrders = data?.recentOrders || [];
  const revenueData = data?.revenueData || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isBn ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
        description={
          isBn
            ? 'গ্রামের বাজার মার্কেটপ্লেসের সার্বিক কার্যসম্পাদন, আর্থিক মেট্রিক্স ও অর্ডার পর্যবেক্ষণ করুন।'
            : 'Monitor marketplace performance, operational metrics, and platform telemetry.'
        }
      />

      {metrics && (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl border border-border bg-card shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isBn ? 'সর্বমোট বিক্রয়' : 'Total Sales'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                ৳{metrics.totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1.5 font-medium">
                <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">+20.1%</span>{' '}
                {isBn ? 'গত মাস থেকে' : 'from last month'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-card shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isBn ? 'সর্বমোট অর্ডার' : 'Total Orders'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.totalOrders}
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-1.5">
                <span className="font-semibold text-amber-600 dark:text-amber-400 mr-1">
                  {metrics.pendingOrders}
                </span>{' '}
                {isBn ? 'অপেক্ষমাণ' : 'pending'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-card shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isBn ? 'গ্রাহক' : 'Customers'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {isBn ? 'মোট সক্রিয় গ্রাহক' : 'Registered shoppers'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-card shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isBn ? 'বিক্রেতা' : 'Sellers'}
              </CardTitle>
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {metrics.totalSellers}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {isBn ? 'ভেরিফাইড মার্চেন্ট' : 'Verified merchants'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 rounded-xl border border-border shadow-none bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold text-foreground">
              {isBn ? 'রাজস্ব বিশ্লেষণ' : 'Revenue Analytics'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn ? 'গত ৭ দিনের প্ল্যাটফর্ম জিএমভি' : 'Platform GMV performance'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0 pt-6 pr-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                      borderRadius: '8px',
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill="hsl(var(--primary))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-xl border border-border shadow-none bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold text-foreground">
              {isBn ? 'সাম্প্রতিক অর্ডারসমূহ' : 'Recent Orders'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn ? 'প্ল্যাটফর্মের সাম্প্রতিক কার্যক্রম' : 'Latest order updates'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {recentOrders.map(
                (order: {
                  id: string;
                  customerName: string;
                  totalAmount: number | string;
                  status: string;
                }) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/40 transition-colors"
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
                )
              )}
              {recentOrders.length === 0 && (
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
