import React from 'react';
import { Skeleton } from './skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="group relative bg-white border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="flex items-end justify-between pt-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="group relative bg-white border border-border rounded-xl overflow-hidden p-6 text-center shadow-sm transition-all duration-300 space-y-4 flex flex-col items-center justify-center">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-5 w-3/4" />
    </div>
  );
}
