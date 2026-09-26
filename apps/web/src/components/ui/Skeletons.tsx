import * as React from 'react';
import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';

export function ProductCardSkeleton() {
  return (
    <div className="group relative bg-card border border-border/70 rounded-2xl overflow-hidden shadow-xs transition-all space-y-0 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted/40">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-card border border-border/70 rounded-2xl overflow-hidden p-6 text-center shadow-xs space-y-3 flex flex-col items-center justify-center">
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3 pb-6 border-b border-border/40">
      <Skeleton className="h-3.5 w-32" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 sm:w-72" />
          <Skeleton className="h-4 w-48 sm:w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Filter toolbar skeleton */}
      <div className="flex items-center justify-between gap-4 py-2">
        <Skeleton className="h-10 w-64 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      {/* Table border box */}
      <div className="border border-border/60 rounded-2xl overflow-hidden bg-card shadow-xs">
        <div className="border-b border-border/60 bg-muted/30 p-4 flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="p-4 flex items-center gap-4">
              {Array.from({ length: columns }).map((_, cIdx) => (
                <Skeleton
                  key={cIdx}
                  className="h-4 flex-1"
                  style={{ width: `${Math.max(30, (cIdx * 25 + rIdx * 15) % 80 + 20)}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <Card className="rounded-3xl overflow-hidden border border-border/70 shadow-xs">
      <Skeleton className="h-32 w-full rounded-none" />
      <CardContent className="p-5 relative pt-0">
        <div className="-mt-8 mb-3 flex items-end justify-between">
          <Skeleton className="h-16 w-16 rounded-2xl ring-4 ring-card" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
        <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderSkeleton() {
  return (
    <Card className="w-full rounded-2xl border border-border/70 overflow-hidden shadow-xs">
      <CardHeader className="bg-muted/20 border-b border-border/40 p-4 flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-20 ml-auto" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2.5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-16 rounded-xl shrink-0" />
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeaderSkeleton />
      <Card className="rounded-3xl border border-border/70 shadow-xs">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/40">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl border border-border/70 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </Card>
        ))}
      </div>
      {/* Chart and Side Table */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-4 rounded-3xl border border-border/70 p-6 shadow-xs space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </Card>
        <Card className="lg:col-span-3 rounded-3xl border border-border/70 p-6 shadow-xs space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
