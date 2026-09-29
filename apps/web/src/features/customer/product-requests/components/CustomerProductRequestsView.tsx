'use client';

import React from 'react';
import Link from 'next/link';
import { useGetCustomerProductRequestsQuery } from '@/features/product-requests/productRequestsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getProductRequestStatusMeta } from '@/features/product-requests/request-display';
import { formatDateTime } from '@/lib/format';
import { FileQuestion, ChevronRight, Search } from 'lucide-react';

export interface CustomerProductRequestsViewProps {
  lang?: string;
}

export function CustomerProductRequestsView({ lang = 'en' }: CustomerProductRequestsViewProps) {
  const isBn = lang === 'bn';
  const { data: requests, isLoading, isError, refetch } = useGetCustomerProductRequestsQuery();

  const header = (
    <PageHeader
      title={isBn ? 'আমার পণ্যের অনুরোধ' : 'My Product Requests'}
      description={
        isBn
          ? 'আপনার অনুরোধ করা গ্রামীণ ও বিশেষ পণ্যের সোর্সিং অবস্থা দেখুন।'
          : 'Track the sourcing status of the rural and special items you asked for.'
      }
      badge={
        requests && requests.length > 0 ? (
          <StatusBadge
            tone="neutral"
            label={`${requests.length} ${isBn ? 'টি অনুরোধ' : 'requests'}`}
          />
        ) : undefined
      }
      primaryAction={
        <Button asChild className="rounded-xl">
          <Link href={`/${lang}/search`}>
            <Search className="me-2 h-4 w-4" />
            {isBn ? 'নতুন পণ্য খুঁজুন' : 'Find a product'}
          </Link>
        </Button>
      }
    />
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {header}
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="space-y-3 rounded-2xl border border-border/70 p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full space-y-6">
        {header}
        <ErrorState
          isBn={isBn}
          title={isBn ? 'অনুরোধ লোড করা যায়নি' : 'Failed to load your requests'}
          message={
            isBn
              ? 'সার্ভার থেকে অনুরোধের তালিকা সংগ্রহ করা যায়নি। একটু পরে আবার চেষ্টা করুন।'
              : 'We could not retrieve your product requests from the server. Please try again.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {header}

      {!requests || requests.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="w-8 h-8 text-primary" />}
          title={isBn ? 'কোনো অনুরোধ পাওয়া যায়নি' : 'No requests yet'}
          description={
            isBn
              ? 'আপনি এখনো কোনো পণ্যের সোর্সিং অনুরোধ করেননি। গ্রামের দুর্লভ পণ্য প্রয়োজন হলে অনুরোধ করুন।'
              : 'You have not requested any hard-to-find rural products yet. Ask us and we will source it.'
          }
          action={{
            label: isBn ? 'পণ্য খুঁজুন ও অনুরোধ করুন' : 'Search and request',
            href: `/${lang}/search`,
          }}
        />
      ) : (
        <ul className="grid gap-4">
          {requests.map((req) => {
            const meta = getProductRequestStatusMeta(req.status);
            return (
              <li key={req.id}>
                <Card className="group rounded-2xl border border-border/70 transition-colors hover:border-primary/40">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-bold text-foreground sm:text-lg">
                      {req.requestedProductName}
                    </CardTitle>
                    <StatusBadge tone={meta.tone} label={isBn ? meta.bn : meta.en} />
                  </CardHeader>
                  <CardContent>
                    <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(req.createdAt, lang)}
                        </p>
                        {req.description && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {req.description}
                          </p>
                        )}
                      </div>
                      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-xl">
                        <Link href={`/${lang}/customer/product-requests/${req.id}`}>
                          <span>{isBn ? 'বিস্তারিত দেখুন' : 'View details'}</span>
                          <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
                        </Link>
                      </Button>
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
