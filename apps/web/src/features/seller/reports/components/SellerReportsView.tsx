'use client';

import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BarChart3,
  CircleDollarSign,
  Package,
  Percent,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { CustomImage } from '@/components/ui/CustomImage';
import { useGetSellerAnalyticsQuery } from '@/features/seller';
import { formatCurrency, formatNumber } from '@/lib/format';
import { getOrderStatusMeta, statusLabel } from '@/lib/order-status';

export interface SellerReportsViewProps {
  lang?: string;
}

const RANGE_OPTIONS = [
  { days: 7, en: '7 days', bn: '৭ দিন' },
  { days: 30, en: '30 days', bn: '৩০ দিন' },
  { days: 90, en: '90 days', bn: '৯০ দিন' },
];

export function SellerReportsView({ lang = 'en' }: SellerReportsViewProps) {
  const isBn = lang === 'bn';
  const [days, setDays] = useState(30);

  const { data, isLoading, isError, refetch } = useGetSellerAnalyticsQuery(days);

  const icons = () => ({
    dollar: <CircleDollarSign className="h-4 w-4" />,
    up: <TrendingUp className="h-4 w-4" />,
    month: <BarChart3 className="h-4 w-4" />,
    bag: <ShoppingBag className="h-4 w-4" />,
    percent: <Percent className="h-4 w-4" />,
    package: <Package className="h-4 w-4" />,
  });

  const metric = (label: string, value: string, key: keyof ReturnType<typeof icons>) => (
    <Card key={label}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-xs font-medium">{label}</CardTitle>
        {icons()[key]}
      </CardHeader>
      <CardContent>
        <div className="text-foreground text-xl font-bold sm:text-2xl">{value}</div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <LoadingState message={isBn ? 'রিপোর্ট লোড হচ্ছে...' : 'Loading reports...'} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title={isBn ? 'রিপোর্ট লোড করা যায়নি' : 'Could not load reports'}
        message={
          isBn
            ? 'বিক্রয় বিশ্লেষণ আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
            : 'There was a problem loading your sales analytics. Please try again.'
        }
        onRetry={refetch}
        isBn={isBn}
      />
    );
  }

  const { sales, orders, inventory, promotions, bestSellers, revenueByCategory, revenueTrend } =
    data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'রিপোর্ট' : 'Reports' },
        ]}
        title={isBn ? 'বিক্রয় রিপোর্ট ও বিশ্লেষণ' : 'Sales reports & analytics'}
        description={
          isBn
            ? 'আপনার দোকানের প্রকৃত বিক্রয়, অর্ডার ও ইনভেন্টরি পারফরম্যান্স'
            : 'Real sales, order and inventory performance for your shop'
        }
        secondaryActions={
          <div className="border-border bg-card flex items-center gap-1 rounded-lg border p-1">
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.days}
                type="button"
                size="sm"
                variant={days === option.days ? 'default' : 'ghost'}
                className="h-7 px-3 text-xs"
                onClick={() => setDays(option.days)}
              >
                {isBn ? option.bn : option.en}
              </Button>
            ))}
          </div>
        }
      />

      {/* Headline metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {metric('আজকের বিক্রয়', formatCurrency(sales.today), 'dollar')}
        {metric('এই সপ্তাহে', formatCurrency(sales.thisWeek), 'up')}
        {metric('এই মাসে', formatCurrency(sales.thisMonth), 'month')}
        {metric('সর্বমোট বিক্রয়', formatCurrency(sales.lifetime), 'bag')}
        {metric('গড় অর্ডার মূল্য', formatCurrency(sales.averageOrderValueThisMonth), 'percent')}
        {metric('এই মাসে বিক্রি ইউনিট', formatNumber(sales.unitsSoldThisMonth), 'package')}
      </div>

      {/* Revenue trend */}
      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'রাজস্বের প্রবণতা' : 'Revenue trend'}</CardTitle>
          <CardDescription>
            {isBn
              ? `গত ${days} দিনে নিষ্পত্তিকৃত বিক্রয়`
              : `Settled revenue over the last ${days} days`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revenueTrend.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-4 w-4" />}
              title={isBn ? 'এখনো কোনো বিক্রয় নেই' : 'No sales data yet'}
              description={
                isBn
                  ? 'অর্ডার ডেলিভারি সম্পন্ন হলে এখানে বিক্রয়ের গ্রাফ দেখা যাবে।'
                  : 'Once your orders are delivered, revenue will appear here.'
              }
              className="min-h-[240px]"
            />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sellerReportFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tickFormatter={(value: number) => `৳${value}`}
                  />
                  <Tooltip
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: '10px',
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      fontSize: 12,
                    }}
                    formatter={(value: unknown) => [
                      formatCurrency(Number(value) || 0),
                      isBn ? 'রাজস্ব' : 'Revenue',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#sellerReportFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order funnel */}
        <Card>
          <CardHeader>
            <CardTitle>{isBn ? 'অর্ডার সারসংক্ষেপ' : 'Order summary'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatRow label={isBn ? 'আজ' : 'Today'} value={formatNumber(orders.today)} />
              <StatRow
                label={isBn ? 'এই মাসে' : 'This month'}
                value={formatNumber(orders.thisMonth)}
              />
              <StatRow
                label={isBn ? 'সর্বমোট' : 'Lifetime'}
                value={formatNumber(orders.lifetime)}
              />
              <StatRow
                label={isBn ? 'কার্যক্রম প্রয়োজন' : 'Awaiting action'}
                value={formatNumber(orders.awaitingAction)}
              />
              <StatRow
                label={isBn ? 'সম্পন্ন' : 'Completed'}
                value={formatNumber(orders.completed)}
              />
              <StatRow
                label={isBn ? 'বাতিল' : 'Cancelled'}
                value={formatNumber(orders.cancelled)}
              />
            </div>

            {orders.statusDistribution.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                {orders.statusDistribution.map((row) => (
                  <div key={row.status} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {statusLabel(getOrderStatusMeta(row.status), isBn)}
                    </span>
                    <span className="text-foreground font-medium">{formatNumber(row.count)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory + promotions */}
        <Card>
          <CardHeader>
            <CardTitle>{isBn ? 'ইনভেন্টরি ও প্রমোশন' : 'Inventory & promotions'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatRow
                label={isBn ? 'সক্রিয় পণ্য' : 'Active listings'}
                value={formatNumber(inventory.activeListings)}
              />
              <StatRow
                label={isBn ? 'স্টক মূল্য' : 'Stock value'}
                value={formatCurrency(inventory.stockValue)}
              />
              <StatRow
                label={isBn ? 'কম স্টক' : 'Low stock'}
                value={formatNumber(inventory.lowStockCount)}
              />
              <StatRow
                label={isBn ? 'স্টক শেষ' : 'Out of stock'}
                value={formatNumber(inventory.outOfStockCount)}
              />
              <StatRow
                label={isBn ? 'সক্রিয় কুপন' : 'Active coupons'}
                value={formatNumber(promotions.activeCoupons)}
              />
              <StatRow
                label={isBn ? 'মোট কুপন' : 'Total coupons'}
                value={formatNumber(promotions.totalCoupons)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Best sellers */}
        <Card>
          <CardHeader>
            <CardTitle>{isBn ? 'সর্বাধিক বিক্রিত পণ্য' : 'Best selling products'}</CardTitle>
          </CardHeader>
          <CardContent>
            {bestSellers.length === 0 ? (
              <EmptyState
                icon={<Package className="h-4 w-4" />}
                title={isBn ? 'এখনো কোনো বিক্রয় নেই' : 'No sales yet'}
                description={
                  isBn
                    ? 'ডেলিভারি সম্পন্ন হওয়া অর্ডার এখানে দেখানো হবে।'
                    : 'Delivered orders will show the top performers here.'
                }
                className="min-h-[200px]"
              />
            ) : (
              <ul className="divide-border divide-y">
                {bestSellers.map((item) => (
                  <li key={item.listingId} className="flex items-center gap-3 py-3">
                    <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                      <CustomImage
                        src={item.image}
                        alt={isBn ? item.nameBn : item.nameEn}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {isBn ? item.nameBn : item.nameEn}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatNumber(item.quantitySold)} {isBn ? 'ইউনিট' : 'units'}
                      </p>
                    </div>
                    <span className="text-foreground shrink-0 text-sm font-semibold">
                      {formatCurrency(item.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Revenue by category */}
        <Card>
          <CardHeader>
            <CardTitle>{isBn ? 'ক্যাটাগরি অনুযায়ী রাজস্ব' : 'Revenue by category'}</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByCategory.length === 0 ? (
              <EmptyState
                icon={<BarChart3 className="h-4 w-4" />}
                title={isBn ? 'তথ্য নেই' : 'No data yet'}
                description={
                  isBn
                    ? 'বিক্রয় শুরু হলে ক্যাটাগরি বিশ্লেষণ দেখা যাবে।'
                    : 'Category insights appear once you have sales.'
                }
                className="min-h-[200px]"
              />
            ) : (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueByCategory.map((row) => ({
                      name: isBn ? row.nameBn : row.nameEn,
                      revenue: row.revenue,
                    }))}
                    margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      tickFormatter={(value: string) =>
                        value.length > 10 ? `${value.slice(0, 10)}…` : value
                      }
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={52}
                      tickFormatter={(value: number) => `৳${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        fontSize: 12,
                      }}
                      formatter={(value: unknown) => [
                        formatCurrency(Number(value) || 0),
                        isBn ? 'রাজস্ব' : 'Revenue',
                      ]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-muted/20 rounded-lg border p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground mt-0.5 text-base font-semibold">{value}</p>
    </div>
  );
}
