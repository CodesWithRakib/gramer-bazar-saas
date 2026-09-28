'use client';

import React from 'react';
import { useGetRiderDashboardQuery } from '@/features/deliveries/deliveriesApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MapPin, Phone, Banknote, Navigation, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface RiderDashboardViewProps {
  lang?: string;
}

export function RiderDashboardView({ lang = 'en' }: RiderDashboardViewProps) {
  const isBn = lang === 'bn';

  const { data, isLoading, isError } = useGetRiderDashboardQuery(undefined, {
    pollingInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center text-sm text-destructive bg-destructive/5 rounded-2xl border border-destructive/20 my-4">
        {isBn ? 'ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।' : 'Failed to load rider dashboard.'}
      </div>
    );
  }

  const { metrics, deliveriesTrend = [], recentDeliveries = [] } = data;
  const activeCount = metrics.activeCount || 0;
  const pendingCount = metrics.assignedCount || 0;
  const completedCount = metrics.completedCount || 0;
  const totalEarnings = metrics.totalEarnings || 0;

  return (
    <div className="space-y-6 pt-2">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isBn ? 'রাইডার ড্যাশবোর্ড' : 'Rider Dashboard'}
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            {isBn ? 'আজকের কাজ ও ডেলিভারি অগ্রগতি' : "Today's deliveries & earnings progress"}
          </p>
        </div>
        <Badge
          variant={activeCount > 0 ? 'default' : 'secondary'}
          className="h-8 px-3 font-semibold text-xs"
        >
          {activeCount > 0 ? (isBn ? 'ডিউটিতে আছেন' : 'On Duty') : isBn ? 'অপেক্ষমাণ' : 'Standby'}
        </Badge>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBn ? 'অ্যাসাইনকৃত' : 'Assigned'}
              </p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {pendingCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBn ? 'চলমান' : 'Active'}
              </p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {activeCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBn ? 'সম্পন্ন' : 'Delivered'}
              </p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {completedCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {isBn ? 'মোট আয়' : 'Earnings'}
              </p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                ৳{totalEarnings.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Performance Chart */}
      {deliveriesTrend.length > 0 && (
        <Card className="rounded-xl border border-border bg-card shadow-none overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-semibold text-foreground">
              {isBn ? 'ডেলিভারি প্রবণতা (গত ৭ দিন)' : 'Delivery Trends (Last 7 Days)'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn ? 'প্রতিদিনের সম্পন্ন ডেলিভারি ও আয়' : 'Daily completed deliveries & earnings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0 pt-6 pr-6">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={deliveriesTrend}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
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
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={0.15}
                    fill="hsl(var(--primary))"
                    name={isBn ? 'সম্পন্ন' : 'Completed'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Deliveries List */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base md:text-lg text-foreground">
          {isBn ? 'সাম্প্রতিক অ্যাসাইনমেন্ট ও কাজ' : 'Assigned Deliveries'} (
          {recentDeliveries.length})
        </h2>

        {recentDeliveries.length === 0 && (
          <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl">
            <p className="text-xs text-muted-foreground">
              {isBn
                ? 'এই মুহূর্তে কোনো নতুন ডেলিভারি অ্যাসাইনমেন্ট নেই।'
                : 'No active delivery assignments at the moment.'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {recentDeliveries.map((delivery) => (
            <Card
              key={delivery.id}
              className="border border-border/80 bg-card rounded-xl overflow-hidden hover:border-primary/40 transition-colors shadow-none"
            >
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                    {delivery.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono ml-2">
                    #{delivery.order?.id ? delivery.order.id.slice(0, 8) : delivery.id.slice(0, 8)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-primary">
                  ৳{Number(delivery.order?.total || 0).toLocaleString()}
                </span>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 space-y-3">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    {delivery.order?.address?.streetAddress ||
                      delivery.order?.address?.street ||
                      (isBn ? 'ঠিকানা উপলব্ধ নেই' : 'Address not specified')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1 font-semibold rounded-lg">
                    <Link href={`/${lang}/rider/deliveries/${delivery.id}`}>
                      {isBn ? 'বিস্তারিত ও ট্র্যাক' : 'View & Track'}
                    </Link>
                  </Button>
                  {delivery.order?.user?.phone && (
                    <Button asChild variant="outline" size="sm" className="rounded-lg px-3">
                      <a href={`tel:${delivery.order.user.phone}`} aria-label="Call customer">
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
