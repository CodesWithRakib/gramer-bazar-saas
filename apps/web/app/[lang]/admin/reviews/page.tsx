'use client';

import React from 'react';
import { useGetAdminReviewsQuery, useModerateReviewMutation } from '@/features/reviews/reviewsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
  const { data: reviews, isLoading } = useGetAdminReviewsQuery();
  const [moderate, { isLoading: isModerating }] = useModerateReviewMutation();

  const handleModerate = async (id: string, isApproved: boolean) => {
    try {
      await moderate({ id, isApproved }).unwrap();
      toast.success('Review status updated successfully');
    } catch {
      toast.error('Failed to update review status');
    }
  };

  if (isLoading) return <div className="p-8">Loading reviews...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Review Moderation</h1>
      
      {!reviews || reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No reviews found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className={review.isApproved ? '' : 'border-amber-300 bg-amber-50'}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">
                  {review.product?.nameEn}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={review.isApproved ? "outline" : "default"}
                    className="bg-green-600 text-white hover:bg-green-700"
                    disabled={review.isApproved || isModerating}
                    onClick={() => handleModerate(review.id, true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant={!review.isApproved ? "outline" : "destructive"}
                    disabled={!review.isApproved || isModerating}
                    onClick={() => handleModerate(review.id, false)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-medium">{review.user?.firstName} {review.user?.lastName}</span>
                  <div className="flex gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {new Date(review.createdAt).toLocaleString()}
                  </span>
                </div>
                {review.comment && <p className="text-foreground">{review.comment}</p>}
                
                <div className="mt-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    review.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {review.isApproved ? 'Approved & Visible' : 'Rejected & Hidden'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
