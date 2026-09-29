import type { StatusTone } from '@/components/common/StatusBadge';

export interface StatusMeta {
  en: string;
  bn: string;
  tone: StatusTone;
}

/**
 * Single source of truth for order status presentation.
 *
 * Covers every value of the API `OrderStatus` enum (including legacy
 * `ASSIGNED_TO_RIDER` / `REFUNDED`). Before this map existed, statuses such as
 * `READY_FOR_PICKUP` leaked raw enum strings into the customer UI.
 */
export const ORDER_STATUS_META: Record<string, StatusMeta> = {
  PENDING: { en: 'Pending', bn: 'অপেক্ষমাণ', tone: 'warning' },
  CONFIRMED: { en: 'Confirmed', bn: 'নিশ্চিত হয়েছে', tone: 'info' },
  PROCESSING: { en: 'Processing', bn: 'প্রক্রিয়াধীন', tone: 'info' },
  READY_FOR_PICKUP: { en: 'Ready for Pickup', bn: 'পিকআপের জন্য প্রস্তুত', tone: 'progress' },
  ASSIGNED_TO_RIDER: { en: 'Rider Assigned', bn: 'রাইডার নিয়োগ হয়েছে', tone: 'progress' },
  PICKED_UP: { en: 'Picked Up', bn: 'পিকআপ সম্পন্ন', tone: 'progress' },
  OUT_FOR_DELIVERY: { en: 'Out for Delivery', bn: 'ডেলিভারির পথে', tone: 'progress' },
  SHIPPED: { en: 'Shipped', bn: 'শিপ করা হয়েছে', tone: 'progress' },
  DELIVERED: { en: 'Delivered', bn: 'ডেলিভারি সম্পন্ন', tone: 'success' },
  CANCELLED: { en: 'Cancelled', bn: 'বাতিল', tone: 'neutral' },
  FAILED: { en: 'Failed', bn: 'ব্যর্থ', tone: 'danger' },
  RETURNED: { en: 'Returned', bn: 'ফেরত এসেছে', tone: 'warning' },
  REFUNDED: { en: 'Refunded', bn: 'রিফান্ড করা হয়েছে', tone: 'neutral' },
};

export const PAYMENT_STATUS_META: Record<string, StatusMeta> = {
  PAID: { en: 'Paid', bn: 'পরিশোধিত', tone: 'success' },
  PENDING: { en: 'Unpaid', bn: 'বকেয়া', tone: 'warning' },
  UNPAID: { en: 'Unpaid', bn: 'বকেয়া', tone: 'warning' },
  FAILED: { en: 'Payment Failed', bn: 'পেমেন্ট ব্যর্থ', tone: 'danger' },
  REFUNDED: { en: 'Refunded', bn: 'রিফান্ড করা হয়েছে', tone: 'neutral' },
};

export const PAYMENT_METHOD_META: Record<string, { en: string; bn: string }> = {
  COD: { en: 'Cash on Delivery', bn: 'ক্যাশ অন ডেলিভারি' },
  ONLINE: { en: 'Online Payment', bn: 'অনলাইন পেমেন্ট' },
};

function lookup(meta: Record<string, StatusMeta>, status?: string | null): StatusMeta {
  if (!status) return { en: 'Unknown', bn: 'অজানা', tone: 'neutral' };
  return (
    meta[status.toUpperCase()] ?? {
      en: status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      bn: status.replace(/_/g, ' '),
      tone: 'neutral',
    }
  );
}

export function getOrderStatusMeta(status?: string | null) {
  return lookup(ORDER_STATUS_META, status);
}

export function getPaymentStatusMeta(status?: string | null) {
  return lookup(PAYMENT_STATUS_META, status);
}

/** Localised label helper for the very common "just give me the text" case. */
export function statusLabel(meta: StatusMeta, isBn: boolean): string {
  return isBn ? meta.bn : meta.en;
}
