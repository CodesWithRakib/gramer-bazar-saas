'use client';
import { use } from 'react';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useGetUserReviewsQuery } from '@/features/reviews/reviewsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquareQuote, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CustomerReviewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: reviews, isLoading } = useGetUserReviewsQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${lang}/login?redirect=/${lang}/reviews`);
    }
  }, [isAuthenticated, router, lang]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">{isBn ? 'আমার রিভিউসমূহ' : 'My Reviews'}</h1>
      
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading your reviews...</div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl">
          <MessageSquareQuote className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{isBn ? 'কোনো রিভিউ পাওয়া যায়নি' : 'No reviews found'}</h3>
          <p className="text-muted-foreground mb-6">
            {isBn ? 'আপনি এখনও কোনো পণ্যের রিভিউ দেননি।' : 'You haven\'t reviewed any products yet.'}
          </p>
          <Link href={`/${lang}/orders`} className="text-primary hover:underline font-medium">
            {isBn ? 'অর্ডার হিস্ট্রি দেখুন' : 'View your orders'}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row border-b last:border-0">
                  {/* Product Info */}
                  <div className="p-6 md:w-1/3 bg-muted/20 border-r flex flex-col justify-center">
                    {review.product ? (
                      <Link href={`/${lang}/products/${review.product.slug}`} className="group">
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {isBn ? review.product.nameBn : review.product.nameEn}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          {isBn ? 'প্রোডাক্ট দেখুন' : 'View Product'} &rarr;
                        </p>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{isBn ? 'অজানা প্রোডাক্ট' : 'Unknown Product'}</span>
                    )}
                  </div>
                  
                  {/* Review Content */}
                  <div className="p-6 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          {review.isApproved ? (
                            <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {isBn ? 'প্রকাশিত' : 'Published'}
                            </span>
                          ) : (
                            <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3 mr-1" />
                              {isBn ? 'অপেক্ষমাণ' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {review.comment ? (
                        <p className="text-foreground text-sm italic">&ldquo;{review.comment}&rdquo;</p>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">{isBn ? 'কোনো মন্তব্য নেই' : 'No comment provided'}</p>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      {isBn ? 'রিভিউ দেওয়া হয়েছে:' : 'Reviewed on:'} {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', { dateStyle: 'long' }).format(new Date(review.createdAt))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
