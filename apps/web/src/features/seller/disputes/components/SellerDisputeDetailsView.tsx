'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ReceiptText,
  Send,
  ShieldAlert,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useAddSellerDisputeMessageMutation,
  useGetSellerDisputeDetailsQuery,
} from '@/features/disputes/disputesApi';
import {
  getDisputeReasonLabel,
  getDisputeStatusMeta,
} from '@/features/disputes/dispute-display';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDateTime, formatReference, formatTime } from '@/lib/format';

export interface SellerDisputeDetailsViewProps {
  lang?: string;
  id: string;
}

export function SellerDisputeDetailsView({ lang = 'en', id }: SellerDisputeDetailsViewProps) {
  const isBn = lang === 'bn';
  const {
    data: dispute,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSellerDisputeDetailsQuery(id);
  const [addMessage, { isLoading: isSending }] = useAddSellerDisputeMessageMutation();
  const [message, setMessage] = useState('');

  const user = useSelector((state: RootState) => state.auth.user);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await addMessage({ id, message: message.trim() }).unwrap();
      setMessage('');
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isBn ? 'বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to send message.',
        ),
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !dispute) {
    if (!isError && !dispute) {
      return (
        <div className="w-full space-y-6">
          <PageHeader
            breadcrumbs={[
              { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
              { label: isBn ? 'অভিযোগ' : 'Disputes', href: `/${lang}/seller/disputes` },
            ]}
            title={isBn ? 'অভিযোগ পাওয়া যায়নি' : 'Dispute not found'}
          />
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8 text-muted-foreground" />}
            title={isBn ? 'এই অভিযোগটি পাওয়া যায়নি' : 'This dispute could not be found'}
            description={
              isBn
                ? 'সম্ভবত এটি মুছে ফেলা হয়েছে অথবা লিংকটি সঠিক নয়।'
                : 'It may have been removed, or the link is incorrect.'
            }
            action={{
              label: isBn ? 'সকল অভিযোগ' : 'All disputes',
              href: `/${lang}/seller/disputes`,
            }}
          />
        </div>
      );
    }
    return (
      <div className="w-full space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
            { label: isBn ? 'অভিযোগ' : 'Disputes', href: `/${lang}/seller/disputes` },
          ]}
          title={isBn ? 'অভিযোগের বিবরণ' : 'Dispute details'}
        />
        <ErrorState
          isBn={isBn}
          title={isBn ? 'অভিযোগ লোড করা যায়নি' : 'Failed to load dispute'}
          message={
            getApiErrorMessage(error, '') ||
            (isBn
              ? 'সার্ভার থেকে অভিযোগের তথ্য সংগ্রহ করা যায়নি।'
              : 'Unable to retrieve this dispute from the server.')
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const statusMeta = getDisputeStatusMeta(dispute.status);
  const isResolved =
    dispute.status === 'RESOLVED_REFUNDED' || dispute.status === 'RESOLVED_REJECTED';
  const messages = dispute.messages ?? [];

  return (
    <div className="w-full space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'অভিযোগ' : 'Disputes', href: `/${lang}/seller/disputes` },
          { label: formatReference(dispute.orderId) },
        ]}
        title={`${isBn ? 'অভিযোগ' : 'Dispute'} ${formatReference(dispute.orderId)}`}
        description={
          isBn
            ? 'গ্রাহকের সাথে এই অভিযোগ নিয়ে আলোচনা করুন এবং সমাধান করুন।'
            : 'Discuss this claim with the customer and our support team.'
        }
        badge={<StatusBadge tone={statusMeta.tone} label={isBn ? statusMeta.bn : statusMeta.en} />}
        primaryAction={
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/${lang}/seller/disputes`}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {isBn ? 'সকল অভিযোগ' : 'All disputes'}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Order + customer summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ReceiptText className="text-muted-foreground h-4 w-4" />
              {isBn ? 'অর্ডারের তথ্য' : 'Order information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{isBn ? 'অর্ডার নম্বর' : 'Order ID'}</span>
              <span className="font-mono text-xs font-semibold">
                {formatReference(dispute.orderId)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{isBn ? 'গ্রাহক' : 'Customer'}</span>
              <span className="font-medium">
                {dispute.customer?.firstName} {dispute.customer?.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{isBn ? 'কারণ' : 'Reason'}</span>
              <span className="font-medium">
                {getDisputeReasonLabel(dispute.reason, isBn)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {isBn ? 'অভিযোগের তারিখ' : 'Claim opened'}
              </span>
              <span className="text-xs font-medium">
                {formatDateTime(dispute.createdAt, lang)}
              </span>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-1 w-full">
              <Link href={`/${lang}/seller/orders/${dispute.orderId}`}>
                {isBn ? 'অর্ডার দেখুন' : 'View order'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Claim description */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert className="text-muted-foreground h-4 w-4" />
              {isBn ? 'অভিযোগের বিবরণ' : 'Claim details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {dispute.description}
            </p>

            {dispute.adminDecision && (
              <div
                className={`rounded-xl border p-4 ${
                  dispute.status === 'RESOLVED_REFUNDED'
                    ? 'border-success/30 bg-success/5'
                    : 'border-destructive/25 bg-destructive/5'
                }`}
              >
                <p className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  {dispute.status === 'RESOLVED_REFUNDED' ? (
                    <CheckCircle2 className="text-success h-4 w-4" />
                  ) : (
                    <AlertTriangle className="text-destructive h-4 w-4" />
                  )}
                  {isBn ? 'সাপোর্ট টিমের সিদ্ধান্ত' : 'Support team decision'}
                </p>
                <p className="text-muted-foreground mt-1.5 text-sm whitespace-pre-wrap">
                  {dispute.adminDecision}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message thread */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {isBn ? 'আলোচনার ইতিহাস' : 'Conversation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-muted-foreground rounded-xl bg-muted/40 p-4 text-center text-sm">
              {isBn
                ? 'এখনো কোনো বার্তা নেই। গ্রাহককে বার্তা পাঠিয়ে সমাধানে সাহায্য করুন।'
                : 'No messages yet. Send a note to move the resolution forward.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const isSystem = msg.senderRole === 'ADMIN';
                const authorLabel = isMe
                  ? isBn
                    ? 'আপনি'
                    : 'You'
                  : isSystem
                    ? isBn
                      ? 'সাপোর্ট টিম'
                      : 'Support Team'
                    : isBn
                      ? 'গ্রাহক'
                      : 'Customer';
                return (
                  <li key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-ee-md'
                          : isSystem
                            ? 'bg-warning/10 text-foreground ring-warning/25 rounded-es-md ring-1'
                            : 'bg-muted text-foreground rounded-es-md'
                      }`}
                    >
                      <div
                        className={`mb-1 flex items-center gap-1.5 text-[11px] ${
                          isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        {isSystem ? (
                          <ShieldAlert className="h-3 w-3" />
                        ) : isMe ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span className="font-semibold">{authorLabel}</span>
                        <span aria-hidden>•</span>
                        <time dateTime={msg.createdAt}>{formatTime(msg.createdAt, lang)}</time>
                      </div>
                      <p className="text-sm break-words whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {isResolved ? (
            <div className="text-muted-foreground rounded-xl bg-muted/50 p-4 text-center text-sm">
              {isBn
                ? 'এই অভিযোগটি নিষ্পত্তি হয়েছে এবং বন্ধ করা হয়েছে।'
                : 'This dispute has been resolved and is now closed.'}
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="relative">
              <label htmlFor="seller-dispute-message" className="sr-only">
                {isBn ? 'আপনার বার্তা লিখুন' : 'Type your message'}
              </label>
              <textarea
                id="seller-dispute-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
                placeholder={isBn ? 'আপনার বার্তা এখানে লিখুন...' : 'Type your message here...'}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-none rounded-xl border px-4 py-3 pe-14 text-sm focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60"
              />
              <Button
                type="submit"
                size="icon"
                aria-label={isBn ? 'বার্তা পাঠান' : 'Send message'}
                disabled={isSending || !message.trim()}
                className="absolute bottom-3 end-3 h-9 w-9 rounded-full"
              >
                <Send className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
