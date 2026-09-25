'use client';

import React, { use } from 'react';
import { 
  useGetUserNotificationsQuery, 
  useMarkAllAsReadMutation, 
  useMarkAsReadMutation 
} from '@/features/notifications/notificationsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  
  const { data: notifications, isLoading } = useGetUserNotificationsQuery(undefined, { pollingInterval: 60000 });
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleMarkRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'নোটিফিকেশন' : 'Notifications'}
        </h1>
        <Button 
          variant="outline" 
          onClick={handleMarkAllRead} 
          disabled={isMarkingAll || !notifications?.some(n => !n.isRead)}
        >
          {isBn ? 'সব পড়া হয়েছে' : 'Mark all as read'}
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : notifications?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-50"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <p>{isBn ? 'কোন নোটিফিকেশন নেই' : 'No notifications yet'}</p>
          </div>
        ) : (
          notifications?.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-colors ${!notification.isRead ? 'bg-primary/5 border-primary/20' : 'bg-background'}`}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1">
                  <h3 className={`font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    {new Date(notification.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notification.id)}>
                    {isBn ? 'পড়া হয়েছে' : 'Mark read'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
