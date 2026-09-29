'use client';

import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Search, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { useGetRiderHistoryQuery, RiderHistoryParams } from '@/features/riders/ridersApi';
import { DeliveryStatus } from '@/features/deliveries/deliveriesApi';

export interface RiderHistoryViewProps {
  lang?: string;
}

const PAGE_SIZE = 10;

export function RiderHistoryView({ lang = 'en' }: RiderHistoryViewProps) {
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DeliveryStatus | 'ALL'>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const params: RiderHistoryParams = {
    page,
    limit: PAGE_SIZE,
    ...(status !== 'ALL' ? { status } : {}),
    ...(search ? { search } : {}),
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetRiderHistoryQuery(params);

  const resetToFirstPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const statusOptions: { value: DeliveryStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: isBn ? 'সব স্ট্যাটাস' : 'All statuses' },
    { value: DeliveryStatus.DELIVERED, label: isBn ? 'সম্পন্ন' : 'Delivered' },
    { value: DeliveryStatus.FAILED, label: isBn ? 'ব্যর্থ' : 'Failed' },
    { value: DeliveryStatus.CANCELLED, label: isBn ? 'বাতিল' : 'Cancelled' },
  ];

  return (
    <div className="space-y-5 pt-2">
      <PageHeader
        title={isBn ? 'ডেলিভারি ইতিহাস' : 'Delivery History'}
        description={
          isBn
            ? 'আপনার পূর্বের সব ডেলিভারির রেকর্ড দেখুন।'
            : 'Browse your past deliveries and their outcomes.'
        }
      />

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(searchInput.trim());
          setPage(1);
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={isBn ? 'অর্ডার নম্বর দিয়ে খুঁজুন' : 'Search by order number'}
            className="h-11 ps-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => resetToFirstPage(setStatus)(value as DeliveryStatus | 'ALL')}
        >
          <SelectTrigger className="h-11 sm:w-48">
            <SelectValue placeholder={isBn ? 'স্ট্যাটাস' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState isBn={isBn} onRetry={refetch} />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          className="min-h-[260px] rounded-2xl"
          icon={<Truck className="h-8 w-8 text-primary" />}
          title={isBn ? 'কোনো ইতিহাস নেই' : 'No delivery history'}
          description={
            search || status !== 'ALL'
              ? isBn
                ? 'এই ফিল্টারে কোনো ডেলিভারি পাওয়া যায়নি।'
                : 'No deliveries matched your filters.'
              : isBn
                ? 'সম্পন্ন ডেলিভারি এখানে দেখা যাবে।'
                : 'Completed deliveries will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((delivery) => (
            <Card key={delivery.id} className="rounded-2xl border-border shadow-none">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline" className="text-[11px] uppercase">
                    {delivery.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    #{delivery.order.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <p className="truncate font-medium text-foreground">
                  {delivery.order.user?.firstName} {delivery.order.user?.lastName}
                </p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                  <span className="line-clamp-2">{delivery.order.address?.streetAddress}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(delivery.deliveryTime || delivery.updatedAt).toLocaleDateString(
                      isBn ? 'bn-BD' : 'en-GB',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                  </span>
                  <span className="font-semibold text-foreground">
                    {'\u09F3'}
                    {Number(delivery.order.deliveryFee || 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            className="h-10"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {isBn ? 'আগের' : 'Previous'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {isBn
              ? `পৃষ্ঠা ${data.meta.page} / ${data.meta.totalPages}`
              : `Page ${data.meta.page} of ${data.meta.totalPages}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-10"
            disabled={page >= data.meta.totalPages || isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            {isBn ? 'পরের' : 'Next'}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </div>
  );
}
