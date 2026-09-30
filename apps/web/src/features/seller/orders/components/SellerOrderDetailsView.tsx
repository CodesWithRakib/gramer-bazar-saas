'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  ImageOff,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Truck,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomImage } from '@/components/ui/CustomImage';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StartChatButton } from '@/components/chat/StartChatButton';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getOrderStatusMeta, getPaymentMethodMeta, getPaymentStatusMeta } from '@/lib/order-status';
import { useGetSellerOrderByIdQuery } from '@/features/seller';
import { SellerOrderActions } from './SellerOrderActions';

export interface SellerOrderDetailsViewProps {
  lang?: string;
  id: string;
}

export function SellerOrderDetailsView({ lang = 'en', id }: SellerOrderDetailsViewProps) {
  const isBn = lang === 'bn';
  const { data: order, isLoading, isError, refetch } = useGetSellerOrderByIdQuery(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-56 lg:col-span-2" />
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <ErrorState
        isBn={isBn}
        title={isBn ? 'অর্ডার পাওয়া যায়নি' : 'Order not found'}
        message={
          isBn
            ? 'এই অর্ডারটি আপনার দোকানের নয় অথবা আর নেই।'
            : 'This order does not contain your shop’s items, or it no longer exists.'
        }
        onRetry={() => refetch()}
        secondaryAction={{
          label: isBn ? 'অর্ডার তালিকায় ফিরুন' : 'Back to orders',
          href: `/${lang}/seller/orders`,
        }}
      />
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const paymentMeta = getPaymentStatusMeta(order.paymentStatus);
  const paymentMethodMeta = getPaymentMethodMeta(order.paymentMethod);
  const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const timeline = [...order.statusHistory].reverse();

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'অর্ডার' : 'Orders', href: `/${lang}/seller/orders` },
          { label: order.reference },
        ]}
        title={`${isBn ? 'অর্ডার' : 'Order'} ${order.reference}`}
        description={`${formatDateTime(order.createdAt, lang)} · ${totalUnits} ${
          isBn ? 'ইউনিট' : totalUnits === 1 ? 'unit' : 'units'
        }`}
        badge={<StatusBadge tone={statusMeta.tone} label={isBn ? statusMeta.bn : statusMeta.en} />}
        secondaryActions={
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/${lang}/seller/orders`}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {isBn ? 'ফিরে যান' : 'Back'}
            </Link>
          </Button>
        }
      />

      {/* Primary action bar — kept above the fold so it is never buried */}
      {order.allowedNextStatuses.length > 0 && (
        <Card className="border-primary/30 shadow-none">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-foreground text-sm font-semibold">
                {isBn ? 'পরবর্তী ধাপ' : 'Next step'}
              </p>
              <p className="text-muted-foreground text-xs">
                {isBn
                  ? 'অর্ডার প্রক্রিয়া করতে নিচের কার্যক্রম ব্যবহার করুন।'
                  : 'Use the action below to move this order forward.'}
              </p>
            </div>
            <SellerOrderActions
              orderId={order.id}
              allowedNextStatuses={order.allowedNextStatuses}
              isBn={isBn}
              onTransitioned={() => refetch()}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Items */}
        <Card className="shadow-none lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              {isBn ? 'আইটেম' : 'Items'} ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-xs">
                {isBn ? 'এই অর্ডারে কোনো আইটেম নেই।' : 'No items in this order.'}
              </p>
            ) : (
              order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    {item.image ? (
                      <CustomImage
                        src={item.image}
                        alt={isBn ? item.nameBn : item.nameEn}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground/60 flex h-full w-full items-center justify-center">
                        <ImageOff className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground line-clamp-2 text-sm font-medium">
                      {isBn ? item.nameBn : item.nameEn}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))
            )}

            <div className="border-border mt-2 space-y-1.5 border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{isBn ? 'আপনার সাবটোটাল' : 'Your subtotal'}</span>
                <span className="text-foreground font-bold tabular-nums">
                  {formatCurrency(order.sellerSubtotal)}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                {isBn
                  ? 'ডেলিভারি চার্জ ও ছাড় পুরো অর্ডারের উপর হিসাব করা হয়, তাই এখানে দেখানো হয়নি।'
                  : 'Delivery fees and discounts are calculated across the full order, so they are not split out here.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Customer */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                {isBn ? 'গ্রাহক' : 'Customer'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <InfoRow label={isBn ? 'নাম' : 'Name'} value={order.customer.name} />
              {order.customer.phone && (
                <InfoRow
                  label={isBn ? 'ফোন' : 'Phone'}
                  value={
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {order.customer.phone}
                    </a>
                  }
                />
              )}
              {order.customer.contactName &&
                order.customer.contactName !== order.customer.name && (
                  <InfoRow
                    label={isBn ? 'প্রাপক' : 'Recipient'}
                    value={order.customer.contactName}
                  />
                )}
              {order.customer.streetAddress && (
                <div className="text-muted-foreground flex items-start gap-1.5 text-xs">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {order.customer.streetAddress}
                    {order.customer.upazila ? `, ${order.customer.upazila}` : ''}
                    {order.customer.district ? `, ${order.customer.district}` : ''}
                  </span>
                </div>
              )}

              {order.customerUserId && (
                <div className="border-border pt-3">
                  <StartChatButton
                    participantId={order.customerUserId}
                    lang={lang}
                    referenceId={order.id}
                    referenceType="ORDER"
                    buttonText={isBn ? 'গ্রাহকের সাথে কথা বলুন' : 'Message customer'}
                    redirectPath={`/${lang}/seller/messages`}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="h-4 w-4" />
                {isBn ? 'পেমেন্ট' : 'Payment'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">{isBn ? 'মাধ্যম' : 'Method'}</span>
                <span className="text-foreground text-sm font-medium">
                  {isBn ? paymentMethodMeta.bn : paymentMethodMeta.en}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">{isBn ? 'অবস্থা' : 'Status'}</span>
                <StatusBadge
                  tone={paymentMeta.tone}
                  label={isBn ? paymentMeta.bn : paymentMeta.en}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery */}
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                {isBn ? 'ডেলিভারি' : 'Delivery'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow
                label={isBn ? 'রাইডার' : 'Rider'}
                value={order.riderName ?? (isBn ? 'এখনও নিয়োগ হয়নি' : 'Not assigned yet')}
              />
              {order.riderPhone && (
                <InfoRow
                  label={isBn ? 'রাইডারের ফোন' : 'Rider Phone'}
                  value={
                    <a
                      href={`tel:${order.riderPhone}`}
                      className="text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {order.riderPhone}
                    </a>
                  }
                />
              )}
              <InfoRow
                label={isBn ? 'ডেলিভারি অবস্থা' : 'Delivery status'}
                value={
                  order.deliveryStatus
                    ? order.deliveryStatus.replace(/_/g, ' ')
                    : isBn
                      ? 'অপেক্ষমাণ'
                      : 'Pending'
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            {isBn ? 'অর্ডার ইতিহাস' : 'Order timeline'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <EmptyState
              className="min-h-[180px]"
              icon={<Clock className="h-7 w-7" />}
              title={isBn ? 'ইতিহাস নেই' : 'No history yet'}
              description={
                isBn
                  ? 'অবস্থা পরিবর্তনের সাথে সাথে এখানে রেকর্ড দেখা যাবে।'
                  : 'Status changes will be recorded here as the order progresses.'
              }
            />
          ) : (
            <ol className="relative space-y-4 ps-6">
              <span
                className="bg-border absolute start-2 top-1 bottom-1 w-px"
                aria-hidden
              />
              {timeline.map((entry, index) => {
                const meta = getOrderStatusMeta(entry.status);
                const isCurrent = index === timeline.length - 1;
                return (
                  <li key={`${entry.status}-${entry.createdAt}`} className="relative">
                    <span
                      className={`absolute -start-4 top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background ${
                        isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                      aria-hidden
                    >
                      {isCurrent ? (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      ) : (
                        <span className="bg-muted-foreground h-1.5 w-1.5 rounded-full" />
                      )}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={meta.tone} label={isBn ? meta.bn : meta.en} />
                      {isCurrent && (
                        <span className="text-muted-foreground text-[11px]">
                          {isBn ? 'বর্তমান অবস্থা' : 'Current'}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatDateTime(entry.createdAt, lang)}
                    </p>
                    {entry.note && (
                      <p className="text-foreground mt-1 flex items-start gap-1.5 text-xs">
                        <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
                        {entry.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0 text-xs">{label}</span>
      <span className="text-foreground text-end text-sm font-medium break-words">{value}</span>
    </div>
  );
}
