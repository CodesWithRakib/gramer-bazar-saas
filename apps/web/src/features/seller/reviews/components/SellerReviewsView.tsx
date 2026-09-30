'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ImageOff, MessageSquareReply, Search, Star, StarOff, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { CustomImage } from '@/components/ui/CustomImage';
import { AdminPagination } from '@/components/ui/AdminPagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDate } from '@/lib/format';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import {
  useGetSellerReviewSummaryQuery,
  useGetSellerReviewsQuery,
  useReplyToSellerReviewMutation,
  type SellerReviewItem,
} from '@/features/seller';

export interface SellerReviewsViewProps {
  lang?: string;
}

const LIMIT_OPTIONS = [10, 20, 50];

export function SellerReviewsView({ lang = 'en' }: SellerReviewsViewProps) {
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [rating, setRating] = useState<string>('ALL');
  const [replyState, setReplyState] = useState<'ALL' | 'REPLIED' | 'UNREPLIED'>('ALL');
  const [replyingTo, setReplyingTo] = useState<SellerReviewItem | null>(null);
  const [replyText, setReplyText] = useState('');

  const { input: searchInput, term: search, onInputChange, reset } = useDebouncedSearch();

  const { data: summary, isLoading: isSummaryLoading } = useGetSellerReviewSummaryQuery();
  const { data, isLoading, isError, refetch } = useGetSellerReviewsQuery({
    page,
    limit,
    search: search || undefined,
    rating: rating === 'ALL' ? undefined : Number(rating),
    replyState,
  });

  const [replyToReview, { isLoading: isReplying }] = useReplyToSellerReviewMutation();

  const reviews = data?.data ?? [];
  const totalReviews = summary?.totalReviews ?? 0;
  const maxBucket = Math.max(1, ...(summary?.distribution ?? []).map((bucket) => bucket.count));

  const handleSubmitReply = async () => {
    if (!replyingTo) return;
    const message = replyText.trim();
    if (message.length < 2) {
      toast.error(isBn ? 'উত্তর লিখুন' : 'Please write a reply');
      return;
    }

    try {
      await replyToReview({ id: replyingTo.id, message }).unwrap();
      toast.success(isBn ? 'উত্তর প্রকাশিত হয়েছে' : 'Reply published');
      setReplyingTo(null);
      setReplyText('');
      void refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, isBn ? 'উত্তর সংরক্ষণ ব্যর্থ' : 'Could not save reply'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'রিভিউ' : 'Reviews' },
        ]}
        title={isBn ? 'গ্রাহক রিভিউ' : 'Customer reviews'}
        description={
          isBn
            ? 'আপনার পণ্যের উপর গ্রাহকদের মতামত দেখুন এবং প্রকাশ্যে উত্তর দিন।'
            : 'See what customers say about your products and answer them publicly.'
        }
        badge={
          (summary?.unrepliedCount ?? 0) > 0 ? (
            <StatusBadge
              tone="warning"
              label={
                isBn
                  ? `${summary?.unrepliedCount}টি উত্তর প্রয়োজন`
                  : `${summary?.unrepliedCount} awaiting reply`
              }
            />
          ) : undefined
        }
      />

      {isSummaryLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="shadow-none">
            <CardContent className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
              <p className="text-foreground text-4xl font-bold tabular-nums">
                {summary?.averageRating ?? 0}
              </p>
              <StarRow rating={summary?.averageRating ?? 0} />
              <p className="text-muted-foreground text-xs">
                {isBn
                  ? `${totalReviews}টি রিভিউ`
                  : `${totalReviews} review${totalReviews === 1 ? '' : 's'}`}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none lg:col-span-2">
            <CardContent className="space-y-2 p-4">
              {totalReviews === 0 ? (
                <p className="text-muted-foreground py-5 text-center text-xs">
                  {isBn
                    ? 'এখনও কোনো রিভিউ নেই। প্রথম বিক্রয়ের পর এখানে দেখা যাবে।'
                    : 'No reviews yet — they appear once customers rate your products.'}
                </p>
              ) : (
                [5, 4, 3, 2, 1].map((star) => {
                  const bucket = summary?.distribution.find((row) => row.rating === star);
                  const count = bucket?.count ?? 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-muted-foreground flex w-8 shrink-0 items-center gap-1 text-xs tabular-nums">
                        {star}
                        <Star className="h-3 w-3" />
                      </span>
                      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{ width: `${(count / maxBucket) * 100}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-8 shrink-0 text-end text-xs tabular-nums">
                        {count}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(event) => {
              onInputChange(event.target.value);
              setPage(1);
            }}
            placeholder={isBn ? 'পণ্য বা মন্তব্য খুঁজুন...' : 'Search product or comment...'}
            className="h-11 rounded-full ps-10 pe-10"
            aria-label={isBn ? 'রিভিউ খুঁজুন' : 'Search reviews'}
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

        <div className="grid grid-cols-2 gap-2 sm:w-80">
          <Select
            value={rating}
            onValueChange={(value) => {
              setRating(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-full" aria-label={isBn ? 'রেটিং' : 'Rating'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{isBn ? 'সব রেটিং' : 'All ratings'}</SelectItem>
              {[5, 4, 3, 2, 1].map((star) => (
                <SelectItem key={star} value={String(star)}>
                  {star} {isBn ? 'স্টার' : 'star'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={replyState}
            onValueChange={(value) => {
              setReplyState(value as typeof replyState);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-full" aria-label={isBn ? 'উত্তর' : 'Reply state'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{isBn ? 'সব' : 'All'}</SelectItem>
              <SelectItem value="UNREPLIED">{isBn ? 'উত্তর বাকি' : 'Awaiting reply'}</SelectItem>
              <SelectItem value="REPLIED">{isBn ? 'উত্তর দেওয়া' : 'Replied'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <ErrorState
          isBn={isBn}
          title={isBn ? 'রিভিউ লোড করা যায়নি' : 'Could not load reviews'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<StarOff className="h-8 w-8" />}
          title={isBn ? 'কোনো রিভিউ নেই' : 'No reviews found'}
          description={
            search || rating !== 'ALL' || replyState !== 'ALL'
              ? isBn
                ? 'ফিল্টার পরিবর্তন করে আবার দেখুন।'
                : 'Try adjusting the filters or search term.'
              : isBn
                ? 'গ্রাহকরা পণ্য রেট করলে সেগুলো এখানে জমা হবে এবং আপনি উত্তর দিতে পারবেন।'
                : 'When customers rate your products, their reviews land here and you can reply.'
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <Card className="shadow-none">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        {review.productImage ? (
                          <CustomImage
                            src={review.productImage}
                            alt={isBn ? review.productNameBn : review.productNameEn}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-muted-foreground/60 flex h-full w-full items-center justify-center">
                            <ImageOff className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            {review.productSlug ? (
                              <Link
                                href={`/${lang}/products/${review.productSlug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-foreground line-clamp-2 text-sm font-semibold hover:underline"
                              >
                                {isBn ? review.productNameBn : review.productNameEn}
                              </Link>
                            ) : (
                              <p className="text-foreground line-clamp-2 text-sm font-semibold">
                                {isBn ? review.productNameBn : review.productNameEn}
                              </p>
                            )}
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {review.customerName} · {formatDate(review.createdAt, lang, 'medium')}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <StarRow rating={review.rating} />
                            {!review.isApproved && (
                              <StatusBadge
                                tone="neutral"
                                label={isBn ? 'অননুমোদিত' : 'Hidden'}
                              />
                            )}
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-foreground mt-2 text-sm break-words">{review.comment}</p>
                        )}

                        {review.images.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {review.images.map((image) => (
                              <div
                                key={image}
                                className="bg-muted relative h-14 w-14 overflow-hidden rounded-md"
                              >
                                <CustomImage
                                  src={image}
                                  alt={isBn ? 'রিভিউ ছবি' : 'Review photo'}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {review.sellerReply ? (
                          <div className="border-primary/30 bg-primary/5 mt-3 rounded-lg border-s-2 p-3">
                            <p className="text-primary text-xs font-semibold">
                              {isBn ? 'আপনার উত্তর' : 'Your reply'}
                              {review.sellerRepliedAt && (
                                <span className="text-muted-foreground ms-2 font-normal">
                                  {formatDate(review.sellerRepliedAt, lang, 'medium')}
                                </span>
                              )}
                            </p>
                            <p className="text-foreground mt-1 text-sm break-words">
                              {review.sellerReply}
                            </p>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 gap-2"
                            onClick={() => {
                              setReplyingTo(review);
                              setReplyText('');
                            }}
                          >
                            <MessageSquareReply className="h-3.5 w-3.5" />
                            {isBn ? 'উত্তর দিন' : 'Reply publicly'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <AdminPagination
            totalItems={data?.meta.total ?? 0}
            itemsPerPage={limit}
            currentPage={page}
            limitOptions={LIMIT_OPTIONS}
            lang={isBn ? 'bn' : 'en'}
            itemLabel={{
              singular: isBn ? 'রিভিউ' : 'review',
              plural: isBn ? 'রিভিউ' : 'reviews',
            }}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </>
      )}

      <Dialog
        open={!!replyingTo}
        onOpenChange={(open) => {
          if (!open) {
            setReplyingTo(null);
            setReplyText('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isBn ? 'রিভিউতে উত্তর দিন' : 'Reply to this review'}</DialogTitle>
            <DialogDescription>
              {isBn
                ? 'আপনার উত্তর প্রোডাক্ট পাতায় প্রকাশ্যে দেখা যাবে। ভদ্র ও সহায়ক ভাষা ব্যবহার করুন।'
                : 'Your reply is published publicly on the product page. Keep it courteous and helpful.'}
            </DialogDescription>
          </DialogHeader>

          {replyingTo && (
            <div className="bg-muted/40 rounded-lg p-3">
              <StarRow rating={replyingTo.rating} />
              <p className="text-foreground mt-1.5 text-sm">
                {replyingTo.comment || (isBn ? '(মন্তব্য নেই)' : '(no comment)')}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">— {replyingTo.customerName}</p>
            </div>
          )}

          <Textarea
            rows={4}
            value={replyText}
            maxLength={2000}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder={
              isBn ? 'যেমন: মতামতের জন্য ধন্যবাদ!' : 'e.g. Thank you for the feedback!'
            }
            aria-label={isBn ? 'উত্তর' : 'Reply'}
          />

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReplyingTo(null)} disabled={isReplying}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={() => void handleSubmitReply()} disabled={isReplying}>
              {isReplying
                ? isBn
                  ? 'প্রকাশ হচ্ছে...'
                  : 'Publishing...'
                : isBn
                  ? 'উত্তর প্রকাশ করুন'
                  : 'Publish reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            star <= rounded
              ? 'h-3.5 w-3.5 fill-amber-500 text-amber-500'
              : 'text-muted-foreground/40 h-3.5 w-3.5'
          }
        />
      ))}
    </div>
  );
}
