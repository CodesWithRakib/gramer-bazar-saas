'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetProductReviewsQuery } from '@/features/reviews/reviewsApi';
import { Button } from '@/components/ui/button';
import { Star, User } from 'lucide-react';
import { AddReviewModal } from './AddReviewModal';
import { useRouter } from 'next/navigation';

interface ProductReviewsProps {
  productId: string;
  isBn: boolean;
  lang: string;
}

export function ProductReviews({ productId, isBn, lang }: ProductReviewsProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useGetProductReviewsQuery({ productId, page, limit: 5 });

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      router.push(`/${lang}/login?redirect=/${lang}/products/${productId}`);
      return;
    }
    // Note: The backend prevents non-purchasers from adding a review. We'll attempt to open it, 
    // and if they haven't purchased, the mutation will return an error toast.
    setIsModalOpen(true);
  };

  const reviews = data?.data || [];
  const meta = data?.meta;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-12 pt-8 border-t">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{isBn ? 'গ্রাহকদের রিভিউ' : 'Customer Reviews'}</h2>
          <p className="text-muted-foreground">
            {meta?.total || 0} {isBn ? 'টি রিভিউ পাওয়া গেছে' : 'reviews found'}
          </p>
        </div>
        <Button onClick={handleWriteReviewClick}>
          {isBn ? 'রিভিউ লিখুন' : 'Write a Review'}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">{isBn ? 'এখনও কোনো রিভিউ নেই। প্রথম রিভিউটি লিখুন!' : 'No reviews yet. Be the first to review!'}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="p-5 bg-card rounded-lg border shadow-sm flex gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold">{review.user?.firstName} {review.user?.lastName}</h4>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', { dateStyle: 'medium' }).format(new Date(review.createdAt))}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-foreground mt-2 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button 
              variant="outline" 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              {isBn ? 'পূর্ববর্তী' : 'Previous'}
            </Button>
            <Button 
              variant="outline" 
              disabled={page === meta.totalPages}
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            >
              {isBn ? 'পরবর্তী' : 'Next'}
            </Button>
          </div>
        )}
      </div>

      <AddReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        isBn={isBn}
      />
    </div>
  );
}
