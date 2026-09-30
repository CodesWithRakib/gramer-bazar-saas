import enDict from '../dictionaries/en.json';
import bnDict from '../dictionaries/bn.json';
import { AppNotification, NotificationType } from '../types/notifications';

type DictType = typeof enDict;

const dictionaries: Record<'en' | 'bn', DictType> = {
  en: enDict,
  bn: bnDict,
};

/**
 * Formats notification title and message using i18n dictionary keys if present,
 * falling back to server-rendered strings, with {{param}} interpolation.
 */
export function formatNotificationText(
  notification: Pick<AppNotification, 'title' | 'message' | 'titleKey' | 'messageKey' | 'data'>,
  lang: string = 'bn'
): { title: string; message: string } {
  const currentLang = (lang === 'en' ? 'en' : 'bn') as 'en' | 'bn';
  const dict = dictionaries[currentLang];
  const notifDict = dict.notifications as Record<string, unknown> | undefined;

  let title = notification.title;
  let message = notification.message;

  // Resolve titleKey if available (e.g. "notifications.order_created.title")
  if (notification.titleKey && notifDict) {
    const keyPath = notification.titleKey.replace(/^notifications\./, '').split('.');
    let resolved: unknown = notifDict;
    for (const segment of keyPath) {
      if (resolved && typeof resolved === 'object' && segment in resolved) {
        resolved = (resolved as Record<string, unknown>)[segment];
      } else {
        resolved = null;
        break;
      }
    }
    if (typeof resolved === 'string') {
      title = resolved;
    }
  }

  // Resolve messageKey if available (e.g. "notifications.order_created.message")
  if (notification.messageKey && notifDict) {
    const keyPath = notification.messageKey.replace(/^notifications\./, '').split('.');
    let resolved: unknown = notifDict;
    for (const segment of keyPath) {
      if (resolved && typeof resolved === 'object' && segment in resolved) {
        resolved = (resolved as Record<string, unknown>)[segment];
      } else {
        resolved = null;
        break;
      }
    }
    if (typeof resolved === 'string') {
      message = resolved;
    }
  }

  // Interpolate data values: {{key}}
  if (notification.data && typeof notification.data === 'object') {
    for (const [key, rawValue] of Object.entries(notification.data)) {
      if (rawValue !== undefined && rawValue !== null) {
        const valStr = String(rawValue);
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        title = title.replace(regex, valStr);
        message = message.replace(regex, valStr);
      }
    }
  }

  // Intelligent Bangla fallback translation for unkeyed notifications
  if (currentLang === 'bn') {
    const lowerTitle = title?.toLowerCase().trim();
    if (lowerTitle === 'new delivery assigned') {
      title = 'নতুন ডেলিভারি দায়িত্ব বরাদ্দ';
      if (message.includes('assigned to you for delivery')) {
        const orderMatch = message.match(/#([a-zA-Z0-9]+)/);
        const orderNum = orderMatch ? orderMatch[1] : '';
        message = `অর্ডার #${orderNum} ডেলিভারির জন্য আপনাকে দায়িত্ব প্রদান করা হয়েছে।`;
      }
    } else if (lowerTitle === 'order dispatched' || lowerTitle === 'delivery started') {
      title = 'অর্ডার ডেলিভারির জন্য বের হয়েছে';
    } else if (lowerTitle === 'delivery completed' || lowerTitle === 'order delivered') {
      title = 'ডেলিভারি সফলভাবে সম্পন্ন হয়েছে';
    } else if (lowerTitle === 'payout requested') {
      title = 'টাকা উত্তোলনের অনুরোধ গৃহীত হয়েছে';
    }
  }

  return { title, message };
}

/**
 * Format relative time in Bangla or English
 */
export function formatNotificationTime(createdAt: string, lang: string = 'bn'): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  const isBn = lang === 'bn';

  if (diffSec < 60) {
    return isBn ? 'এইমাত্র' : 'Just now';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    const minStr = isBn ? toBengaliNumber(diffMin) : diffMin;
    return isBn ? `${minStr} মিনিট আগে` : `${minStr}m ago`;
  }

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    const hrStr = isBn ? toBengaliNumber(diffHr) : diffHr;
    return isBn ? `${hrStr} ঘণ্টা আগে` : `${hrStr}h ago`;
  }

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) {
    const dayStr = isBn ? toBengaliNumber(diffDays) : diffDays;
    return isBn ? `${dayStr} দিন আগে` : `${dayStr}d ago`;
  }

  return date.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toBengaliNumber(n: number): string {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n
    .toString()
    .split('')
    .map((c) => digits[parseInt(c, 10)] ?? c)
    .join('');
}

/**
 * Resolve target navigation link based on user's active role and notification metadata
 */
export function getNotificationActionUrl(
  notification: Pick<AppNotification, 'type' | 'data'>,
  roles: string[] = [],
  lang: string = 'bn'
): string | null {
  const data = notification.data || {};
  const isSeller = roles.includes('seller');
  const isRider = roles.includes('rider');
  const isAdmin = roles.includes('admin') || roles.includes('super-admin');

  // Orders
  if (notification.type.includes('ORDER') || notification.type === NotificationType.ORDER_UPDATE) {
    if (data.orderId) {
      if (isAdmin) {
        return `/${lang}/admin/orders/${data.orderId}`;
      }
      if (isSeller) {
        return `/${lang}/seller/orders/${data.orderId}`;
      }
      return `/${lang}/customer/orders/${data.orderId}`;
    }
  }

  // Deliveries
  if (notification.type.includes('DELIVERY')) {
    if (isRider) {
      return data.deliveryId
        ? `/${lang}/rider/deliveries/${data.deliveryId}`
        : `/${lang}/rider/deliveries`;
    }
    if (isAdmin) {
      return `/${lang}/admin/deliveries`;
    }
    if (data.orderId) {
      return `/${lang}/customer/orders/${data.orderId}`;
    }
  }

  // Applications
  if (notification.type.includes('SELLER_APPLICATION')) {
    if (isAdmin) {
      return `/${lang}/admin/applications/seller`;
    }
    return `/${lang}/seller`;
  }

  if (notification.type.includes('RIDER_APPLICATION')) {
    if (isAdmin) {
      return `/${lang}/admin/applications/rider`;
    }
    return `/${lang}/rider`;
  }

  // Payouts
  if (notification.type.includes('PAYOUT')) {
    if (isAdmin) {
      return `/${lang}/admin/payouts`;
    }
    return `/${lang}/seller/payouts`;
  }

  // Product Requests
  if (notification.type === NotificationType.REQUEST && data.requestId) {
    if (isAdmin) {
      return `/${lang}/admin/product-requests`;
    }
    return `/${lang}/customer/product-requests/${data.requestId}`;
  }

  return null;
}
