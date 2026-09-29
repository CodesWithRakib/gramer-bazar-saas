import type { StatusTone } from '@/components/common/StatusBadge';

export interface DisputeStatusMeta {
  en: string;
  bn: string;
  tone: StatusTone;
}

export const DISPUTE_STATUS_META: Record<string, DisputeStatusMeta> = {
  OPEN: { en: 'Open', bn: 'উন্মুক্ত', tone: 'info' },
  UNDER_REVIEW: { en: 'Under Review', bn: 'পর্যালোচনাধীন', tone: 'warning' },
  RESOLVED_REFUNDED: { en: 'Resolved · Refunded', bn: 'সমাধান · রিফান্ড', tone: 'success' },
  RESOLVED_REJECTED: { en: 'Rejected', bn: 'বাতিল করা হয়েছে', tone: 'danger' },
};

export const DISPUTE_REASON_LABELS: Record<string, { en: string; bn: string }> = {
  DAMAGED: { en: 'Damaged product', bn: 'ক্ষতিগ্রস্ত পণ্য' },
  MISSING_ITEM: { en: 'Missing item', bn: 'পণ্য অনুপস্থিত' },
  NOT_AS_DESCRIBED: { en: 'Not as described', bn: 'বর্ণনার সাথে মেলেনি' },
  WRONG_ITEM: { en: 'Wrong item delivered', bn: 'ভুল পণ্য ডেলিভারি' },
  OTHER: { en: 'Other issue', bn: 'অন্যান্য সমস্যা' },
};

export function getDisputeStatusMeta(status?: string | null): DisputeStatusMeta {
  if (!status) return { en: 'Unknown', bn: 'অজানা', tone: 'neutral' };
  return (
    DISPUTE_STATUS_META[status.toUpperCase()] ?? {
      en: status.replace(/_/g, ' '),
      bn: status.replace(/_/g, ' '),
      tone: 'neutral',
    }
  );
}

export function getDisputeReasonLabel(reason: string | undefined | null, isBn: boolean): string {
  if (!reason) return isBn ? 'কারণ উল্লেখ নেই' : 'No reason provided';
  const key = reason.toUpperCase();
  const meta = DISPUTE_REASON_LABELS[key];
  if (meta) return isBn ? meta.bn : meta.en;
  return reason.replace(/_/g, ' ').toLowerCase();
}
