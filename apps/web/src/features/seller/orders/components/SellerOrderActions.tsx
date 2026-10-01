'use client';

import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { customToast as toast } from '@/components/ui/custom-toast';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/apiError';
import { getOrderStatusMeta, statusLabel } from '@/lib/order-status';
import { useTransitionSellerOrderMutation } from '@/features/seller';
import { OrderStatus } from '@/features/orders/ordersApi';

export interface SellerOrderActionsProps {
  orderId: string;
  /** Statuses the API will accept — computed server-side from the state machine. */
  allowedNextStatuses: OrderStatus[];
  isBn: boolean;
  size?: 'sm' | 'default';
  className?: string;
  /** Called after a successful transition so the parent can refresh. */
  onTransitioned?: () => void;
  /** Renders the trigger as a full-width button (mobile cards). */
  fullWidth?: boolean;
}

/**
 * Status transition control for a seller order.
 *
 * The option list is exactly `allowedNextStatuses` from the API, which is
 * derived from the authoritative order state machine, so the UI can never
 * offer a transition the backend would reject. Cancellations ask for an
 * optional reason which is recorded on the order timeline.
 */
export function SellerOrderActions({
  orderId,
  allowedNextStatuses,
  isBn,
  size = 'default',
  className,
  onTransitioned,
  fullWidth = false,
}: SellerOrderActionsProps) {
  const [transitionOrder, { isLoading }] = useTransitionSellerOrderMutation();
  const [pendingCancel, setPendingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (allowedNextStatuses.length === 0) {
    return null;
  }

  const runTransition = async (targetStatus: OrderStatus, reason?: string) => {
    try {
      await transitionOrder({ id: orderId, targetStatus, reason }).unwrap();
      toast.success(
        isBn
          ? `অর্ডার "${statusLabel(getOrderStatusMeta(targetStatus), true)}" অবস্থায় গেছে`
          : `Order moved to ${statusLabel(getOrderStatusMeta(targetStatus), false)}`
      );
      onTransitioned?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, isBn ? 'অবস্থা পরিবর্তন ব্যর্থ' : 'Could not update the order')
      );
    }
  };

  const primary = allowedNextStatuses[0];
  const rest = allowedNextStatuses.slice(1);

  const handlePrimary = () => {
    if (primary === OrderStatus.CANCELLED) {
      setPendingCancel(true);
      return;
    }
    void runTransition(primary);
  };

  const triggerClass = fullWidth ? 'w-full gap-2' : `gap-2 ${className ?? ''}`;

  return (
    <>
      <div
        className={fullWidth ? 'flex w-full items-center gap-2' : 'inline-flex items-center gap-1'}
      >
        <Button size={size} onClick={handlePrimary} disabled={isLoading} className={triggerClass}>
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isBn ? 'মার্ক করুন: ' : 'Mark as '}
          {statusLabel(getOrderStatusMeta(primary), isBn)}
        </Button>

        {rest.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size={size}
                variant="outline"
                disabled={isLoading}
                aria-label={isBn ? 'অন্যান্য কার্যক্রম' : 'Other actions'}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {rest.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onSelect={() => {
                    if (status === OrderStatus.CANCELLED) {
                      setPendingCancel(true);
                      return;
                    }
                    void runTransition(status);
                  }}
                >
                  {statusLabel(getOrderStatusMeta(status), isBn)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={pendingCancel} onOpenChange={setPendingCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isBn ? 'অর্ডার বাতিল করবেন?' : 'Cancel this order?'}</DialogTitle>
            <DialogDescription>
              {isBn
                ? 'বাতিল করলে স্টক ফিরিয়ে আনা হবে এবং গ্রাহককে জানানো হবে। কারণ লিখলে অর্ডারের ইতিহাসে সংরক্ষিত হবে।'
                : 'Cancelling restores stock and notifies the customer. Adding a reason records it on the order timeline for your records.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">{isBn ? 'কারণ (ঐচ্ছিক)' : 'Reason (optional)'}</Label>
            <Input
              id="cancel-reason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder={isBn ? 'যেমন: স্টক শেষ' : 'e.g. Out of stock'}
              maxLength={300}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPendingCancel(false)} disabled={isLoading}>
              {isBn ? 'ফিরে যান' : 'Keep order'}
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={async () => {
                await runTransition(OrderStatus.CANCELLED, cancelReason.trim() || undefined);
                setPendingCancel(false);
                setCancelReason('');
              }}
            >
              {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isBn ? 'অর্ডার বাতিল করুন' : 'Cancel order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
