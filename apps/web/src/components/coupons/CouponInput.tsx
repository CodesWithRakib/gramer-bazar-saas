'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState } from 'react';
import { useValidateCouponMutation } from '@/features/coupons/couponsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ticket, CheckCircle2 } from 'lucide-react';
import { customToast as toast } from '@/components/ui/custom-toast';

interface ValidatedCoupon {
  discountAmount: number;
  code: string;
  couponId: string;
}

interface CouponInputProps {
  isBn: boolean;
  subtotal: number;
  onApply: (coupon: ValidatedCoupon) => void;
  onRemove: () => void;
  appliedCoupon: string | null;
}

export function CouponInput({
  isBn,
  subtotal,
  onApply,
  onRemove,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [validateCoupon, { isLoading }] = useValidateCouponMutation();

  const handleApply = async () => {
    if (!code.trim()) return;

    try {
      const result = await validateCoupon({ code, subtotal }).unwrap();
      onApply(result);
      setCode('');
      toast.success(isBn ? 'কুপন সফলভাবে প্রয়োগ করা হয়েছে!' : 'Coupon applied successfully!');
    } catch (err) {
      toast.error(
        getApiErrorMessage(err) ||
          (isBn ? 'অকার্যকর বা মেয়াদোত্তীর্ণ কুপন' : 'Invalid or expired coupon')
      );
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/5 p-3">
        <div className="flex min-w-0 items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="truncate font-medium">
            {appliedCoupon} {isBn ? 'প্রয়োগ করা হয়েছে' : 'Applied'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isBn ? 'সরান' : 'Remove'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          aria-label={isBn ? 'প্রোমো কোড' : 'Promo code'}
          placeholder={isBn ? 'প্রোমো কোড (যদি থাকে)' : 'Promo code (if any)'}
          className="ps-9 uppercase"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
        />
      </div>
      <Button
        onClick={handleApply}
        disabled={isLoading || !code.trim()}
        variant="secondary"
        className="shrink-0"
      >
        {isLoading ? (isBn ? 'যাচাই...' : 'Checking...') : isBn ? 'প্রয়োগ করুন' : 'Apply'}
      </Button>
    </div>
  );
}
