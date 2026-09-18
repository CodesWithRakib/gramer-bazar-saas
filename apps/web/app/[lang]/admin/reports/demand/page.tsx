'use client';

import React from 'react';
import { useGetDemandAnalyticsQuery } from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function DemandReportsPage() {
  const { data, isLoading } = useGetDemandAnalyticsQuery();

  if (isLoading) return <div>Loading reports...</div>;
  if (!data) return <div>No demand data available.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Demand Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase Trends */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Purchase Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.purchaseTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="purchases" stroke="#10b981" name="Purchases" />
                <Line type="monotone" dataKey="carts" stroke="#3b82f6" name="Add to Cart" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Products */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.popularProducts.map((p) => (
                <div key={p.productId} className="flex justify-between items-center border-b pb-2">
                  <div className="font-medium truncate max-w-[200px]">{p.productName}</div>
                  <div className="text-sm text-muted-foreground flex gap-3">
                    <span title="Views">👁 {p.views}</span>
                    <span title="Carts">🛒 {p.carts}</span>
                    <span title="Purchases">💰 {p.purchases}</span>
                  </div>
                </div>
              ))}
              {data.popularProducts.length === 0 && <div className="text-muted-foreground">No data</div>}
            </div>
          </CardContent>
        </Card>

        {/* Popular Searches */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Searches</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularSearches} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="query" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Searches" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Frequently Unavailable */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Unavailable (High View, 0 Stock)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.frequentlyUnavailable.map((u) => (
                <div key={u.productId} className="flex justify-between items-center border-b pb-2 text-destructive">
                  <div className="font-medium truncate max-w-[200px]">{u.productName}</div>
                  <div className="text-sm flex gap-3">
                    <span title="Missed Views">👁 {u.views}</span>
                  </div>
                </div>
              ))}
              {data.frequentlyUnavailable.length === 0 && <div className="text-muted-foreground">No unavailable products tracked.</div>}
            </div>
          </CardContent>
        </Card>

        {/* Requested Products Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Product Requests & Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.requestedProducts.map((r) => (
                <div key={r.productRequestId} className="flex justify-between items-center border-b pb-2">
                  <div className="font-medium truncate max-w-[150px]">{r.productRequestId}</div>
                  <div className="text-sm text-muted-foreground flex gap-3">
                    <span title="Requests">✋ {r.requests}</span>
                    <span title="Purchases">💰 {r.purchases}</span>
                    <span title="Conversion Rate" className="font-bold text-primary">{r.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              {data.requestedProducts.length === 0 && <div className="text-muted-foreground">No request conversions tracked.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
