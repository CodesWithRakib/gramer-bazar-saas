'use client';

import React from 'react';
import Link from 'next/link';
import { useGetCustomerProductRequestByIdQuery } from '@/features/product-requests/productRequestsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2, PackageSearch, Info } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getProductRequestStatusMeta } from '@/features/product-requests/request-display';
import { formatDateTime, formatReference } from '@/lib/format';

export interface CustomerProductRequestDetailsViewProps {
  lang?: string;
  id: string;
}

export function CustomerProductRequestDetailsView({
  lang = 'en',
  id,
}: CustomerProductRequestDetailsViewProps) {
  const isBn = lang === 'bn';
  const { data: request, isLoading, isError, refetch } = useGetCustomerProductRequestByIdQuery(id);

  const header = (
    <PageHeader
      breadcrumbs={[
        { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/customer` },
        {
          label: isBn ? 'পণ্য অনুরোধ' : 'Product requests',
          href: `/${lang}/customer/product-requests`,
        },
      ]}
      title={isBn ? 'পণ্য অনুরোধ' : 'Product request'}
      primaryAction={
        <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5">
          <Link href={`/${lang}/customer/product-requests`}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {isBn ? 'অনুরোধ তালিকা' : 'All requests'}
          </Link>
        </Button>
      }
    />
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {header}
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl md:col-span-2" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="w-full space-y-6">
        {header}
        {isError ? (
          <ErrorState
            isBn={isBn}
            title={isBn ? 'অনুরোধ লোড করা যায়নি' : 'Failed to load this request'}
            message={
              isBn
                ? 'সার্ভার থেকে অনুরোধটি সংগ্রহ করা যায়নি। আবার চেষ্টা করুন।'
                : 'We could not retrieve this request from the server. Please try again.'
            }
            onRetry={() => refetch()}
          />
        ) : (
          <EmptyState
            icon={<PackageSearch className="h-8 w-8 text-muted-foreground" />}
            title={isBn ? 'অনুরোধ পাওয়া যায়নি' : 'Request not found'}
            description={
              isBn
                ? 'এই অনুরোধটি পাওয়া যায়নি অথবা মুছে ফেলা হয়েছে।'
                : 'This request could not be found, or it has been removed.'
            }
            action={{
              label: isBn ? 'সব অনুরোধ' : 'All requests',
              href: `/${lang}/customer/product-requests`,
            }}
          />
        )}
      </div>
    );
  }

  const meta = getProductRequestStatusMeta(request.status);
  const history = request.statusHistory ?? [];

  return (
    <div className="w-full space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/customer` },
          {
            label: isBn ? 'পণ্য অনুরোধ' : 'Product requests',
            href: `/${lang}/customer/product-requests`,
          },
          { label: formatReference(request.id) },
        ]}
        title={request.requestedProductName}
        description={`${isBn ? 'তৈরি হয়েছে' : 'Created'} ${formatDateTime(request.createdAt, lang)}`}
        badge={<StatusBadge tone={meta.tone} label={isBn ? meta.bn : meta.en} />}
        primaryAction={
          <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5">
            <Link href={`/${lang}/customer/product-requests`}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {isBn ? 'অনুরোধ তালিকা' : 'Back'}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Timeline */}
        <section className="md:col-span-2">
          <Card className="rounded-2xl border-border/70">
            <CardHeader className="border-b bg-muted/20 py-3">
              <CardTitle className="text-base">
                {isBn ? 'অনুরোধের অগ্রগতি' : 'Request progress'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {isBn ? 'এখনো কোনো অগ্রগতির খবর নেই।' : 'No updates have been recorded yet.'}
                </p>
              ) : (
                <ol className="space-y-4">
                  {history.map((entry, index) => {
                    const entryMeta = getProductRequestStatusMeta(entry.status);
                    const isLast = index === history.length - 1;
                    return (
                      <li key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              index === 0
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {index === 0 ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-current" />
                            )}
                          </div>
                          {!isLast && <div className="my-1 h-full w-0.5 bg-border" />}
                        </div>
                        <div className={`min-w-0 ${isLast ? 'pb-0' : 'pb-4'}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{isBn ? entryMeta.bn : entryMeta.en}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(entry.createdAt, lang)}
                          </p>
                          {entry.remark && (
                            <p className="mt-1 text-sm text-muted-foreground">{entry.remark}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Details */}
        <aside className="space-y-6">
          <Card className="rounded-2xl border-border/70">
            <CardHeader className="border-b bg-muted/20 py-3">
              <CardTitle className="text-base">{isBn ? 'বিস্তারিত তথ্য' : 'Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 text-sm sm:p-5">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{isBn ? 'বিবরণ' : 'Description'}</p>
                <p className="whitespace-pre-wrap font-medium">
                  {request.description || (isBn ? 'কোনো বিবরণ নেই' : 'No description provided')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {isBn ? 'পছন্দের তথ্য' : 'Preferred details'}
                </p>
                <p className="whitespace-pre-wrap font-medium">
                  {request.preferredInformation ||
                    (isBn ? 'তথ্য দেওয়া হয়নি' : 'Nothing specified')}
                </p>
              </div>

              {request.adminNotes && (
                <div className="rounded-xl border border-info/25 bg-info/5 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold">
                    <Info className="h-3.5 w-3.5 text-info" />
                    {isBn ? 'আমাদের টিমের বার্তা' : 'Note from our team'}
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{request.adminNotes}</p>
                </div>
              )}
            </CardContent>
            {request.linkedProductId && (
              <CardFooter className="border-t border-border/60 p-4">
                <Button asChild className="w-full gap-2 rounded-xl">
                  <Link href={`/${lang}/products/${request.linkedProductId}`}>
                    <PackageSearch className="h-4 w-4" />
                    {isBn ? 'যোগ করা পণ্যটি দেখুন' : 'View the added product'}
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
