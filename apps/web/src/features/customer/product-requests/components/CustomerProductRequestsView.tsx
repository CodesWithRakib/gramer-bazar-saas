'use client';

import React from 'react';
import Link from 'next/link';
import { useGetCustomerProductRequestsQuery } from '@/features/product-requests/productRequestsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { FileQuestion, ChevronRight, Search } from 'lucide-react';

export interface CustomerProductRequestsViewProps {
  lang?: string;
}

export function CustomerProductRequestsView({ lang = 'en' }: CustomerProductRequestsViewProps) {
  const isBn = lang === 'bn';
  const { data: requests, isLoading, isError, refetch } = useGetCustomerProductRequestsQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium text-xs">
            {isBn ? 'অপেক্ষমাণ' : 'Pending'}
          </Badge>
        );
      case 'REVIEWING':
      case 'SEARCHING':
        return (
          <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium text-xs">
            {isBn ? 'খোঁজা হচ্ছে' : 'Searching'}
          </Badge>
        );
      case 'FOUND':
      case 'PRODUCT_ADDED':
      case 'CUSTOMER_NOTIFIED':
        return (
          <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
            {isBn ? 'পণ্য যুক্ত হয়েছে' : 'Product Added'}
          </Badge>
        );
      case 'CLOSED':
      case 'REJECTED':
        return (
          <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive font-medium text-xs">
            {isBn ? 'বাতিল' : 'Rejected'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <PageHeader
          title={isBn ? 'আমার পণ্যের অনুরোধ' : 'My Product Requests'}
          description={
            isBn
              ? 'আপনার অনুরোধকৃত গ্রামীণ ও বিশেষ পণ্যের বর্তমান অবস্থা ট্র্যাক করুন।'
              : 'Track sourcing status for your requested authentic items.'
          }
        />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl border border-border/70 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-72" />
              <div className="flex justify-between items-center pt-2">
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
        <PageHeader
          title={isBn ? 'আমার পণ্যের অনুরোধ' : 'My Product Requests'}
          description={
            isBn
              ? 'আপনার অনুরোধকৃত গ্রামীণ ও বিশেষ পণ্যের বর্তমান অবস্থা ট্র্যাক করুন।'
              : 'Track sourcing status for your requested authentic items.'
          }
        />
        <ErrorState
          isBn={isBn}
          title={isBn ? 'তথ্য লোড করতে ত্রুটি হয়েছে' : 'Error loading requests'}
          message={
            isBn
              ? 'সার্ভার থেকে অনুরোধের তালিকা লোড করা সম্ভব হয়নি।'
              : 'Failed to retrieve your product requests from the server.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={isBn ? 'আমার পণ্যের অনুরোধ' : 'My Product Requests'}
        description={
          isBn
            ? 'আপনার অনুরোধকৃত গ্রামীণ ও বিশেষ পণ্যের বর্তমান অবস্থা ট্র্যাক করুন।'
            : 'Track sourcing status for your requested authentic items.'
        }
        badge={
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
            {requests?.length ?? 0} {isBn ? 'টি অনুরোধ' : 'requests'}
          </span>
        }
        primaryAction={
          <Button asChild className="rounded-xl shadow-xs">
            <Link href={`/${lang}/search`}>
              <Search className="w-4 h-4 mr-2" />
              {isBn ? 'নতুন পণ্য খুঁজুন ও অনুরোধ করুন' : 'Search & Request'}
            </Link>
          </Button>
        }
      />

      {!requests || requests.length === 0 ? (
        <EmptyState
          icon={<FileQuestion className="w-8 h-8 text-primary" />}
          title={isBn ? 'কোনো অনুরোধ পাওয়া যায়নি' : 'No requests found'}
          description={
            isBn
              ? 'আপনি এখনও কোনো পণ্যের সোর্সিং অনুরোধ জানাননি। কোনো বিশেষ পণ্য প্রয়োজন হলে অনুরোধ করতে পারেন।'
              : 'You have not requested any custom or hard-to-find rural products yet.'
          }
          action={{
            label: isBn ? 'পণ্য খুঁজুন ও অনুরোধ করুন' : 'Search and Request Products',
            href: `/${lang}/search`,
          }}
        />
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="rounded-2xl border border-border/70 shadow-xs hover:border-primary/40 transition-all group"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  {req.requestedProductName}
                </CardTitle>
                {getStatusBadge(req.status)}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mt-1">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(req.createdAt))}
                    </p>
                    {req.description && (
                      <p className="text-sm text-foreground/80 line-clamp-2">{req.description}</p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl shrink-0 shadow-xs">
                    <Link href={`/${lang}/product-requests/${req.id}`}>
                      <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
