'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Banknote, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { useGetRiderEarningsQuery } from '@/features/riders/ridersApi';

export interface RiderEarningsViewProps {
  lang?: string;
}

const PAGE_SIZE = 10;
const currency = (value: number) => `\u09F3${Number(value || 0).toFixed(2)}`;

export function RiderEarningsView({ lang = 'en' }: RiderEarningsViewProps) {
  const isBn = lang === 'bn';
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetRiderEarningsQuery({
    page,
    limit: PAGE_SIZE,
  });

  if (isLoading) {
    return (
      <div className="space-y-5 pt-2">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-5 pt-2">
        <PageHeader title={isBn ? 'আয়' : 'Earnings'} />
        <ErrorState isBn={isBn} onRetry={refetch} />
      </div>
    );
  }

  const { summary } = data;

  const cards = [
    { label: isBn ? 'আজ' : 'Today', value: summary.todayEarnings },
    { label: isBn ? 'এই সপ্তাহ' : 'This Week', value: summary.weekEarnings },
    { label: isBn ? 'এই মাস' : 'This Month', value: summary.monthEarnings },
    { label: isBn ? 'সর্বমোট' : 'Lifetime', value: summary.totalEarned },
    {
      label: isBn ? 'উত্তোলনযোগ্য' : 'Withdrawable',
      value: summary.availableBalance,
      primary: true,
    },
    { label: isBn ? 'পরিশোধিত' : 'Paid Out', value: summary.paidOut },
  ];

  return (
    <div className="space-y-5 pt-2">
      <PageHeader
        title={isBn ? 'আয়' : 'Earnings'}
        description={
          isBn
            ? 'প্রতিটি সম্পন্ন ডেলিভারির আয় ও ব্যালেন্স দেখুন।'
            : 'Review your delivery earnings and available balance.'
        }
        badge={
          <Badge variant="secondary" className="text-[11px]">
            {summary.totalDeliveries} {isBn ? 'ডেলিভারি' : 'deliveries'}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.label}
            className={`rounded-2xl shadow-none ${card.primary ? 'border-primary/40' : 'border-border'}`}
          >
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {card.label}
              </p>
              <p
                className={`mt-1 text-xl font-bold ${card.primary ? 'text-primary' : 'text-foreground'}`}
              >
                {currency(card.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {isBn ? 'পেন্ডিং পে-আউট' : 'Pending payout'}
          </span>
          <span className="font-semibold text-foreground">{currency(summary.pendingPayout)}</span>
        </div>
        <Button asChild size="sm" className="ms-auto h-9">
          <Link href={`/${lang}/rider/payouts`}>{isBn ? 'পে-আউট অনুরোধ' : 'Request payout'}</Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="h-4 w-4 text-primary" />
            {isBn ? 'আয়ের লেজার' : 'Earnings Ledger'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.data.length === 0 ? (
            <EmptyState
              className="min-h-[200px] rounded-none border-0 bg-transparent"
              icon={<Banknote className="h-7 w-7 text-primary" />}
              title={isBn ? 'এখনো কোনো আয় নেই' : 'No earnings yet'}
              description={
                isBn
                  ? 'ডেলিভারি সম্পন্ন করলে এখানে আয় যোগ হবে।'
                  : 'Complete deliveries to start earning. Your ledger will appear here.'
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {data.data.map((earning) => (
                <li
                  key={earning.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      #{earning.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(earning.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge
                      variant={earning.status === 'PAID' ? 'secondary' : 'outline'}
                      className="text-[10px] uppercase"
                    >
                      {earning.status === 'PAID'
                        ? isBn
                          ? 'পরিশোধিত'
                          : 'Paid'
                        : isBn
                          ? 'অর্জিত'
                          : 'Earned'}
                    </Badge>
                    <span className="font-semibold text-foreground">
                      {currency(earning.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
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
