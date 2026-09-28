'use client';

import React from 'react';
import { useGetSellerDashboardQuery } from '@/features/seller-portal/sellerPortalApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PackageX, ShoppingCart, DollarSign, Package, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  const { data: metrics, isLoading, isError } = useGetSellerDashboardQuery();

  if (isError) {
    return (
      <div className="p-8 text-center text-sm text-destructive bg-destructive/5 rounded-2xl border border-destructive/20 my-4">
        {isBn ? 'ড্যাশবোর্ড লোড করতে ত্রুটি হয়েছে' : 'Failed to load seller dashboard'}
      </div>
    );
  }

  const orderStatusDistribution = metrics?.orderStatusDistribution || [];
  const topProducts = metrics?.topProducts || [];
  const lowStockProducts = metrics?.lowStockProducts || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isBn ? 'সেলার ড্যাশবোর্ড' : 'Seller Dashboard'}
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm">
          {isBn
            ? 'আপনার স্টোরের বিক্রয়, অর্ডার ও ইনভেন্টরি পর্যবেক্ষণ করুন'
            : 'Overview of your store sales, orders and inventory'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isBn ? 'মোট বিক্রয়' : 'Total Sales'}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                ৳{(metrics?.totalSales || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isBn ? 'মোট অর্ডার' : 'Total Orders'}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {metrics?.totalOrders || metrics?.activeOrdersCount || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isBn ? 'মোট পণ্য' : 'Total Products'}
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {metrics?.totalProducts || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className={`rounded-xl border border-border bg-card shadow-none ${metrics?.lowStockCount ? 'border-destructive/40' : ''}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider ${metrics?.lowStockCount ? 'text-destructive' : ''}`}
            >
              {isBn ? 'লো স্টক প্রোডাক্ট' : 'Low Stock'}
            </CardTitle>
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${metrics?.lowStockCount ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}
            >
              <PackageX className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div
                className={`text-xl md:text-2xl font-bold tracking-tight ${metrics?.lowStockCount ? 'text-destructive' : 'text-foreground'}`}
              >
                {metrics?.lowStockCount || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {metrics && (
        <>
          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4 rounded-xl border border-border shadow-none bg-card overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {isBn ? 'রাজস্ব ওভারভিউ (গত ৭ দিন)' : 'Revenue Overview (Last 7 Days)'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn ? 'দৈনিক অর্জিত বিক্রয়' : 'Daily sales volume across your shop'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-0 pt-6 pr-6">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={metrics.revenueData || []}
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
                        tickFormatter={(value) => `৳${value}`}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--card))',
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

            {/* Order Status Distribution */}
            <Card className="lg:col-span-3 rounded-xl border border-border shadow-none bg-card overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {isBn ? 'অর্ডারের স্থিতি বিভাজন' : 'Orders by Status'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn ? 'বর্তমান অর্ডারের অবস্থা' : 'Breakdown of your shop orders'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-0 pt-6 pr-6">
                {orderStatusDistribution.length > 0 ? (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={orderStatusDistribution}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="status"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
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
                            border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--card))',
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[280px] text-center text-muted-foreground text-xs">
                    {isBn ? 'কোনো অর্ডার ডেটা নেই' : 'No order data available'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row: Low Stock Alert & Recent Orders */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Top Products / Low Stock Warnings */}
            <Card className="lg:col-span-4 rounded-xl border border-border shadow-none bg-card overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      {isBn ? 'ইনভেন্টরি সতর্কতা ও সেরা পণ্য' : 'Top Products & Inventory Status'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isBn
                        ? 'বিক্রয় পারফরম্যান্স এবং রি-স্টক পণ্য'
                        : 'Best performing items and low inventory alerts'}
                    </CardDescription>
                  </div>
                  {lowStockProducts.length > 0 && (
                    <Badge
                      variant="outline"
                      className="border-destructive/40 text-destructive text-xs gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        {lowStockProducts.length} {isBn ? 'টি কম স্টকে' : 'low'}
                      </span>
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {lowStockProducts.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isBn ? 'অনতিবিলম্বে রিস্টক প্রয়োজন:' : 'Needs Restocking Soon:'}
                    </p>
                    {lowStockProducts.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-destructive/5 border border-destructive/15"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {isBn ? p.nameBn : p.nameEn}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isBn ? 'সীমা:' : 'Threshold:'} {p.lowStockThreshold}
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {isBn ? 'অবশিষ্ট:' : 'Left:'} {p.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {topProducts.slice(0, 4).map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {isBn ? prod.nameBn : prod.nameEn}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {prod.quantitySold} {isBn ? 'টি বিক্রি হয়েছে' : 'units sold'}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          ৳{Number(prod.revenue).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    {isBn ? 'কোনো পণ্য সতর্কতা নেই।' : 'All products have healthy stock levels.'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="lg:col-span-3 rounded-xl border border-border shadow-none bg-card overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {isBn ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn ? 'আপনার স্টোরের সর্বশেষ অর্ডারসমূহ' : 'Latest customer orders'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {(metrics.recentOrders || []).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {order.customerName ? order.customerName.charAt(0) : 'C'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight text-foreground truncate">
                            {order.customerName}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            #{order.id.slice(0, 8)}
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
        </>
      )}
    </div>
  );
}
