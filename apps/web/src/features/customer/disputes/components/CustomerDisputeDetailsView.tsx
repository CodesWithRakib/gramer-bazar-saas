'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import {
  useGetCustomerDisputeDetailsQuery,
  useAddCustomerDisputeMessageMutation,
} from '@/features/disputes/disputesApi';
import { getDisputeReasonLabel, getDisputeStatusMeta } from '@/features/disputes/dispute-display';
import { RootState } from '@/store/store';
import { customToast as toast } from '@/components/ui/custom-toast';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  ShieldAlert,
  Store,
  ReceiptText,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomImage } from '@/components/ui/CustomImage';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCurrency, formatDateTime, formatReference, formatTime } from '@/lib/format';

export interface CustomerDisputeDetailsViewProps {
  lang?: string;
  id: string;
}

export function CustomerDisputeDetailsView({ lang = 'en', id }: CustomerDisputeDetailsViewProps) {
  const isBn = lang === 'bn';
  const {
    data: dispute,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCustomerDisputeDetailsQuery(id);
  const [addMessage, { isLoading: isSending }] = useAddCustomerDisputeMessageMutation();
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
          isBn ? 'বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Failed to send message.'
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !dispute) {
    if (!isError && !dispute) {
      return (
        <div className="w-full space-y-6">
          <PageHeader
            breadcrumbs={[
              { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/customer` },
              { label: isBn ? 'অভিযোগ' : 'Disputes', href: `/${lang}/customer/disputes` },
            ]}
            title={isBn ? 'অভিযোগ খুঁজে পাওয়া যায়নি' : 'Dispute not found'}
          />
          <EmptyState
            icon={<ShieldAlert className="w-8 h-8 text-muted-foreground" />}
            title={isBn ? 'এই অভিযোগটি পাওয়া যায়নি' : 'This dispute could not be found'}
            description={
              isBn
                ? 'সম্ভবত এটি মুছে ফেলা হয়েছে অথবা লিংকটি সঠিক নয়।'
                : 'It may have been removed, or the link is incorrect.'
            }
            action={{
              label: isBn ? 'সকল অভিযোগ' : 'All disputes',
              href: `/${lang}/customer/disputes`,
            }}
          />
        </div>
      );
    }
    return (
      <div className="w-full space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/customer` },
            { label: isBn ? 'অভিযোগ' : 'Disputes', href: `/${lang}/customer/disputes` },
          ]}
          title={isBn ? 'অভিযোগের বিবরণ' : 'Dispute Details'}
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
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/customer` },
          { label: isBn ? 'অভিযোগ' : 'Disputes', href: `/${lang}/customer/disputes` },
          { label: formatReference(dispute.orderId) },
        ]}
        title={`${isBn ? 'অভিযোগ' : 'Dispute'} ${formatReference(dispute.orderId)}`}
        description={
          isBn
            ? 'সেলার ও সাপোর্ট টিমের সাথে এই অভিযোগ নিয়ে আলোচনা করুন।'
            : 'Discuss this claim with the seller and our support team.'
        }
        badge={<StatusBadge tone={statusMeta.tone} label={isBn ? statusMeta.bn : statusMeta.en} />}
        primaryAction={
          <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5">
            <Link href={`/${lang}/customer/disputes`}>
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {isBn ? 'সকল অভিযোগ' : 'All disputes'}
            </Link>
          </Button>
        }
      />

      {/* Order + reason summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/70 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-muted-foreground" />
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
            {dispute.order && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{isBn ? 'মোট' : 'Total'}</span>
                  <span className="font-semibold">{formatCurrency(dispute.order.total)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {isBn ? 'অর্ডারের তারিখ' : 'Ordered on'}
                  </span>
                  <span className="text-xs font-medium">
                    {formatDateTime(dispute.order.createdAt, lang)}
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {isBn ? 'অভিযোগের তারিখ' : 'Claim opened'}
              </span>
              <span className="text-xs font-medium">{formatDateTime(dispute.createdAt, lang)}</span>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full rounded-xl mt-1">
              <Link href={`/${lang}/customer/orders/${dispute.orderId}`}>
                {isBn ? 'অর্ডার দেখুন' : 'View order'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              {isBn ? 'অভিযোগের বিবরণ' : 'Claim details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                tone="neutral"
                label={getDisputeReasonLabel(dispute.reason, isBn)}
                className="font-medium"
              />
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {dispute.description}
            </p>

            {dispute.evidenceImages && dispute.evidenceImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {isBn ? 'সংযুক্ত প্রমাণ' : 'Attached evidence'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {dispute.evidenceImages.map((image, idx) => (
                    <a
                      key={`${image}-${idx}`}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <CustomImage
                        src={image}
                        alt={isBn ? `প্রমাণ ${idx + 1}` : `Evidence ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {dispute.adminDecision && (
              <div
                className={`rounded-xl border p-4 ${
                  dispute.status === 'RESOLVED_REFUNDED'
                    ? 'border-success/30 bg-success/5'
                    : 'border-destructive/25 bg-destructive/5'
                }`}
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {dispute.status === 'RESOLVED_REFUNDED' ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                  {isBn ? 'সাপোর্ট টিমের সিদ্ধান্ত' : 'Support team decision'}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-wrap">
                  {dispute.adminDecision}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message thread */}
      <Card className="rounded-2xl border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {isBn ? 'আলোচনার ইতিহাস' : 'Conversation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <p className="rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground">
              {isBn
                ? 'এখনো কোনো বার্তা নেই। সেলার বা সাপোর্ট টিমকে বার্তা পাঠান।'
                : 'No messages yet. Send a note to the seller or support team.'}
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
                      ? 'সেলার'
                      : 'Seller';
                return (
                  <li key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-ee-md'
                          : isSystem
                            ? 'bg-warning/10 text-foreground ring-1 ring-warning/25 rounded-es-md'
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
                          <Store className="h-3 w-3" />
                        )}
                        <span className="font-semibold">{authorLabel}</span>
                        <span aria-hidden>•</span>
                        <time dateTime={msg.createdAt}>{formatTime(msg.createdAt, lang)}</time>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {isResolved ? (
            <div className="rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
              {isBn
                ? 'এই অভিযোগটি নিষ্পত্তি হয়েছে এবং বন্ধ করা হয়েছে।'
                : 'This dispute has been resolved and is now closed.'}
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="relative">
              <label htmlFor="dispute-message" className="sr-only">
                {isBn ? 'আপনার বার্তা লিখুন' : 'Type your message'}
              </label>
              <textarea
                id="dispute-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
                placeholder={isBn ? 'আপনার বার্তা এখানে লিখুন...' : 'Type your message here...'}
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pe-14 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
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
