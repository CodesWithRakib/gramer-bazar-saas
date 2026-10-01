'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgePercent,
  Boxes,
  CircleDollarSign,
  Package,
  Receipt,
  ShoppingCart,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomImage } from '@/components/ui/CustomImage';
import { DashboardSkeleton } from '@/components/ui/Skeletons';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { getOrderStatusMeta } from '@/lib/order-status';
import { useGetSellerDashboardQuery } from '@/features/seller';
import { SellerOrderActions } from '@/features/seller/orders';

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
          title={isBn ? 'সেলার ড্যাশবোর্ড' : 'Seller dashboard'}
          description={isBn ? 'আপনার দোকানের সারসংক্ষেপ' : 'A summary of your shop'}
        />
        <ErrorState
          isBn={isBn}
          title={isBn ? 'ড্যাশবোর্ড লোড করা যায়নি' : 'Could not load your dashboard'}
          message={
            isBn
              ? 'সার্ভার থেকে বিক্রয় ও অর্ডারের তথ্য আনা সম্ভব হয়নি।'
              : 'We could not fetch your sales and order metrics from the server.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const trend = metrics.revenueData ?? [];
  const hasTrend = trend.some((point) => point.revenue > 0);
  const maxStatusCount = Math.max(1, ...metrics.orderStatusDistribution.map((row) => row.count));

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'সেলার' : 'Seller' },
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard' },
        ]}
        title={isBn ? 'সেলার ড্যাশবোর্ড' : 'Seller dashboard'}
        description={
          isBn
            ? 'আজকের বিক্রয়, অর্ডারের অবস্থা ও ইনভেন্টরির সারসংক্ষেপ এক নজরে।'
            : "Today's sales, order pipeline and inventory health at a glance."
        }
        primaryAction={
          <Button asChild className="gap-2">
            <Link href={`/${lang}/seller/products/new`}>
              <Package className="h-4 w-4" />
              {isBn ? 'নতুন পণ্য' : 'Add product'}
            </Link>
          </Button>
        }
        secondaryActions={
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/${lang}/seller/orders`}>
              <ShoppingCart className="h-4 w-4" />
              {isBn ? 'অর্ডার দেখুন' : 'View orders'}
            </Link>
          </Button>
        }
      />

      {/* Headline metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label={isBn ? 'আজকের বিক্রয়' : "Today's sales"}
          value={formatCurrency(metrics.todaySales, lang)}
          icon={<CircleDollarSign className="h-4 w-4" />}
          highlight
        />
        <MetricCard
          label={isBn ? 'আজকের অর্ডার' : "Today's orders"}
          value={formatNumber(metrics.todayOrders, lang)}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <MetricCard
          label={isBn ? 'কার্যক্রম প্রয়োজন' : 'Awaiting action'}
          value={formatNumber(metrics.awaitingActionCount, lang)}
          icon={<Receipt className="h-4 w-4" />}
          tone={metrics.awaitingActionCount > 0 ? 'warning' : 'neutral'}
        />
        <MetricCard
          label={isBn ? 'মোট আয় (নিষ্পত্তিকৃত)' : 'Lifetime settled sales'}
          value={formatCurrency(metrics.totalSales, lang)}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label={isBn ? 'এই মাসের বিক্রয়' : 'Sales this month'}
          value={formatCurrency(metrics.monthSales, lang)}
          icon={<CircleDollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label={isBn ? 'ডেলিভারি সম্পন্ন' : 'Completed orders'}
          value={formatNumber(metrics.completedOrdersCount, lang)}
          icon={<Receipt className="h-4 w-4" />}
        />
        <MetricCard
          label={isBn ? 'সক্রিয় পণ্য' : 'Active listings'}
          value={formatNumber(metrics.totalProducts, lang)}
          icon={<Package className="h-4 w-4" />}
        />
        <MetricCard
          label={isBn ? 'স্টকের মূল্য' : 'Stock value'}
          value={formatCurrency(metrics.stockValue, lang)}
          icon={<Boxes className="h-4 w-4" />}
        />
      </div>

      {(metrics.lowStockCount > 0 || metrics.outOfStockCount > 0) && (
        <Card className="border-amber-500/30 shadow-none">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-amber-600 dark:text-amber-400">
                <TriangleAlert className="h-5 w-5" />
              </span>
              <div>
                <p className="text-foreground text-sm font-semibold">
                  {isBn ? 'স্টক সতর্কতা' : 'Stock alert'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {isBn
                    ? `${metrics.lowStockCount}টি পণ্য কম স্টকে, ${metrics.outOfStockCount}টি শেষ`
                    : `${metrics.lowStockCount} low-stock and ${metrics.outOfStockCount} out-of-stock product${metrics.outOfStockCount === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={`/${lang}/seller/inventory`}>
                <Boxes className="h-4 w-4" />
                {isBn ? 'ইনভেন্টরি ঠিক করুন' : 'Fix inventory'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue trend */}
        <Card className="shadow-none lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {isBn ? 'নিষ্পত্তিকৃত বিক্রয় (৭ দিন)' : 'Settled sales (last 7 days)'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn ? 'শুধু ডেলিভারি সম্পন্ন অর্ডারের আয়' : 'Revenue from delivered orders only'}
            </CardDescription>
          </CardHeader>
          <CardContent className="ps-0 pe-4">
            {hasTrend ? (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
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
                      width={48}
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
                        isBn ? 'আয়' : 'Revenue',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={0.12}
                      fill="hsl(var(--primary))"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground flex h-[240px] flex-col items-center justify-center gap-2 text-center">
                <CircleDollarSign className="h-7 w-7 opacity-40" />
                <p className="text-xs">
                  {isBn
                    ? 'গত ৭ দিনে কোনো নিষ্পত্তিকৃত বিক্রয় নেই।'
                    : 'No settled sales in the last 7 days yet.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Wallet className="h-4 w-4 text-primary" />
              {isBn ? 'আয় ও পেআউট' : 'Earnings & payouts'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row
              label={isBn ? 'উত্তোলনযোগ্য' : 'Available to withdraw'}
              value={formatCurrency(metrics.wallet.balance)}
              strong
            />
            <Row
              label={isBn ? 'ক্লিয়ারেন্সে' : 'Pending clearance'}
              value={formatCurrency(metrics.wallet.pendingClearance)}
            />
            <Row
              label={isBn ? 'অনুরোধকৃত পেআউট' : 'Payout requested'}
              value={formatCurrency(metrics.wallet.pendingPayoutAmount)}
            />
            <Row
              label={isBn ? 'মোট আয়' : 'Total earned'}
              value={formatCurrency(metrics.wallet.totalEarned)}
            />
            <Row
              label={isBn ? 'মোট উত্তোলন' : 'Total withdrawn'}
              value={formatCurrency(metrics.wallet.totalWithdrawn)}
            />
            <Button asChild variant="outline" size="sm" className="mt-1 w-full gap-2">
              <Link href={`/${lang}/seller/wallet/payout`}>
                {isBn ? 'পেআউট অনুরোধ' : 'Request payout'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">
              {isBn ? 'সাম্প্রতিক অর্ডার' : 'Recent orders'}
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href={`/${lang}/seller/orders`}>
                {isBn ? 'সব দেখুন' : 'View all'}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.recentOrders.length === 0 ? (
              <EmptyState
                className="min-h-[220px]"
                icon={<ShoppingCart className="h-7 w-7" />}
                title={isBn ? 'এখনও কোনো অর্ডার নেই' : 'No orders yet'}
                description={
                  isBn
                    ? 'প্রথম অর্ডার এলে এখানে সাথে সাথে দেখা যাবে।'
                    : 'Your first order will appear here as soon as a customer checks out.'
                }
              />
            ) : (
              metrics.recentOrders.map((order) => {
                const meta = getOrderStatusMeta(order.status);
                return (
                  <div key={order.id} className="border-border rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {order.customerName}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          #{order.id.slice(-8).toUpperCase()} ·{' '}
                          {formatDate(order.createdAt, lang, 'short')}
                        </p>
                      </div>
                      <span className="text-foreground shrink-0 text-sm font-bold tabular-nums">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge tone={meta.tone} label={isBn ? meta.bn : meta.en} />
                      {order.allowedNextStatuses.length > 0 && (
                        <SellerOrderActions
                          orderId={order.id}
                          allowedNextStatuses={order.allowedNextStatuses}
                          isBn={isBn}
                          size="sm"
                          onTransitioned={() => refetch()}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Pipeline */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                {isBn ? 'অর্ডার পাইপলাইন' : 'Order pipeline'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isBn
                  ? `${metrics.totalOrders}টি মোট অর্ডারের মধ্যে`
                  : `Across ${metrics.totalOrders} lifetime order${metrics.totalOrders === 1 ? '' : 's'}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {metrics.orderStatusDistribution.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  {isBn ? 'কোনো অর্ডারের তথ্য নেই।' : 'No order data available.'}
                </p>
              ) : (
                metrics.orderStatusDistribution.map((row) => {
                  const meta = getOrderStatusMeta(row.status);
                  return (
                    <div key={row.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-medium">
                          {isBn ? meta.bn : meta.en}
                        </span>
                        <span className="text-muted-foreground tabular-nums">{row.count}</span>
                      </div>
                      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${(row.count / maxStatusCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Promotions */}
          <Card className="shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <BadgePercent className="text-primary h-5 w-5" />
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-sm font-medium">
                  {isBn ? 'সক্রিয় কুপন' : 'Active coupons'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {isBn
                    ? 'বর্তমানে বৈধ থাকা দোকানের কুপন'
                    : 'Shop coupons currently valid at checkout'}
                </p>
              </div>
              <span className="text-foreground text-xl font-bold tabular-nums">
                {metrics.activeCouponsCount}
              </span>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${lang}/seller/coupons`}>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Best sellers */}
        <Card className="shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {isBn ? 'সর্বাধিক বিক্রিত পণ্য' : 'Best-selling products'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn ? 'নিষ্পত্তিকৃত বিক্রয় অনুযায়ী ক্রম' : 'Ranked by settled sales revenue'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topProducts.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-xs">
                {isBn ? 'এখনও কোনো বিক্রয় হয়নি।' : 'No sales recorded yet.'}
              </p>
            ) : (
              metrics.topProducts.map((product, index) => (
                <div key={product.listingId} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-4 shrink-0 text-xs font-semibold tabular-nums">
                    {index + 1}
                  </span>
                  <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    {product.image ? (
                      <CustomImage
                        src={product.image}
                        alt={isBn ? product.nameBn : product.nameEn}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground/60 flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {isBn ? product.nameBn : product.nameEn}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {isBn ? `${product.quantitySold}টি বিক্রি` : `${product.quantitySold} sold`}
                    </p>
                  </div>
                  <span className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Low stock */}
        <Card className="shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold">
              {isBn ? 'স্টক শেষ হওয়ার পথে' : 'Needs restocking'}
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href={`/${lang}/seller/inventory`}>
                {isBn ? 'ইনভেন্টরি' : 'Inventory'}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-xs">
                {isBn ? 'সব পণ্যের স্টক পর্যাপ্ত।' : 'Every product is comfortably in stock.'}
              </p>
            ) : (
              metrics.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-medium">
                      {isBn ? product.nameBn : product.nameEn}
                    </p>
                    <p className="text-muted-foreground text-xs font-mono">{product.sku || '—'}</p>
                  </div>
                  <StatusBadge
                    tone={product.availableQuantity <= 0 ? 'danger' : 'warning'}
                    label={
                      product.availableQuantity <= 0
                        ? isBn
                          ? 'স্টক শেষ'
                          : 'Out of stock'
                        : isBn
                          ? `${product.availableQuantity} বাকি`
                          : `${product.availableQuantity} left`
                    }
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone = 'neutral',
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'neutral' | 'warning' | 'danger';
  highlight?: boolean;
}) {
  const toneClass =
    tone === 'warning'
      ? 'text-amber-600 dark:text-amber-400'
      : tone === 'danger'
        ? 'text-destructive'
        : 'text-foreground';

  return (
    <Card className="shadow-none">
      <CardContent className="space-y-1.5 p-3 sm:p-4">
        <div className="text-muted-foreground flex items-center justify-between gap-2">
          <span className="truncate text-xs">{label}</span>
          <span className="shrink-0">{icon}</span>
        </div>
        <p
          className={`truncate text-lg font-bold tabular-nums sm:text-xl ${
            highlight ? 'text-primary' : toneClass
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground min-w-0 truncate text-xs">{label}</span>
      <span
        className={`shrink-0 tabular-nums ${strong ? 'text-primary text-base font-bold' : 'text-foreground font-medium'}`}
      >
        {value}
      </span>
    </div>
  );
}
