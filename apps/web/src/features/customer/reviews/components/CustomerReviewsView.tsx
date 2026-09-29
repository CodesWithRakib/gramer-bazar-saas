'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { useGetUserReviewsQuery } from '@/features/reviews/reviewsApi';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, MessageSquareQuote, Star } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/format';

export interface CustomerReviewsViewProps {
  lang?: string;
}

export function CustomerReviewsView({ lang = 'en' }: CustomerReviewsViewProps) {
  const isBn = lang === 'bn';
  const router = useRouter();

  const { user, isAuthenticated, isAuthInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    data: reviews,
    isLoading,
    isError,
    refetch,
  } = useGetUserReviewsQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthInitialized) return;
    if (!isAuthenticated) {
      router.push(`/${lang}/login?redirect=/${lang}/customer/reviews`);
    }
  }, [isAuthInitialized, isAuthenticated, router, lang]);

  if (!isAuthenticated || !user) return null;

  const header = (
    <PageHeader
      title={isBn ? 'আমার রিভিউসমূহ' : 'My Reviews'}
      description={
        isBn
          ? 'আপনার কেনা পণ্যের উপর দেওয়া রেটিং ও মতামত দেখুন।'
          : 'Ratings and feedback you have shared on products you purchased.'
      }
      badge={
        reviews && reviews.length > 0 ? (
          <StatusBadge tone="neutral" label={`${reviews.length} ${isBn ? 'টি রিভিউ' : 'total'}`} />
        ) : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {header}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
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
          title={isBn ? 'রিভিউ লোড করা যায়নি' : 'Failed to load your reviews'}
          message={
            isBn
              ? 'সার্ভার থেকে আপনার রিভিউ সংগ্রহ করা যায়নি। একটু পরে আবার চেষ্টা করুন।'
              : 'We could not retrieve your reviews from the server. Please try again.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {header}

      {!reviews || reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote className="w-8 h-8 text-primary" />}
          title={isBn ? 'কোনো রিভিউ পাওয়া যায়নি' : 'No reviews yet'}
          description={
            isBn
              ? 'ডেলিভারি সম্পন্ন হওয়া অর্ডারের পণ্যে রেটিং ও মতামত দিলে সেটি এখানে দেখা যাবে।'
              : 'Once you rate a delivered product, your feedback will appear here.'
          }
          action={{
            label: isBn ? 'আমার অর্ডার দেখুন' : 'View my orders',
            href: `/${lang}/customer/orders`,
          }}
        />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id}>
              <Card className="overflow-hidden rounded-2xl border-border/70">
                <CardContent className="flex flex-col p-0 md:flex-row">
                  {/* Product */}
                  <div className="border-b border-border/60 p-4 md:w-1/3 md:border-b-0 md:border-e md:p-6">
                    {review.product ? (
                      <Link
                        href={`/${lang}/products/${review.product.slug}`}
                        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                      >
                        <h4 className="font-semibold leading-snug transition-colors group-hover:text-primary">
                          {isBn ? review.product.nameBn : review.product.nameEn}
                        </h4>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          {isBn ? 'পণ্য দেখুন' : 'View product'}
                          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                        </p>
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {isBn ? 'পণ্য পাওয়া যায়নি' : 'Product unavailable'}
                      </span>
                    )}
                  </div>

                  {/* Review body */}
                  <div className="flex flex-1 flex-col justify-between p-4 md:w-2/3 md:p-6">
                    <div>
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex gap-0.5" aria-hidden>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/40'
                              }`}
                            />
                          ))}
                        </div>
                        <StatusBadge
                          tone={review.isApproved ? 'success' : 'warning'}
                          label={
                            isBn
                              ? review.isApproved
                                ? 'প্রকাশিত'
                                : 'পর্যালোচনাধীন'
                              : review.isApproved
                                ? 'Published'
                                : 'Pending'
                          }
                        />
                        <span className="sr-only">
                          {isBn ? `${review.rating} / ৫ স্টার` : `${review.rating} out of 5 stars`}
                        </span>
                      </div>

                      {review.comment ? (
                        <p className="text-sm italic text-foreground">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">
                          {isBn ? 'কোনো মন্তব্য দেওয়া হয়নি' : 'No comment provided'}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                      {isBn ? 'রিভিউ দেওয়া হয়েছে' : 'Reviewed on'}{' '}
                      {formatDate(review.createdAt, lang)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
