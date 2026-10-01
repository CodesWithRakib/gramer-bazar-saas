'use client';

import React from 'react';
import { useGetDashboardMetricsQuery } from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingBag, Users, Store, Loader2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface AnalyticsOverviewViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AnalyticsOverviewView({ lang = 'en' }: AnalyticsOverviewViewProps) {
  const isBn = lang === 'bn';
  const { data, isLoading } = useGetDashboardMetricsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const metrics = data?.metrics;
  const revenueData = data?.revenueData || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isBn ? 'মোট বিক্রয়' : 'Total Sales'}
              </p>
              <h2 className="text-2xl font-bold mt-1">
                {formatCurrency(metrics?.totalSales || 0, lang)}
              </h2>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isBn ? 'মোট অর্ডার' : 'Total Orders'}
              </p>
              <h2 className="text-2xl font-bold mt-1">{metrics?.totalOrders || 0}</h2>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isBn ? 'গ্রাহক' : 'Customers'}
              </p>
              <h2 className="text-2xl font-bold mt-1">{metrics?.totalCustomers || 0}</h2>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full">
              <Users className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {isBn ? 'বিক্রেতা' : 'Sellers'}
              </p>
              <h2 className="text-2xl font-bold mt-1">{metrics?.totalSellers || 0}</h2>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Store className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'রাজস্ব ট্রেন্ড (গত ৭ দিন)' : 'Revenue Trend (Last 7 Days)'}</CardTitle>
          <CardDescription>
            {isBn ? 'প্রতিদিনের বিক্রয়ের পরিসংখ্যান' : 'Daily sales performance overview'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'currentColor' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'currentColor' }} 
                  tickFormatter={(val) => `৳${val}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`৳${value}`, isBn ? 'রাজস্ব' : 'Revenue']}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
