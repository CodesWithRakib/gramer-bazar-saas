'use client';
import { use } from 'react';

import React from 'react';
import { useGetUserReviewsQuery } from '@/features/reviews/reviewsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Link from 'next/link';

export default function MyReviewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: reviews, isLoading } = useGetUserReviewsQuery();

  if (isLoading) return <div className="container mx-auto p-8">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{isBn ? 'আমার মতামত' : 'My Reviews'}</h1>
      
      {!reviews || reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {isBn ? 'আপনি এখনও কোন মতামত দেননি।' : 'You have not written any reviews yet.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-center">
                  <Link href={`/${lang}/products/${review.product?.slug || ''}`} className="hover:underline text-primary">
                    {isBn ? review.product?.nameBn : review.product?.nameEn}
                  </Link>
                  <span className="text-sm font-normal text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                  ))}
                </div>
                {review.comment && <p className="text-foreground">{review.comment}</p>}
                
                {!review.isApproved && (
                  <p className="text-sm text-amber-500 mt-2 font-medium">
                    {isBn ? 'পর্যালোচনার অপেক্ষায় আছে' : 'Pending moderation approval'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
