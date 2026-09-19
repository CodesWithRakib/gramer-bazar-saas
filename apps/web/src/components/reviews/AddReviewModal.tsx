'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Upload, X } from 'lucide-react';
import { useAddReviewMutation } from '@/features/reviews/reviewsApi';
import { toast } from 'sonner';
import { CustomImage } from '@/components/ui/CustomImage';

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
  const [images, setImages] = useState<string[]>([]);
  const [addReview, { isLoading }] = useAddReviewMutation();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 3) {
      toast.error(isBn ? 'সর্বোচ্চ ৩টি ছবি আপলোড করতে পারবেন' : 'You can upload a maximum of 3 images');
      return;
    }

    Array.from(files).forEach((file) => {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast.error(isBn ? 'দয়া করে শুধুমাত্র ছবি আপলোড করুন' : 'Please upload images only');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(isBn ? 'ছবির সাইজ ৫MB এর বেশি হতে পারবে না' : 'Image size cannot exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;

    try {
      await addReview({ productId, rating, comment, images }).unwrap();
      toast.success(isBn ? 'আপনার রিভিউ সফলভাবে সাবমিট হয়েছে। এডমিন অনুমোদনের পর এটি প্রদর্শিত হবে।' : 'Review submitted successfully. It will be visible after admin approval.');
      setRating(5);
      setComment('');
      setImages([]);
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
          <div className="space-y-2">
            <label className="text-sm font-medium">{isBn ? 'ছবি যোগ করুন (সর্বোচ্চ ৩টি)' : 'Add Photos (Max 3)'}</label>
            {images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border bg-muted group">
                    <CustomImage src={img} alt={`Preview ${idx}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 3 && (
              <div className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Upload photos"
                />
                <Upload className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{isBn ? 'ছবি আপলোড করতে ক্লিক করুন' : 'Click to upload photos'}</span>
                <span className="text-xs opacity-70 mt-1">{isBn ? 'সর্বোচ্চ ৫MB' : 'Max 5MB each'}</span>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || rating === 0}>
            {isLoading ? (isBn ? 'সাবমিট হচ্ছে...' : 'Submitting...') : (isBn ? 'সাবমিট করুন' : 'Submit Review')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
