'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useAddReviewMutation } from '@/features/reviews/reviewsApi';
import { toast } from 'sonner';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  isBn: boolean;
}

export function AddReviewModal({ isOpen, onClose, productId, isBn }: AddReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [addReview, { isLoading }] = useAddReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;

    try {
      await addReview({ productId, rating, comment }).unwrap();
      toast.success(isBn ? 'আপনার রিভিউ সফলভাবে সাবমিট হয়েছে। এডমিন অনুমোদনের পর এটি প্রদর্শিত হবে।' : 'Review submitted successfully. It will be visible after admin approval.');
      setRating(5);
      setComment('');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || (isBn ? 'রিভিউ সাবমিট করতে সমস্যা হয়েছে' : 'Failed to submit review'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isBn ? 'রিভিউ লিখুন' : 'Write a Review'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">{isBn ? 'আপনার রেটিং' : 'Your Rating'}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{isBn ? 'আপনার মন্তব্য (ঐচ্ছিক)' : 'Your Comment (Optional)'}</label>
            <Textarea
              placeholder={isBn ? 'আপনার অভিজ্ঞতা আমাদের সাথে শেয়ার করুন...' : 'Share your experience with us...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || rating === 0}>
            {isLoading ? (isBn ? 'সাবমিট হচ্ছে...' : 'Submitting...') : (isBn ? 'সাবমিট করুন' : 'Submit Review')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
