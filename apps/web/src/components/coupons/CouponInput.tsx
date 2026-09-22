'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState } from 'react';
import { useValidateCouponMutation } from '@/features/coupons/couponsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Ticket, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface CouponInputProps {
  isBn: boolean;
  subtotal: number;
  onApply: (discountAmount: number, couponCode: string) => void;
  onRemove: () => void;
  appliedCoupon: string | null;
}

export function CouponInput({ isBn, subtotal, onApply, onRemove, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [validateCoupon, { isLoading }] = useValidateCouponMutation();

  const handleApply = async () => {
    if (!code.trim()) return;

    try {
      const result = await validateCoupon({ code, subtotal }).unwrap();
      onApply(result.discountAmount, result.code);
      toast.success(isBn ? 'কুপন সফলভাবে প্রয়োগ করা হয়েছে!' : 'Coupon applied successfully!');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || (isBn ? 'অকার্যকর বা মেয়াদোত্তীর্ণ কুপন' : 'Invalid or expired coupon'));
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between bg-green-50/50 border border-green-200 p-3 rounded-md">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">{appliedCoupon} {isBn ? 'প্রয়োগ করা হয়েছে' : 'Applied'}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRemove}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          {isBn ? 'সরান' : 'Remove'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder={isBn ? 'প্রোমো কোড (যদি থাকে)' : 'Promo Code (if any)'}
          className="pl-9 uppercase"
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
      >
        {isLoading ? (isBn ? 'যাচাই...' : 'Checking...') : (isBn ? 'প্রয়োগ করুন' : 'Apply')}
      </Button>
    </div>
  );
}
