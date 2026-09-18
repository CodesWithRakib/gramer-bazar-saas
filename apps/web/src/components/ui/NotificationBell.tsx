'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetUserNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '@/features/notifications/notificationsApi';
import { useSelector } from 'react-redux';
import Link from 'next/link';

export function NotificationBell({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useGetUnreadCountQuery(undefined, { 
    skip: !isAuthenticated,
    pollingInterval: 30000, // poll every 30s
  });
  
  const { data: notifications } = useGetUserNotificationsQuery(undefined, { 
    skip: !isAuthenticated || !isOpen, 
  });
  
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = unreadData?.count || 0;

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

  const handleNotificationClick = async (id: string, isRead: boolean, data: any) => {
    if (!isRead) {
      await markAsRead(id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-full" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-lg">{isBn ? 'নোটিফিকেশন' : 'Notifications'}</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs text-primary hover:text-primary/80">
                <Check className="w-4 h-4 mr-1" />
                {isBn ? 'সব পড়া হয়েছে' : 'Mark all as read'}
              </Button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>{isBn ? 'কোন নোটিফিকেশন নেই' : 'No notifications yet'}</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif: any) => {
                  // Determine redirect URL based on type
                  let href = '#';
                  if (notif.type === 'ORDER_UPDATE' && notif.data?.orderId) {
                    href = `/${lang}/orders/${notif.data.orderId}`;
                  } else if (notif.type === 'REQUEST' && notif.data?.requestId) {
                    href = `/${lang}/product-requests/${notif.data.requestId}`;
                  }

                  return (
                    <Link
                      key={notif.id}
                      href={href}
                      onClick={() => handleNotificationClick(notif.id, notif.isRead, notif.data)}
                      className={`block p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                        <div>
                          <p className={`text-sm ${!notif.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                            {notif.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 opacity-75">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
