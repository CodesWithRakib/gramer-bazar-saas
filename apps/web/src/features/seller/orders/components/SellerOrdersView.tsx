'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Inbox, Phone, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPagination } from '@/components/ui/AdminPagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDate, type AppLang } from '@/lib/format';
import { getOrderStatusMeta, getPaymentStatusMeta } from '@/lib/order-status';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { useGetSellerOrdersQuery, type SellerOrderSummary } from '@/features/seller';
import { OrderStatus } from '@/features/orders/ordersApi';
import { SellerOrderActions } from './SellerOrderActions';

export interface SellerOrdersViewProps {
  lang?: string;
}

const STATUS_OPTIONS: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.PICKED_UP,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.FAILED,
];

const LIMIT_OPTIONS = [10, 20, 50];

type QuickFilter = 'ALL' | 'ACTION' | OrderStatus;

export function SellerOrdersView({ lang = 'en' }: SellerOrdersViewProps) {
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('ALL');

  const { input: searchInput, term: search, onInputChange, reset } = useDebouncedSearch();

  const isActionFilter = quickFilter === 'ACTION';
  const statusFilter = !isActionFilter && quickFilter !== 'ALL' ? quickFilter : undefined;

  const { data, isLoading, isError, refetch } = useGetSellerOrdersQuery({
    page,
    limit,
    search: search || undefined,
    status: statusFilter,
    needsAction: isActionFilter ? 'true' : undefined,
  });

  const orders = data?.data ?? [];

  const quickFilters: Array<{ value: QuickFilter; label: string; count?: number }> = [
    { value: 'ALL', label: isBn ? 'সব অর্ডার' : 'All orders' },
    {
      value: 'ACTION',
      label: isBn ? 'কার্যক্রম প্রয়োজন' : 'Needs action',
      count: data?.awaitingActionCount,
    },
    { value: OrderStatus.PENDING, label: isBn ? 'অপেক্ষমাণ' : 'Pending' },
    { value: OrderStatus.PROCESSING, label: isBn ? 'প্রক্রিয়াধীন' : 'Processing' },
    { value: OrderStatus.DELIVERED, label: isBn ? 'ডেলিভারি সম্পন্ন' : 'Delivered' },
    { value: OrderStatus.CANCELLED, label: isBn ? 'বাতিল' : 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'অর্ডার' : 'Orders' },
        ]}
        title={isBn ? 'গ্রাহক অর্ডার' : 'Customer orders'}
        description={
          isBn
            ? 'আপনার দোকানের অর্ডার নিশ্চিত করুন, প্রস্তুত করুন এবং পিকআপের জন্য তৈরি করুন।'
            : 'Confirm, prepare and hand over the orders that contain your shop’s items.'
        }
        badge={
          (data?.awaitingActionCount ?? 0) > 0 ? (
            <StatusBadge
              tone="warning"
              label={
                isBn
                  ? `${data?.awaitingActionCount}টি কার্যক্রম প্রয়োজন`
                  : `${data?.awaitingActionCount} need action`
              }
            />
          ) : undefined
        }
      />

      {/* Quick filters */}
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {quickFilters.map((filter) => {
          const active = quickFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setQuickFilter(filter.value);
                setPage(1);
              }}
              aria-pressed={active}
              className={`focus-visible:ring-ring shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter.label}
              {typeof filter.count === 'number' && filter.count > 0 && (
                <span className="ms-1 tabular-nums">({filter.count})</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(event) => {
              onInputChange(event.target.value);
              setPage(1);
            }}
            placeholder={
              isBn ? 'অর্ডার আইডি, নাম বা ফোন...' : 'Order id, customer name or phone...'
            }
            className="h-11 rounded-full ps-10 pe-10"
            aria-label={isBn ? 'অর্ডার খুঁজুন' : 'Search orders'}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                reset();
                setPage(1);
              }}
              aria-label={isBn ? 'মুছুন' : 'Clear'}
              className="text-muted-foreground hover:bg-muted absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-52">
          <Select
            value={typeof quickFilter === 'string' && quickFilter !== 'ACTION' ? quickFilter : 'ALL'}
            onValueChange={(value) => {
              setQuickFilter(value as QuickFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-full" aria-label={isBn ? 'অবস্থা' : 'Status'}>
              <SelectValue placeholder={isBn ? 'সব অবস্থা' : 'All statuses'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{isBn ? 'সব অবস্থা' : 'All statuses'}</SelectItem>
              {STATUS_OPTIONS.map((status) => {
                const meta = getOrderStatusMeta(status);
                return (
                  <SelectItem key={status} value={status}>
                    {isBn ? meta.bn : meta.en}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <ErrorState
          isBn={isBn}
          title={isBn ? 'অর্ডার লোড করা যায়নি' : 'Could not load orders'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-8 w-8" />}
          title={
            quickFilter === 'ACTION'
              ? isBn
                ? 'কোনো অর্ডারে কার্যক্রম প্রয়োজন নেই'
                : 'Nothing needs your attention'
              : isBn
                ? 'কোনো অর্ডার নেই'
                : 'No orders yet'
          }
          description={
            quickFilter === 'ACTION'
              ? isBn
                ? 'সব অর্ডার প্রক্রিয়া করা হয়েছে। নতুন অর্ডার এলে এখানে দেখা যাবে।'
                : 'All orders are up to date. New ones will show up here.'
              : isBn
                ? 'গ্রাহক অর্ডার করলে এখানে তাৎক্ষণিকভাবে দেখা যাবে।'
                : 'Orders placed by customers will appear here instantly.'
          }
          action={{
            label: isBn ? 'পণ্য দেখুন' : 'Browse products',
            href: `/${lang}/seller/products`,
          }}
        />
      ) : (
        <>
          {/* Desktop */}
          <Card className="hidden overflow-hidden shadow-none lg:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ps-4">{isBn ? 'অর্ডার' : 'Order'}</TableHead>
                  <TableHead>{isBn ? 'গ্রাহক' : 'Customer'}</TableHead>
                  <TableHead>{isBn ? 'আইটেম' : 'Items'}</TableHead>
                  <TableHead>{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                  <TableHead>{isBn ? 'পেমেন্ট' : 'Payment'}</TableHead>
                  <TableHead>{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                  <TableHead className="text-end pe-4">{isBn ? 'কার্যক্রম' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} lang={lang} isBn={isBn} onChanged={refetch} />
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile / tablet */}
          <ul className="space-y-3 lg:hidden">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} lang={lang} isBn={isBn} onChanged={refetch} />
            ))}
          </ul>

          <AdminPagination
            totalItems={data?.meta.total ?? 0}
            itemsPerPage={limit}
            currentPage={page}
            limitOptions={LIMIT_OPTIONS}
            lang={isBn ? 'bn' : 'en'}
            itemLabel={{
              singular: isBn ? 'অর্ডার' : 'order',
              plural: isBn ? 'অর্ডার' : 'orders',
            }}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}

function OrderRow({
  order,
  lang,
  isBn,
  onChanged,
}: {
  order: SellerOrderSummary;
  lang: string;
  isBn: boolean;
  onChanged: () => void;
}) {
  const statusMeta = getOrderStatusMeta(order.status);
  const paymentMeta = getPaymentStatusMeta(order.paymentStatus);

  return (
    <TableRow>
      <TableCell className="ps-4">
        <Link
          href={`/${lang}/seller/orders/${order.id}`}
          className="font-mono text-sm font-semibold hover:underline"
        >
          {order.reference}
        </Link>
        <p className="text-muted-foreground text-xs">
          {formatDate(order.createdAt, lang, 'short')}
        </p>
      </TableCell>
      <TableCell>
        <p className="text-foreground max-w-[180px] truncate font-medium">{order.customer.name}</p>
        {order.customer.phone && (
          <p className="text-muted-foreground text-xs">{order.customer.phone}</p>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">{order.itemCount}</TableCell>
      <TableCell className="font-semibold tabular-nums">
        {formatCurrency(order.sellerSubtotal, isBn ? 'bn' : 'en')}
      </TableCell>
      <TableCell>
        <StatusBadge tone={paymentMeta.tone} label={isBn ? paymentMeta.bn : paymentMeta.en} />
      </TableCell>
      <TableCell>
        <StatusBadge tone={statusMeta.tone} label={isBn ? statusMeta.bn : statusMeta.en} />
      </TableCell>
      <TableCell className="pe-4">
        <div className="flex items-center justify-end gap-2">
          {order.allowedNextStatuses.length > 0 && (
            <SellerOrderActions
              orderId={order.id}
              allowedNextStatuses={order.allowedNextStatuses}
              isBn={isBn}
              size="sm"
              onTransitioned={onChanged}
            />
          )}
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/${lang}/seller/orders/${order.id}`}>
              {isBn ? 'বিস্তারিত' : 'Details'}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function OrderCard({
  order,
  lang,
  isBn,
  onChanged,
}: {
  order: SellerOrderSummary;
  lang: string;
  isBn: boolean;
  onChanged: () => void;
}) {
  const statusMeta = getOrderStatusMeta(order.status);
  const paymentMeta = getPaymentStatusMeta(order.paymentStatus);

  return (
    <li>
      <Card className="shadow-none">
        <CardContent className="space-y-3 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/${lang}/seller/orders/${order.id}`}
                className="font-mono text-sm font-semibold hover:underline"
              >
                {order.reference}
              </Link>
              <p className="text-muted-foreground text-xs">
                {formatDate(order.createdAt, lang, 'short')} · {order.itemCount}{' '}
                {isBn ? 'আইটেম' : `item${order.itemCount === 1 ? '' : 's'}`}
              </p>
            </div>
            <StatusBadge tone={statusMeta.tone} label={isBn ? statusMeta.bn : statusMeta.en} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-medium">{order.customer.name}</p>
              {order.customer.phone && (
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Phone className="h-3 w-3" />
                  {order.customer.phone}
                </p>
              )}
            </div>
            <span className="text-foreground shrink-0 font-bold tabular-nums">
              {formatCurrency(order.sellerSubtotal, isBn ? 'bn' : 'en')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge tone={paymentMeta.tone} label={isBn ? paymentMeta.bn : paymentMeta.en} />
            {order.customer.district && (
              <StatusBadge tone="neutral" label={order.customer.district} />
            )}
          </div>

          <div className="space-y-2 border-t pt-3">
            {order.allowedNextStatuses.length > 0 ? (
              <SellerOrderActions
                orderId={order.id}
                allowedNextStatuses={order.allowedNextStatuses}
                isBn={isBn}
                size="sm"
                fullWidth
                onTransitioned={onChanged}
              />
            ) : null}
            <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
              <Link href={`/${lang}/seller/orders/${order.id}`}>
                <ClipboardList className="h-3.5 w-3.5" />
                {isBn ? 'পূর্ণ বিবরণ' : 'Full details'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
