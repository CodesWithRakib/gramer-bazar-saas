'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  Volume2,
  VolumeX,
  ArrowRight,
  Package,
  Truck,
  FileText,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/features/notifications/notificationsApi';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import {
  formatNotificationText,
  formatNotificationTime,
  getNotificationActionUrl,
} from '@/lib/notification-format';
import { isNotificationSoundEnabled, setNotificationSoundEnabled } from '@/lib/notification-sound';
import { AppNotification, NotificationType } from '@/types/notifications';

export function NotificationBell({ lang = 'bn' }: { lang?: string }) {
  const isBn = lang === 'bn';
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSoundEnabled(isNotificationSoundEnabled());
  }, []);

  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: notifData, isLoading } = useGetUserNotificationsQuery(
    { page: 1, limit: 15 },
    {
      skip: !isAuthenticated || !isOpen,
    }
  );

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const unreadCount = unreadData?.count ?? 0;
  const notifications: AppNotification[] = notifData?.items ?? [];
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  // Determine Notification Center Link based on primary role
  const getNotificationCenterUrl = () => {
    if (roles.includes('admin') || roles.includes('super-admin')) {
      return `/${lang}/admin/notifications`;
    }
    if (roles.includes('seller')) {
      return `/${lang}/seller/notifications`;
    }
    if (roles.includes('rider')) {
      return `/${lang}/rider/notifications`;
    }
    return `/${lang}/customer/notifications`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    setNotificationSoundEnabled(next);
  };

  const getNotificationIcon = (type: NotificationType) => {
    if (type.includes('ORDER')) {
      return <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (type.includes('DELIVERY')) {
      return <Truck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
    }
    if (type.includes('APPLICATION')) {
      return <FileText className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />;
    }
    if (type.includes('PAYMENT') || type.includes('PAYOUT')) {
      return <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
    return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full hover:bg-muted text-foreground/80 hover:text-foreground h-9 w-9 sm:h-10 sm:w-10"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isBn ? 'নোটিফিকেশন দেখুন' : 'View notifications'}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Mobile backdrop for outside dismiss */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Dropdown Container */}
          <div className="fixed left-2 right-2 top-16 sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:absolute sm:w-96 max-h-[calc(100vh-80px)] sm:max-h-[520px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-100 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-3 sm:p-3.5 border-b border-border bg-muted/30 shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate">
                  {isBn ? 'নোটিফিকেশন' : 'Notifications'}
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Sound Mute Toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  title={
                    soundEnabled
                      ? isBn
                        ? 'সাউন্ড বন্ধ করুন'
                        : 'Mute chime'
                      : isBn
                        ? 'সাউন্ড চালু করুন'
                        : 'Unmute chime'
                  }
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-primary" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {/* Mark All Read */}
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isMarkingAll}
                    onClick={handleMarkAllAsRead}
                    className="h-7 text-xs px-2 text-primary hover:text-primary/80 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 me-1" />
                    <span>{isBn ? 'সব পড়ুন' : 'Mark all'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 max-h-[340px] sm:max-h-[380px]">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  {isBn ? 'লোড হচ্ছে...' : 'Loading notifications...'}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">
                    {isBn ? 'কোন নোটিফিকেশন নেই' : 'No notifications yet'}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {isBn
                      ? 'নতুন কোনো আপডেট আসলে এখানে দেখতে পাবেন।'
                      : 'Activity alerts will appear here.'}
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const { title, message } = formatNotificationText(notif, lang);
                  const targetUrl = getNotificationActionUrl(notif, roles, lang);
                  const relativeTime = formatNotificationTime(notif.createdAt, lang);

                  const itemContent = (
                    <div className="flex items-start gap-2.5">
                      {/* Read status dot */}
                      <span
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                          !notif.isRead ? 'bg-primary' : 'bg-transparent'
                        }`}
                      />

                      {/* Icon badge */}
                      <div className="mt-0.5 p-1 rounded bg-muted/80 flex-shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs leading-snug break-words ${
                            !notif.isRead
                              ? 'font-semibold text-foreground'
                              : 'font-medium text-foreground/80'
                          }`}
                        >
                          {title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed break-words">
                          {message}
                        </p>
                        <span className="text-[10px] text-muted-foreground/75 mt-1 block">
                          {relativeTime}
                        </span>
                      </div>
                    </div>
                  );

                  const itemClassName = `block p-3 sm:p-3.5 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notif.isRead ? 'bg-primary/[0.04]' : ''
                  }`;

                  return targetUrl ? (
                    <Link
                      key={notif.id}
                      href={targetUrl}
                      onClick={() => handleNotificationClick(notif)}
                      className={itemClassName}
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={itemClassName}
                    >
                      {itemContent}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer: View All Notifications */}
            <div className="p-2 border-t border-border bg-muted/20 text-center shrink-0">
              <Link
                href={getNotificationCenterUrl()}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 py-1 px-3 transition-colors"
              >
                <span>{isBn ? 'সব নোটিফিকেশন দেখুন' : 'View all notifications'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
