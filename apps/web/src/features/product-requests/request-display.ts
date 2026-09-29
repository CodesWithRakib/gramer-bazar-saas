import type { StatusTone } from '@/components/common/StatusBadge';

export interface ProductRequestStatusMeta {
  en: string;
  bn: string;
  tone: StatusTone;
}

/**
 * Mirrors the backend `ProductRequestStatus` enum so no raw enum value ever
 * reaches the UI (the previous switch fell through to printing `status`).
 */
export const PRODUCT_REQUEST_STATUS_META: Record<string, ProductRequestStatusMeta> = {
  PENDING: { en: 'Pending review', bn: 'পর্যালোচনার অপেক্ষায়', tone: 'warning' },
  REVIEWING: { en: 'Under review', bn: 'পর্যালোচনাধীন', tone: 'info' },
  SEARCHING: { en: 'Searching suppliers', bn: 'সোর্স খোঁজা হচ্ছে', tone: 'info' },
  FOUND: { en: 'Product found', bn: 'পণ্য পাওয়া গেছে', tone: 'progress' },
  PRODUCT_ADDED: { en: 'Added to catalog', bn: 'ক্যাটালগে যুক্ত', tone: 'success' },
  CUSTOMER_NOTIFIED: { en: 'Ready to order', bn: 'অর্ডার করার জন্য প্রস্তুত', tone: 'success' },
  CLOSED: { en: 'Closed', bn: 'সম্পন্ন', tone: 'neutral' },
  REJECTED: { en: 'Rejected', bn: 'বাতিল', tone: 'danger' },
};

export function getProductRequestStatusMeta(status?: string | null): ProductRequestStatusMeta {
  if (!status) return { en: 'Unknown', bn: 'অজানা', tone: 'neutral' };
  return (
    PRODUCT_REQUEST_STATUS_META[status.toUpperCase()] ?? {
      en: status.replace(/_/g, ' ').toLowerCase(),
      bn: status.replace(/_/g, ' '),
      tone: 'neutral',
    }
  );
}
