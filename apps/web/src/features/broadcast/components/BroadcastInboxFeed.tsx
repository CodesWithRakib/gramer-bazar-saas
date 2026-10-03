'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Megaphone,
  CheckCheck,
  Check,
  Search,
  MessageSquare,
  BadgeCheck,
  Loader2,
  RefreshCw,
  Bell,
  Sparkles,
  ExternalLink,
  Copy,
  Radio,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast/toast-store';
import {
  useGetMyBroadcastMessagesQuery,
  useMarkBroadcastMessageReadMutation,
  useMarkAllBroadcastMessagesReadMutation,
  UserBroadcastMessage,
} from '../userBroadcastApi';

interface BroadcastInboxFeedProps {
  role: 'customer' | 'seller' | 'rider';
  messagesRoute?: string;
}

export function BroadcastInboxFeed({ role, messagesRoute }: BroadcastInboxFeedProps) {
  const params = useParams();
  const isBn = params.lang === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetMyBroadcastMessagesQuery({
    search: searchQuery || undefined,
    unreadOnly: filterMode === 'unread' ? true : undefined,
  });

  const [markRead, { isLoading: isMarkingRead }] = useMarkBroadcastMessageReadMutation();
  const [markAllRead, { isLoading: isMarkingAllRead }] =
    useMarkAllBroadcastMessagesReadMutation();

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
      toast.success(isBn ? 'পড়া হয়েছে হিসেবে চিহ্নিত' : 'Marked as read');
    } catch {
      toast.error(isBn ? 'ব্যর্থ হয়েছে' : 'Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success(isBn ? 'সকল বার্তা পড়া হয়েছে' : 'All messages marked as read');
    } catch {
      toast.error(isBn ? 'ব্যর্থ হয়েছে' : 'Failed to mark all as read');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(isBn ? 'বার্তা কপি করা হয়েছে' : 'Message copied to clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const chatUrl = messagesRoute || `/${params.lang || 'en'}/${role}/messages`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Official Channel Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 shadow-md">
        <div className="absolute right-0 top-0 -mt-4 -mr-4 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
              <Megaphone className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  {isBn ? 'গ্রামের বাজার অফিসিয়াল চ্যানেল' : 'Gramer Bazar Official Channel'}
                </h1>
                <BadgeCheck className="h-6 w-6 text-emerald-200 fill-emerald-500" />
              </div>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                {isBn
                  ? 'প্ল্যাটফর্মের গুরুত্বপূর্ণ ঘোষণা, বিশেষ ছাড় ও আপডেটসমূহ এখানে সরাসরি প্রদর্শিত হয়। ভবিষ্যতে এগুলো সরাসরি আপনার হোয়াটসঅ্যাপেও পাঠানো হবে।'
                  : 'Official announcements, exclusive promotions, and urgent notices. In the future, these will also be delivered directly to your WhatsApp.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link href={chatUrl} className="w-full md:w-auto">
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-semibold gap-2 shadow-xs"
              >
                <MessageSquare className="h-4 w-4" />
                {isBn ? 'ইনবক্স চ্যাটে দেখুন' : 'View in Chat'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Channel Status Pill */}
        <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 font-medium">
              <Radio className="h-3 w-3 animate-pulse text-emerald-200" />
              {isBn ? 'লাইভ সম্প্রচার সক্রিয়' : 'Live Broadcast Active'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              {isBn ? 'হোয়াটসঅ্যাপ মেসেজিং কানেক্টর প্রস্তুত' : 'WhatsApp Connector Ready'}
            </span>
          </div>
          {data?.meta?.unreadCount !== undefined && data.meta.unreadCount > 0 && (
            <Badge className="bg-amber-400 text-amber-950 font-bold hover:bg-amber-400 border-none">
              {data.meta.unreadCount} {isBn ? 'টি নতুন অপঠিত ঘোষণা' : 'New Unread Messages'}
            </Badge>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isBn ? 'ঘোষণা খুঁজুন...' : 'Search broadcasts...'}
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <div className="inline-flex p-1 bg-muted rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    filterMode === 'all'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isBn ? 'সকল ঘোষণা' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('unread')}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    filterMode === 'unread'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{isBn ? 'অপঠিত' : 'Unread'}</span>
                  {data?.meta?.unreadCount ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground text-[10px]">
                      {data.meta.unreadCount}
                    </span>
                  ) : null}
                </button>
              </div>

              {data?.meta?.unreadCount && data.meta.unreadCount > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAllRead}
                  className="text-xs h-9"
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                  )}
                  {isBn ? 'সব পড়া হয়েছে' : 'Mark All Read'}
                </Button>
              ) : null}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 w-9 text-muted-foreground"
                title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Broadcast Message Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-48 bg-muted rounded" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
                <div className="h-16 bg-muted/60 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <Card className="border-dashed border-2 text-center py-16">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Bell className="h-7 w-7 opacity-60" />
            </div>
            <h3 className="font-semibold text-lg">
              {isBn ? 'কোনো ঘোষণা পাওয়া যায়নি' : 'No Broadcast Messages Found'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {isBn
                ? 'বর্তমানে আপনার জন্য কোনো নতুন ঘোষণা নেই। প্ল্যাটফর্মের অফার ও আপডেট আসলে তা এখানে দেখতে পাবেন।'
                : 'There are no active broadcast messages matching your criteria right now. Check back soon for updates.'}
            </p>
            {filterMode === 'unread' && (
              <Button variant="outline" size="sm" onClick={() => setFilterMode('all')}>
                {isBn ? 'সকল ঘোষণা দেখুন' : 'Show All Broadcasts'}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.data.map((msg: UserBroadcastMessage) => {
            const isUnread = !msg.isRead;

            return (
              <Card
                key={msg.id}
                className={`transition-all border hover:shadow-md overflow-hidden ${
                  isUnread
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-border/80 bg-card'
                }`}
              >
                <div
                  className={`h-1 w-full ${
                    isUnread ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-transparent'
                  }`}
                />
                <CardHeader className="pb-3 pt-4 px-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        GB
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CardTitle className="text-base font-semibold text-foreground">
                            {msg.title}
                          </CardTitle>
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <CardDescription className="text-xs flex items-center gap-2 mt-0.5">
                          <span>Gramer Bazar Official</span>
                          <span>•</span>
                          <span>
                            {msg.createdAt
                              ? format(new Date(msg.createdAt), 'dd MMM yyyy, hh:mm a')
                              : ''}
                          </span>
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {msg.isRead ? (
                        <Badge
                          variant="outline"
                          className="text-[11px] text-muted-foreground border-border/80 gap-1 font-normal"
                        >
                          <CheckCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                          {isBn ? 'পড়া হয়েছে' : 'Read'}
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold gap-1">
                          <Sparkles className="h-3 w-3" />
                          {isBn ? 'নতুন ঘোষণা' : 'New'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-0 space-y-4">
                  {/* Message Body Styled like a WhatsApp Broadcast Note */}
                  <div className="p-4 rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/60 text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                    {msg.message}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(msg.id, msg.message)}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedId === msg.id
                          ? isBn
                            ? 'কপি হয়েছে'
                            : 'Copied!'
                          : isBn
                            ? 'কপি করুন'
                            : 'Copy Text'}
                      </Button>
                      <Link href={chatUrl}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {isBn ? 'চ্যাটে খুলুন' : 'Open in Chat'}
                        </Button>
                      </Link>
                    </div>

                    {isUnread && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRead(msg.id)}
                        disabled={isMarkingRead}
                        className="h-8 text-xs border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {isBn ? 'পড়া হয়েছে চিহ্নিত করুন' : 'Mark as Read'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
