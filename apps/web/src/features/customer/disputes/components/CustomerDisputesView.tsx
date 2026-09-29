'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useGetCustomerDisputesQuery } from '@/features/disputes/disputesApi';
import { getDisputeReasonLabel, getDisputeStatusMeta } from '@/features/disputes/dispute-display';
import { AlertCircle, ChevronRight, Search, ShieldAlert, X } from 'lucide-react';
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
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatCurrency, formatDate, formatReference } from '@/lib/format';

export interface CustomerDisputesViewProps {
  lang?: string;
}

export function CustomerDisputesView({ lang = 'en' }: CustomerDisputesViewProps) {
  const isBn = lang === 'bn';

  const { data: disputes = [], isLoading, isError, refetch } = useGetCustomerDisputesQuery();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredDisputes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return disputes.filter((dispute) => {
      const orderId = (dispute.orderId || '').toLowerCase();
      const reason = getDisputeReasonLabel(dispute.reason, isBn).toLowerCase();
      const matchesSearch = !query || orderId.includes(query) || reason.includes(query);
      const matchesStatus = statusFilter === 'ALL' || dispute.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [disputes, search, statusFilter, isBn]);

  const hasFilters = search.trim().length > 0 || statusFilter !== 'ALL';

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <PageHeader
          title={isBn ? 'আমার অভিযোগসমূহ' : 'My Disputes'}
          description={
            isBn
              ? 'আপনার অর্ডার সংক্রান্ত অভিযোগ ও তার অবস্থা দেখুন।'
              : 'Track and manage claims raised against your orders.'
          }
        />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full space-y-6">
        <PageHeader
          title={isBn ? 'আমার অভিযোগসমূহ' : 'My Disputes'}
          description={
            isBn
              ? 'আপনার অর্ডার সংক্রান্ত অভিযোগ ও তার অবস্থা দেখুন।'
              : 'Track and manage claims raised against your orders.'
          }
        />
        <ErrorState
          isBn={isBn}
          title={isBn ? 'অভিযোগ লোড করা যায়নি' : 'Failed to load disputes'}
          message={
            isBn
              ? 'সার্ভার থেকে অভিযোগের তালিকা সংগ্রহ করা যায়নি। একটু পরে আবার চেষ্টা করুন।'
              : 'We could not retrieve your disputes from the server. Please try again.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={isBn ? 'আমার অভিযোগসমূহ' : 'My Disputes'}
        description={
          isBn
            ? 'আপনার অর্ডার সংক্রান্ত অভিযোগ ও তার অবস্থা দেখুন।'
            : 'Track and manage claims raised against your orders.'
        }
        badge={
          disputes.length > 0 ? (
            <StatusBadge
              tone="neutral"
              label={`${disputes.length} ${isBn ? 'টি অভিযোগ' : 'total'}`}
            />
          ) : undefined
        }
      />

      {disputes.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isBn ? 'অর্ডার নম্বর বা কারণ দিয়ে খুঁজুন' : 'Search by order ID or reason'
              }
              aria-label={isBn ? 'অভিযোগ খুঁজুন' : 'Search disputes'}
              className="h-11 ps-9 pe-9 rounded-xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label={isBn ? 'সার্চ মুছুন' : 'Clear search'}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="h-11 w-full rounded-xl sm:w-48"
              aria-label={isBn ? 'স্ট্যাটাস ফিল্টার' : 'Filter by status'}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All statuses'}</SelectItem>
              <SelectItem value="OPEN">{isBn ? 'উন্মুক্ত' : 'Open'}</SelectItem>
              <SelectItem value="UNDER_REVIEW">
                {isBn ? 'পর্যালোচনাধীন' : 'Under Review'}
              </SelectItem>
              <SelectItem value="RESOLVED_REFUNDED">
                {isBn ? 'সমাধান · রিফান্ড' : 'Resolved · Refunded'}
              </SelectItem>
              <SelectItem value="RESOLVED_REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {filteredDisputes.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={<Search className="w-8 h-8 text-muted-foreground" />}
            title={isBn ? 'কোনো ফলাফল নেই' : 'No matching disputes'}
            description={
              isBn
                ? 'আপনার ফিল্টার বা সার্চের সাথে মেলে এমন কোনো অভিযোগ পাওয়া যায়নি।'
                : 'No dispute matches your current search or filter.'
            }
            action={{
              label: isBn ? 'ফিল্টার মুছুন' : 'Clear filters',
              onClick: () => {
                setSearch('');
                setStatusFilter('ALL');
              },
            }}
          />
        ) : (
          <EmptyState
            icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />}
            title={isBn ? 'কোনো অভিযোগ নেই' : 'No disputes yet'}
            description={
              isBn
                ? 'কোনো পণ্য ক্ষতিগ্রস্ত বা ভুল এলে ডেলিভারি হওয়ার ৭ দিনের মধ্যে অভিযোগ করতে পারবেন।'
                : 'If an order arrives damaged or incorrect, you can raise a claim within 7 days of delivery.'
            }
            action={{
              label: isBn ? 'আমার অর্ডার দেখুন' : 'View my orders',
              href: `/${lang}/customer/orders`,
            }}
          />
        )
      ) : (
        <ul className="space-y-3">
          {filteredDisputes.map((dispute) => {
            const meta = getDisputeStatusMeta(dispute.status);
            const orderRef = formatReference(dispute.orderId);
            return (
              <li key={dispute.id}>
                <Card className="rounded-2xl border-border/70 transition-colors hover:border-primary/40">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            {getDisputeReasonLabel(dispute.reason, isBn)}
                          </h3>
                          <StatusBadge tone={meta.tone} label={isBn ? meta.bn : meta.en} />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {isBn ? 'অর্ডার' : 'Order'}{' '}
                          <span className="font-mono font-medium text-foreground">{orderRef}</span>
                          <span aria-hidden className="mx-1.5">
                            •
                          </span>
                          {formatDate(dispute.createdAt, lang)}
                          {typeof dispute.order?.total === 'number' && (
                            <>
                              <span aria-hidden className="mx-1.5">
                                •
                              </span>
                              {formatCurrency(dispute.order.total)}
                            </>
                          )}
                        </p>
                        {dispute.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {dispute.description}
                          </p>
                        )}
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="mt-2 -ms-2 h-8 gap-1 text-xs text-primary hover:bg-primary/10"
                        >
                          <Link href={`/${lang}/customer/disputes/${dispute.id}`}>
                            {isBn ? 'বিস্তারিত দেখুন' : 'View details'}
                            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
