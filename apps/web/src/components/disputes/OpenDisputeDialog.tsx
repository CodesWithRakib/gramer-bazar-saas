'use client';

import React, { useState } from 'react';
import { useCreateDisputeMutation, DisputeReason } from '@/features/disputes/disputesApi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface OpenDisputeDialogProps {
  orderId: string;
  isBn: boolean;
}

export function OpenDisputeDialog({ orderId, isBn }: OpenDisputeDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<DisputeReason | ''>('');
  const [description, setDescription] = useState('');
  
  const [createDispute, { isLoading }] = useCreateDisputeMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !description.trim()) return;

    try {
      await createDispute({
        orderId,
        reason: reason as DisputeReason,
        description
      }).unwrap();
      
      setOpen(false);
      // Reset form
      setReason('');
      setDescription('');
      alert(isBn ? 'অভিযোগ সফলভাবে দায়ের করা হয়েছে।' : 'Dispute opened successfully.');
    } catch (error) {
      console.error('Failed to create dispute:', error);
      alert(isBn ? 'অভিযোগ দায়ের করতে সমস্যা হয়েছে।' : 'Failed to open dispute. You may already have an active dispute for this order.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
          {isBn ? 'অভিযোগ করুন (Dispute)' : 'Open Dispute'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isBn ? 'অভিযোগ দায়ের করুন' : 'Open a Dispute'}</DialogTitle>
          <DialogDescription>
            {isBn 
              ? 'আপনার অর্ডারের সমস্যার বিস্তারিত তথ্য দিন। আমাদের সাপোর্ট টিম এটি পর্যালোচনা করবে।'
              : 'Provide details about the issue with your order. Our support team will review it.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isBn ? 'অভিযোগের কারণ' : 'Reason for Dispute'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              required
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="" disabled>
                {isBn ? 'কারণ নির্বাচন করুন' : 'Select a reason'}
              </option>
              <option value="ITEM_NOT_AS_DESCRIBED">{isBn ? 'পণ্য বর্ণনার সাথে মিলেনি' : 'Item not as described'}</option>
              <option value="ITEM_DEFECTIVE">{isBn ? 'পণ্য ত্রুটিপূর্ণ' : 'Item defective'}</option>
              <option value="NOT_DELIVERED">{isBn ? 'ডেলিভারি পাইনি' : 'Not delivered'}</option>
              <option value="WRONG_ITEM">{isBn ? 'ভুল পণ্য পেয়েছি' : 'Wrong item received'}</option>
              <option value="OTHER">{isBn ? 'অন্যান্য' : 'Other'}</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isBn ? 'বিস্তারিত বর্ণনা' : 'Detailed Description'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder={isBn ? 'সমস্যাটি বিস্তারিত লিখুন...' : 'Describe the issue in detail...'}
              className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading || !reason || !description.trim()}>
              {isLoading ? (isBn ? 'দায়ের হচ্ছে...' : 'Submitting...') : (isBn ? 'দায়ের করুন' : 'Submit Dispute')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
