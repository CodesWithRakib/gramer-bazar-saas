'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  Package,
  Truck,
  FileText,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '../notificationsApi';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import {
  formatNotificationText,
  formatNotificationTime,
  getNotificationActionUrl,
} from '@/lib/notification-format';
import { isNotificationSoundEnabled, setNotificationSoundEnabled } from '@/lib/notification-sound';
import { AppNotification, NotificationType } from '@/types/notifications';

interface NotificationCenterViewProps {
  lang?: string;
}

type TabFilter = 'all' | 'unread' | 'orders' | 'applications';

export function NotificationCenterView({ lang = 'bn' }: NotificationCenterViewProps) {
  const isBn = lang === 'bn';
  const { user } = useAppSelector((state) => state.auth);
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [page, setPage] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(isNotificationSoundEnabled());
  }, []);

  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.count ?? 0;

  const { data: notifData, isLoading } = useGetUserNotificationsQuery({
    page,
    limit: 20,
    unreadOnly: activeTab === 'unread',
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setNotificationSoundEnabled(next);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  const handleMarkSingle = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    await markAsRead(id);
  };

  const allItems = notifData?.items ?? [];
  const filteredItems = allItems.filter((item) => {
    if (activeTab === 'orders') {
      return item.type.includes('ORDER') || item.type.includes('DELIVERY');
    }
    if (activeTab === 'applications') {
      return (
        item.type.includes('APPLICATION') ||
        item.type.includes('PAYOUT') ||
        item.type.includes('PAYMENT')
      );
    }
    return true;
  });

  const totalPages = notifData?.totalPages ?? 1;

  const getNotificationIcon = (type: NotificationType) => {
    if (type.includes('ORDER')) {
      return <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (type.includes('DELIVERY')) {
      return <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    }
    if (type.includes('APPLICATION')) {
      return <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
    }
    if (type.includes('PAYMENT') || type.includes('PAYOUT')) {
      return <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const getActionLabel = (type: NotificationType) => {
    if (type.includes('ORDER')) {
      return isBn ? 'অর্ডার দেখুন' : 'View Order';
    }
    if (type.includes('DELIVERY')) {
      return isBn ? 'ডেলিভারি দেখুন' : 'View Delivery';
    }
    if (type.includes('APPLICATION')) {
      return isBn ? 'আবেদন দেখুন' : 'View Application';
    }
    if (type.includes('PAYOUT')) {
      return isBn ? 'উত্তোলন দেখুন' : 'View Payout';
    }
    return isBn ? 'বিস্তারিত দেখুন' : 'View Details';
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isBn ? 'নোটিফিকেশন সেন্টার' : 'Notification Center'}
            </h1>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
              >
                {unreadCount} {isBn ? 'নতুন' : 'new'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn
              ? 'আপনার অ্যাকাউন্ট সংক্রান্ত সমস্ত রিয়েল-টাইম তথ্য এবং কার্যক্রমের তালিকা'
              : 'All real-time updates and activity notifications across your account'}
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSound}
            className="h-9 gap-1.5 text-xs"
            title={
              soundEnabled
                ? isBn
                  ? 'নোটিফিকেশন সাউন্ড চালু আছে'
                  : 'Sound chime enabled'
                : isBn
                  ? 'সাউন্ড বন্ধ আছে'
                  : 'Sound muted'
            }
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-primary" />
                <span>{isBn ? 'সাউন্ড চালু' : 'Sound On'}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                <span>{isBn ? 'সাউন্ড বন্ধ' : 'Muted'}</span>
              </>
            )}
          </Button>

          {/* Mark All As Read */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isMarkingAll}
              onClick={handleMarkAll}
              className="h-9 gap-1.5 text-xs text-primary hover:text-primary/90 hover:bg-primary/5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{isBn ? 'সব পড়া হয়েছে' : 'Mark all read'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1.5 py-4 border-b border-border overflow-x-auto">
        <Button
          variant={activeTab === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          className="h-8 text-xs font-medium rounded-full"
        >
          {isBn ? 'সকল' : 'All'}
        </Button>
        <Button
          variant={activeTab === 'unread' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            setActiveTab('unread');
            setPage(1);
          }}
          className="h-8 text-xs font-medium rounded-full gap-1.5"
        >
          <span>{isBn ? 'অপঠিত' : 'Unread'}</span>
          {unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            setActiveTab('orders');
            setPage(1);
          }}
          className="h-8 text-xs font-medium rounded-full"
        >
          {isBn ? 'অর্ডার ও ডেলিভারি' : 'Orders & Delivery'}
        </Button>
        <Button
          variant={activeTab === 'applications' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => {
            setActiveTab('applications');
            setPage(1);
          }}
          className="h-8 text-xs font-medium rounded-full"
        >
          {isBn ? 'আবেদন ও লেনদেন' : 'Applications & Payouts'}
        </Button>
      </div>

      {/* Notifications List Content */}
      <div className="py-4">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {isBn ? 'নোটিফিকেশন লোড হচ্ছে...' : 'Loading notifications...'}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground border border-dashed rounded-xl my-4">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <h3 className="text-base font-semibold text-foreground">
              {isBn ? 'কোন নোটিফিকেশন পাওয়া যায়নি' : 'No notifications found'}
            </h3>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm mx-auto">
              {isBn
                ? 'নতুন যেকোনো অর্ডার, লেনদেন বা সিস্টেম আপডেট আসলে এখানে প্রদর্শিত হবে।'
                : 'When new orders, activity, or application updates happen, you will see them here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((notif) => {
              const { title, message } = formatNotificationText(notif, lang);
              const targetUrl = getNotificationActionUrl(notif, roles, lang);
              const relativeTime = formatNotificationTime(notif.createdAt, lang);

              return (
                <div
                  key={notif.id}
                  className={`group relative rounded-xl border p-4 transition-all duration-150 hover:shadow-sm ${
                    !notif.isRead
                      ? 'bg-card border-primary/20 shadow-xs'
                      : 'bg-card/60 border-border/70 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Status dot */}
                    <div className="mt-1 flex-shrink-0">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          !notif.isRead ? 'bg-primary' : 'bg-transparent'
                        }`}
                      />
                    </div>

                    {/* Type Icon */}
                    <div className="p-2 rounded-lg bg-muted/80 flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 pe-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4
                          className={`text-sm leading-snug break-words ${
                            !notif.isRead
                              ? 'font-semibold text-foreground'
                              : 'font-medium text-foreground/80'
                          }`}
                        >
                          {title}
                        </h4>
                        <span className="text-[11px] text-muted-foreground/75 whitespace-nowrap shrink-0">
                          {relativeTime}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed break-words">
                        {message}
                      </p>

                      {/* Action buttons */}
                      <div className="mt-3 flex items-center gap-3">
                        {targetUrl && (
                          <Link
                            href={targetUrl}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif.id);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <span>{getActionLabel(notif.type)}</span>
                            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                          </Link>
                        )}

                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkSingle(e, notif.id)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>{isBn ? 'পড়া হয়েছে' : 'Mark as read'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-border mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1 h-8 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isBn ? 'আগের পৃষ্ঠা' : 'Previous'}</span>
            </Button>

            <span className="text-xs text-muted-foreground">
              {isBn ? `পৃষ্ঠা ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="gap-1 h-8 text-xs"
            >
              <span>{isBn ? 'পরের পৃষ্ঠা' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
