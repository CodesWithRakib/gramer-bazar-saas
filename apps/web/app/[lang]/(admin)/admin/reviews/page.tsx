'use client';
import { use } from 'react';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useGetAdminReviewsQuery, useModerateReviewMutation } from '@/features/reviews/reviewsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Check, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminReviewsQuery({ page, limit: 10 }, {
    skip: !isAuthenticated,
  });

  const [moderateReview, { isLoading: isModerating }] = useModerateReviewMutation();

  useEffect(() => {
    // Basic protection; ideally should use a layout guard or HOC
    if (!isAuthenticated || !user?.roles?.includes('ADMIN')) {
      router.push(`/${lang}/login`);
    }
  }, [isAuthenticated, user?.roles, router, lang]);

  if (!isAuthenticated || !user?.roles?.includes('ADMIN')) return null;

  const reviews = data?.data || [];
  const meta = data?.meta;

  const handleModerate = async (id: string, isApproved: boolean) => {
    try {
      await moderateReview({ id, isApproved }).unwrap();
      toast.success(isBn ? 'রিভিউ স্ট্যাটাস আপডেট হয়েছে' : 'Review status updated');
    } catch {
      toast.error(isBn ? 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' : 'Failed to update review status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{isBn ? 'রিভিউ মডারেশন' : 'Review Moderation'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            {isBn ? 'মডারেশন প্যানেল' : 'Moderation Panel'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{isBn ? 'কোনো রিভিউ পাওয়া যায়নি' : 'No reviews found'}</p>
            </div>
          ) : (
            <div className="divide-y border rounded-xl overflow-hidden">
              {reviews.map((review) => (
                <div key={review.id} className={`p-4 flex flex-col lg:flex-row gap-6 items-start lg:items-center transition-colors ${review.isApproved ? 'bg-background' : 'bg-amber-50/50'}`}>
                  
                  {/* Review Context */}
                  <div className="w-full lg:w-1/4">
                    <div className="text-sm font-medium mb-1">
                      {isBn ? review.product?.nameBn : review.product?.nameEn}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      By: {review.user?.firstName} {review.user?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Date: {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="w-full lg:w-2/4">
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm">
                      {review.comment || <span className="text-muted-foreground italic">No comment provided</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="w-full lg:w-1/4 flex gap-2 justify-end mt-4 lg:mt-0">
                    {review.isApproved ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={isModerating}
                        onClick={() => handleModerate(review.id, false)}
                        className="w-24"
                      >
                        <X className="h-4 w-4 mr-1" /> {isBn ? 'রিজেক্ট' : 'Reject'}
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm"
                        disabled={isModerating}
                        onClick={() => handleModerate(review.id, true)}
                        className="w-24 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" /> {isBn ? 'অ্যাপ্রুভ' : 'Approve'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                {isBn ? 'পূর্ববর্তী' : 'Previous'}
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                {page} / {meta.totalPages}
              </div>
              <Button 
                variant="outline" 
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              >
                {isBn ? 'পরবর্তী' : 'Next'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
