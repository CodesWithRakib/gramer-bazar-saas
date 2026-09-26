'use client';

import React, { use } from 'react';
import { useGetDashboardMetricsQuery } from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Users, DollarSign,  UserCheck,  TrendingUp } from 'lucide-react';
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
  const { data, isLoading } = useGetDashboardMetricsQuery();

  if (isLoading) return <div className="p-8">{isBn ? 'ড্যাশবোর্ড মেট্রিক্স লোড হচ্ছে...' : 'Loading dashboard metrics...'}</div>;

  const metrics = data?.metrics;
  const recentOrders = data?.recentOrders || [];
  const revenueData = data?.revenueData || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</h1>
      
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{isBn ? 'সর্বমোট বিক্রয়' : 'Total Sales'}</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4.5 w-4.5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">৳{metrics.totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1.5">
                <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">+20.1%</span> {isBn ? 'গত মাস থেকে' : 'from last month'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{isBn ? 'সর্বমোট অর্ডার' : 'Total Orders'}</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <ShoppingCart className="h-4.5 w-4.5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{metrics.totalOrders}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1.5">
                <span className="font-medium text-amber-600 dark:text-amber-400 mr-1">{metrics.pendingOrders}</span> {isBn ? 'অপেক্ষমাণ' : 'pending'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{isBn ? 'গ্রাহক' : 'Customers'}</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-4.5 w-4.5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{metrics.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1.5">{isBn ? 'মোট নিবন্ধিত' : 'Total registered'}</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{isBn ? 'বিক্রেতা' : 'Sellers'}</CardTitle>
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <UserCheck className="h-4.5 w-4.5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{metrics.totalSellers}</div>
              <p className="text-xs text-muted-foreground mt-1.5">{isBn ? 'মোট নিবন্ধিত' : 'Total registered'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-xl border">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-base">{isBn ? 'রাজস্ব ওভারভিউ' : 'Revenue Overview'}</CardTitle>
            <CardDescription>{isBn ? 'গত ৭ দিনের বিক্রয়' : 'Sales over the last 7 days'}</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 pt-6 pr-6">
            <div className="h-[320px] w-full">
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
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={0.1} fill="hsl(var(--primary))" />
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
          <CardContent>
            <div className="space-y-6">
              {recentOrders.slice(0, 5).map((order: {
                id: string;
                customerName: string;
                totalAmount: string | number;
                status: string;
              }) => (
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
              {recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{isBn ? 'কোন সাম্প্রতিক অর্ডার নেই।' : 'No recent orders found.'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
