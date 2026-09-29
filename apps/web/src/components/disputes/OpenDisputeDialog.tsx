'use client';

import React, { useState } from 'react';
import { useCreateDisputeMutation, DisputeReason } from '@/features/disputes/disputesApi';
import { DISPUTE_REASON_LABELS } from '@/features/disputes/dispute-display';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/apiError';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Reasons must match the backend `DisputeReason` enum exactly — the previous
 * option values (`ITEM_NOT_AS_DESCRIBED`, `ITEM_DEFECTIVE`, `NOT_DELIVERED`)
 * were rejected by API validation.
 */
const REASON_OPTIONS: DisputeReason[] = [
  DisputeReason.DAMAGED,
  DisputeReason.MISSING_ITEM,
  DisputeReason.NOT_AS_DESCRIBED,
  DisputeReason.WRONG_ITEM,
  DisputeReason.OTHER,
];

interface OpenDisputeDialogProps {
  orderId: string;
  isBn: boolean;
  /** Optional custom trigger element. Defaults to a destructive-toned button. */
  trigger?: React.ReactNode;
}

export function OpenDisputeDialog({ orderId, isBn, trigger }: OpenDisputeDialogProps) {
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
        reason,
        description: description.trim(),
      }).unwrap();

      setOpen(false);
      setReason('');
      setDescription('');
      toast.success(
        isBn ? 'অভিযোগ সফলভাবে দায়ের করা হয়েছে।' : 'Your dispute has been submitted.'
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isBn
            ? 'অভিযোগ দায়ের করা যায়নি।'
            : 'Could not submit the dispute. You may already have an open dispute for this order.'
        )
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="w-full rounded-xl">
            {isBn ? 'সমস্যা জানান' : 'Report an issue'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isBn ? 'অভিযোগ দায়ের করুন' : 'Open a dispute'}</DialogTitle>
          <DialogDescription>
            {isBn
              ? 'অর্ডারের সমস্যাটি বিস্তারিত লিখুন। আমাদের সাপোর্ট টিম পর্যালোচনা করে জানাবে।'
              : 'Tell us what went wrong. Our support team will review and respond.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="dispute-reason" className="text-sm font-medium">
              {isBn ? 'সমস্যার ধরন' : 'What went wrong?'}
            </label>
            <select
              id="dispute-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>
                {isBn ? 'একটি কারণ নির্বাচন করুন' : 'Select a reason'}
              </option>
              {REASON_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {isBn ? DISPUTE_REASON_LABELS[option].bn : DISPUTE_REASON_LABELS[option].en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="dispute-description" className="text-sm font-medium">
              {isBn ? 'বিস্তারিত বর্ণনা' : 'Describe the issue'}
            </label>
            <textarea
              id="dispute-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              minLength={5}
              placeholder={
                isBn ? 'কী সমস্যা হয়েছে বিস্তারিত লিখুন...' : 'Explain what happened...'
              }
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading || !reason || description.trim().length < 5}>
              {isLoading
                ? isBn
                  ? 'পাঠানো হচ্ছে...'
                  : 'Submitting...'
                : isBn
                  ? 'অভিযোগ জমা দিন'
                  : 'Submit dispute'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
