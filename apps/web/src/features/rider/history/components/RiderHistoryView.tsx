'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Search,
  Truck,
  User,
  Phone,
  Banknote,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { AdminPagination } from '@/components/ui/AdminPagination';
import { useGetRiderHistoryQuery, RiderHistoryParams } from '@/features/riders/ridersApi';
import { DeliveryStatus } from '@/features/deliveries/deliveriesApi';
import { formatCurrency, formatDateTime } from '@/lib/format';

export interface RiderHistoryViewProps {
  lang?: string;
}

const getDeliveryStatusMeta = (status: DeliveryStatus | string, isBn: boolean) => {
  switch (status) {
    case DeliveryStatus.DELIVERED:
      return {
        label: isBn ? 'ডেলিভারি সম্পন্ন' : 'Delivered',
        className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      };
    case DeliveryStatus.OUT_FOR_DELIVERY:
      return {
        label: isBn ? 'ডেলিভারির পথে' : 'Out for delivery',
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      };
    case DeliveryStatus.PICKED_UP:
      return {
        label: isBn ? 'পিকআপ সম্পন্ন' : 'Picked up',
        className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20',
      };
    case DeliveryStatus.ACCEPTED:
      return {
        label: isBn ? 'গৃহীত' : 'Accepted',
        className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
      };
    case DeliveryStatus.ASSIGNED:
      return {
        label: isBn ? 'অর্পিত' : 'Assigned',
        className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      };
    case DeliveryStatus.FAILED:
      return {
        label: isBn ? 'ব্যর্থ' : 'Failed',
        className: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
      };
    case DeliveryStatus.CANCELLED:
      return {
        label: isBn ? 'বাতিল' : 'Cancelled',
        className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      };
    default:
      return {
        label: isBn ? 'অনির্ধারিত' : 'Unassigned',
        className: 'bg-muted text-muted-foreground border-border',
      };
  }
};

export function RiderHistoryView({ lang = 'en' }: RiderHistoryViewProps) {
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<DeliveryStatus | 'ALL'>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const params: RiderHistoryParams = {
    page,
    limit: pageSize,
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
    <div className="space-y-5 pt-1 w-full">
      <PageHeader
        title={isBn ? 'ডেলিভারি ইতিহাস' : 'Delivery History'}
        description={
          isBn
            ? 'আপনার পূর্বের সব ডেলিভারির রেকর্ড এবং আয়ের হিসাব দেখুন।'
            : 'Browse your past deliveries, timestamps, and earned fees.'
        }
        badge={
          data?.meta?.total !== undefined ? (
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
              {data.meta.total} {isBn ? 'টি ডেলিভারি' : 'deliveries'}
            </span>
          ) : undefined
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
            placeholder={isBn ? 'অর্ডার নম্বর বা গ্রাহকের নাম দিয়ে খুঁজুন' : 'Search by order ID or customer name'}
            className="h-10 ps-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => resetToFirstPage(setStatus)(value as DeliveryStatus | 'ALL')}
        >
          <SelectTrigger className="h-10 sm:w-48">
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
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
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
        <div className="space-y-3 w-full">
          {data.data.map((delivery) => {
            const statusMeta = getDeliveryStatusMeta(delivery.status, isBn);
            const shortOrderId = delivery.order?.id
              ? delivery.order.id.slice(-6).toUpperCase()
              : delivery.id.slice(-6).toUpperCase();
            const customerName = delivery.order?.user
              ? `${delivery.order.user.firstName || ''} ${delivery.order.user.lastName || ''}`.trim() ||
                (isBn ? 'সম্মানিত গ্রাহক' : 'Customer')
              : isBn
                ? 'সম্মানিত গ্রাহক'
                : 'Customer';
            const customerPhone = delivery.order?.user?.phone;
            const deliveryFee = Number(delivery.order?.deliveryFee || 0);
            const deliveryDate = formatDateTime(delivery.deliveryTime || delivery.updatedAt, lang);

            return (
              <Card
                key={delivery.id}
                className="rounded-2xl border border-border/70 hover:border-primary/40 transition-all hover:shadow-xs bg-card"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.className}`}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                        #{shortOrderId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>{deliveryDate}</span>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <p className="font-semibold text-sm text-foreground truncate">
                          {customerName}
                        </p>
                        {customerPhone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground/70" />
                            {customerPhone}
                          </span>
                        )}
                      </div>

                      {delivery.order?.address?.streetAddress && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                          <span className="line-clamp-2 leading-relaxed">
                            {delivery.order.address.streetAddress}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                      <div className="text-start md:text-end">
                        <span className="text-[11px] text-muted-foreground block">
                          {isBn ? 'ডেলিভারি ফি' : 'Delivery Fee'}
                        </span>
                        <div className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          <Banknote className="h-4 w-4" />
                          <span>{formatCurrency(deliveryFee)}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1 text-xs font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                        asChild
                      >
                        <Link href={`/${lang}/rider/deliveries/${delivery.id}`}>
                          <span>{isBn ? 'বিস্তারিত' : 'Details'}</span>
                          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data && data.meta.total > 0 && (
        <div className="pt-2">
          <AdminPagination
            totalItems={data.meta.total}
            itemsPerPage={params.limit}
            currentPage={data.meta.page}
            lang={lang}
            limitOptions={[5, 10, 20, 50]}
            itemLabel={{
              singular: isBn ? 'ডেলিভারি' : 'delivery',
              plural: isBn ? 'ডেলিভারি' : 'deliveries',
            }}
            onPageChange={(newPage) => setPage(newPage)}
            onLimitChange={(newLimit) => {
              setPageSize(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
