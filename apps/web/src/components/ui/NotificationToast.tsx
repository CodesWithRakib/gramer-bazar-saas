'use client';

import React from 'react';
import { toast } from '@/components/ui/toast';
import {
  Package,
  Truck,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Bell,
  X,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { AppNotification, NotificationPriority, NotificationType } from '@/types/notifications';
import { formatNotificationText, getNotificationActionUrl } from '@/lib/notification-format';

interface NotificationToastProps {
  t: string | number;
  notification: AppNotification;
  roles?: string[];
  lang?: string;
  onRead?: (id: string) => void;
}

export function NotificationToast({
  t,
  notification,
  roles = [],
  lang = 'bn',
  onRead,
}: NotificationToastProps) {
  const isBn = lang === 'bn';
  const { title, message } = formatNotificationText(notification, lang);
  const actionUrl = getNotificationActionUrl(notification, roles, lang);

  // Status icon and semantic accent color
  const getSemanticMeta = (type: NotificationType) => {
    if (type.includes('ORDER')) {
      return {
        icon: <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        dotColor: 'bg-emerald-500',
        borderColor: 'border-s-emerald-500',
      };
    }
    if (type.includes('DELIVERY')) {
      return {
        icon: <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
        dotColor: 'bg-sky-500',
        borderColor: 'border-s-sky-500',
      };
    }
    if (type.includes('APPLICATION')) {
      return {
        icon: <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
        dotColor: 'bg-violet-500',
        borderColor: 'border-s-violet-500',
      };
    }
    if (type.includes('PAYMENT') || type.includes('PAYOUT')) {
      return {
        icon: <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        dotColor: 'bg-amber-500',
        borderColor: 'border-s-amber-500',
      };
    }
    if (
      type === NotificationType.ALERT ||
      notification.priority === NotificationPriority.CRITICAL
    ) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        dotColor: 'bg-rose-500',
        borderColor: 'border-s-rose-500',
      };
    }
    return {
      icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
      dotColor: 'bg-primary',
      borderColor: 'border-s-primary',
    };
  };

  const { icon, dotColor, borderColor } = getSemanticMeta(notification.type);

  const getActionLabel = () => {
    if (notification.type.includes('ORDER')) {
      return isBn ? 'অর্ডার দেখুন' : 'View Order';
    }
    if (notification.type.includes('DELIVERY')) {
      return isBn ? 'ডেলিভারি দেখুন' : 'View Delivery';
    }
    if (notification.type.includes('APPLICATION')) {
      return isBn ? 'আবেদন দেখুন' : 'View Application';
    }
    if (notification.type.includes('PAYOUT')) {
      return isBn ? 'উত্তোলন দেখুন' : 'View Payout';
    }
    return isBn ? 'বিস্তারিত দেখুন' : 'View Details';
  };

  const handleActionClick = () => {
    onRead?.(notification.id);
    toast.dismiss(t);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`w-full max-w-sm sm:max-w-md bg-card border border-border border-s-4 ${borderColor} rounded-lg shadow-md p-3.5 flex items-start gap-3 transition-all duration-200 select-none`}
    >
      {/* Icon badge */}
      <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-md bg-muted/80">{icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0 pe-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
          <h4 className="text-sm font-semibold text-foreground truncate leading-tight">{title}</h4>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{message}</p>

        {/* Action Link if applicable */}
        {actionUrl && (
          <div className="mt-2.5">
            <Link
              href={actionUrl}
              onClick={handleActionClick}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <span>{getActionLabel()}</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </Link>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => toast.dismiss(t)}
        aria-label={isBn ? 'বন্ধ করুন' : 'Dismiss'}
        className="flex-shrink-0 text-muted-foreground/60 hover:text-foreground p-1 rounded hover:bg-muted transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Convenience helper to show the notification toast via custom toast system
 */
export function showNotificationToast(
  notification: AppNotification,
  options?: {
    roles?: string[];
    lang?: string;
    onRead?: (id: string) => void;
  }
) {
  // Lifetime based on priority
  const duration =
    notification.priority === NotificationPriority.CRITICAL
      ? 10000
      : notification.priority === NotificationPriority.HIGH
        ? 6500
        : 4500;

  toast.custom(
    (t: string | number) => (
      <NotificationToast
        t={t}
        notification={notification}
        roles={options?.roles}
        lang={options?.lang}
        onRead={options?.onRead}
      />
    ),
    { duration }
  );
}
